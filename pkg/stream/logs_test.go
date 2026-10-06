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
	"github.com/coder/websocket/wsjson"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

func logsServer(t *testing.T) *httptest.Server {
	t.Helper()
	client := fake.NewClientset(&corev1.Pod{ObjectMeta: metav1.ObjectMeta{Namespace: "demo", Name: "web"}})
	p := &clustertest.Provider{
		Infos:   []cluster.Info{{ID: "dev-1"}},
		Clients: map[string]kubernetes.Interface{"dev-1": client},
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/logs", LogsHandler(p, slog.New(slog.DiscardHandler)))
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv
}

func TestLogsStreamsThenEnds(t *testing.T) {
	srv := logsServer(t)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conn, resp, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(srv.URL, "http")+"/api/clusters/dev-1/logs?namespace=demo&pod=web&container=app", nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.Body != nil {
		_ = resp.Body.Close()
	}
	defer conn.CloseNow() //nolint:errcheck

	var got []LogMessage
	for {
		var m LogMessage
		if err := wsjson.Read(ctx, conn, &m); err != nil {
			if websocket.CloseStatus(err) != websocket.StatusNormalClosure {
				t.Fatalf("want normal close, got %v", err)
			}
			break
		}
		got = append(got, m)
	}
	// client-go's fake returns the fixed body "fake logs".
	if len(got) != 2 || got[0].Type != "log" || got[0].Data != "fake logs" || got[1].Type != "end" {
		t.Fatalf("messages = %+v", got)
	}
}

func TestLogsRejectsBadRequests(t *testing.T) {
	srv := logsServer(t)
	cases := map[string]int{
		"/api/clusters/dev-1/logs?pod=web":                                   http.StatusBadRequest,
		"/api/clusters/dev-1/logs?namespace=demo":                            http.StatusBadRequest,
		"/api/clusters/dev-1/logs?namespace=demo&pod=web&tailLines=-1":       http.StatusBadRequest,
		"/api/clusters/dev-1/logs?namespace=demo&pod=web&tailLines=99999999": http.StatusBadRequest,
		"/api/clusters/dev-1/logs?namespace=demo&pod=web&container=A_B":      http.StatusBadRequest,
		"/api/clusters/prod/logs?namespace=demo&pod=web":                     http.StatusNotFound,
	}
	for path, want := range cases {
		resp, err := http.Get(srv.URL + path) //nolint:noctx // test
		if err != nil {
			t.Fatal(err)
		}
		_ = resp.Body.Close()
		if resp.StatusCode != want {
			t.Errorf("%s: status %d, want %d", path, resp.StatusCode, want)
		}
	}
}

func TestParseLogsDefaults(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/x?namespace=demo&pod=web", nil)
	req, problem := parseLogs(r)
	if problem != "" {
		t.Fatal(problem)
	}
	if !req.opts.Follow || req.opts.Previous || *req.opts.TailLines != defaultTailLines {
		t.Fatalf("defaults = %+v", req.opts)
	}
	r = httptest.NewRequest(http.MethodGet, "/x?namespace=demo&pod=web&previous=true", nil)
	if req, _ = parseLogs(r); req.opts.Follow {
		t.Fatal("previous logs must not follow")
	}
}
