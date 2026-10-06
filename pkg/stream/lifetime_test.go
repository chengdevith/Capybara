package stream

import (
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	dynamicfake "k8s.io/client-go/dynamic/fake"
	k8stesting "k8s.io/client-go/testing"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

func TestWatchClosesWhenClusterCredentialsChange(t *testing.T) {
	dyn := dynamicfake.NewSimpleDynamicClientWithCustomListKinds(runtime.NewScheme(),
		map[schema.GroupVersionResource]string{{Version: "v1", Resource: "pods"}: "PodList"})
	fw := watch.NewFake()
	dyn.PrependWatchReactor("pods", func(k8stesting.Action) (bool, watch.Interface, error) { return true, fw, nil })
	lifetime, end := context.WithCancelCause(context.Background())
	p := &clustertest.Provider{
		Infos:    []cluster.Info{{ID: "dev-1"}},
		Dynamics: map[string]dynamic.Interface{"dev-1": dyn},
		Contexts: map[string]context.Context{"dev-1": lifetime},
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/watch", WatchHandler(p, slog.New(slog.DiscardHandler)))
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	conn, resp, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(srv.URL, "http")+"/api/clusters/dev-1/watch?version=v1&resource=pods", nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.Body != nil {
		_ = resp.Body.Close()
	}
	defer conn.CloseNow() //nolint:errcheck

	end(cluster.ErrCredentialsChanged)
	_, _, err = conn.Read(ctx)
	var ce websocket.CloseError
	if !asClose(err, &ce) || ce.Code != websocket.StatusGoingAway || !strings.Contains(ce.Reason, "credentials changed") {
		t.Fatalf("close = %v", err)
	}
	deadline := time.Now().Add(2 * time.Second)
	for !fw.IsStopped() && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond) // the handler stops it right after closing
	}
	if !fw.IsStopped() {
		t.Fatal("upstream watch not stopped")
	}
}

func asClose(err error, ce *websocket.CloseError) bool {
	if err == nil {
		return false
	}
	code := websocket.CloseStatus(err)
	if code == -1 {
		return false
	}
	ce.Code = code
	ce.Reason = err.Error()
	return true
}

func TestExecEndsWhenClusterIsRemoved(t *testing.T) {
	f := newExecFixture(t, time.Hour, time.Hour)
	lifetime, end := context.WithCancelCause(context.Background())
	f.setLifetime(lifetime)
	conn := f.dial(t, "app")
	<-f.shell.urls
	readUntil(t, conn, "$ ")

	end(cluster.ErrClusterRemoved)
	_, m := readUntil(t, conn, "")
	if m == nil || m.Type != "notice" || !strings.Contains(m.Message, "cluster removed") {
		t.Fatalf("control = %+v", m)
	}
	if recs := f.records(t); recs[0].Action != "exec-close" || !strings.Contains(recs[0].Detail, "cluster removed") {
		t.Fatalf("audit = %+v", recs)
	}
}
