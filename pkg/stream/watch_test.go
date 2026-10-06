package stream

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	dynamicfake "k8s.io/client-go/dynamic/fake"
	k8stesting "k8s.io/client-go/testing"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

var podsGVR = schema.GroupVersionResource{Version: "v1", Resource: "pods"}

type wireEvent struct {
	Type   string `json:"type"`
	Object struct {
		Metadata struct {
			Name string `json:"name"`
		} `json:"metadata"`
	} `json:"object"`
	Status *metav1.Status `json:"status"`
}

type watchFixture struct {
	srv     *httptest.Server
	watches chan k8stesting.WatchAction
	fakes   chan *watch.FakeWatcher
	done    chan struct{} // closed when the handler returns
}

func newWatchFixture(t *testing.T) *watchFixture {
	t.Helper()
	f := &watchFixture{
		watches: make(chan k8stesting.WatchAction, 1),
		fakes:   make(chan *watch.FakeWatcher, 1),
		done:    make(chan struct{}, 1),
	}
	dyn := dynamicfake.NewSimpleDynamicClientWithCustomListKinds(runtime.NewScheme(), map[schema.GroupVersionResource]string{podsGVR: "PodList"})
	dyn.PrependWatchReactor("pods", func(a k8stesting.Action) (bool, watch.Interface, error) {
		fw := watch.NewFake()
		f.watches <- a.(k8stesting.WatchAction)
		f.fakes <- fw
		return true, fw, nil
	})
	p := &clustertest.Provider{
		Infos:    []cluster.Info{{ID: "dev-1"}},
		Dynamics: map[string]dynamic.Interface{"dev-1": dyn},
	}
	h := WatchHandler(p, slog.New(slog.DiscardHandler))
	mux := http.NewServeMux()
	mux.HandleFunc("/api/clusters/{id}/watch", func(w http.ResponseWriter, r *http.Request) {
		h.ServeHTTP(w, r)
		select {
		case f.done <- struct{}{}:
		default: // nobody waiting (e.g. plain HTTP error responses)
		}
	})
	f.srv = httptest.NewServer(mux)
	t.Cleanup(f.srv.Close)
	return f
}

func (f *watchFixture) dial(t *testing.T, query string) (*websocket.Conn, *watch.FakeWatcher, k8stesting.WatchAction) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	url := "ws" + strings.TrimPrefix(f.srv.URL, "http") + "/api/clusters/dev-1/watch?" + query
	conn, resp, err := websocket.Dial(ctx, url, nil)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	if resp.Body != nil {
		_ = resp.Body.Close()
	}
	t.Cleanup(func() { _ = conn.CloseNow() })
	select {
	case a := <-f.watches:
		return conn, <-f.fakes, a
	case <-time.After(5 * time.Second):
		t.Fatal("watch never started")
		return nil, nil, nil
	}
}

func pod(name string) *unstructured.Unstructured {
	u := &unstructured.Unstructured{}
	u.SetAPIVersion("v1")
	u.SetKind("Pod")
	u.SetNamespace("default")
	u.SetName(name)
	return u
}

func read(t *testing.T, conn *websocket.Conn) wireEvent {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var ev wireEvent
	if err := wsjson.Read(ctx, conn, &ev); err != nil {
		t.Fatalf("read: %v", err)
	}
	return ev
}

func TestWatchStreamsEvents(t *testing.T) {
	f := newWatchFixture(t)
	conn, fw, action := f.dial(t, "version=v1&resource=pods&namespace=default&resourceVersion=42&fieldSelector=metadata.name%3Dweb")

	r := action.GetWatchRestrictions()
	if action.GetNamespace() != "default" || r.ResourceVersion != "42" || r.Fields.String() != "metadata.name=web" {
		t.Fatalf("upstream watch: ns=%q rv=%q fields=%q", action.GetNamespace(), r.ResourceVersion, r.Fields)
	}

	fw.Add(pod("web"))
	fw.Modify(pod("web"))
	fw.Delete(pod("web"))
	for _, want := range []string{"ADDED", "MODIFIED", "DELETED"} {
		if ev := read(t, conn); ev.Type != want || ev.Object.Metadata.Name != "web" {
			t.Fatalf("got %s %q, want %s web", ev.Type, ev.Object.Metadata.Name, want)
		}
	}
}

func TestWatchReportsExpiredResourceVersion(t *testing.T) {
	f := newWatchFixture(t)
	conn, fw, _ := f.dial(t, "version=v1&resource=pods&resourceVersion=1")

	fw.Error(&metav1.Status{Status: metav1.StatusFailure, Code: http.StatusGone, Reason: metav1.StatusReasonExpired, Message: "too old"})

	ev := read(t, conn)
	if ev.Type != "ERROR" || ev.Status == nil || ev.Status.Code != http.StatusGone {
		t.Fatalf("got %+v, want ERROR with code 410", ev)
	}
	if _, _, err := conn.Read(context.Background()); websocket.CloseStatus(err) != websocket.StatusNormalClosure {
		t.Fatalf("want normal close after error, got %v", err)
	}
}

func TestWatchEndClosesSocketNormally(t *testing.T) {
	f := newWatchFixture(t)
	conn, fw, _ := f.dial(t, "version=v1&resource=pods")
	fw.Stop()
	if _, _, err := conn.Read(context.Background()); websocket.CloseStatus(err) != websocket.StatusNormalClosure {
		t.Fatalf("want normal close when the upstream watch ends, got %v", err)
	}
}

func TestBrowserDisconnectStopsUpstreamWatch(t *testing.T) {
	f := newWatchFixture(t)
	conn, fw, _ := f.dial(t, "version=v1&resource=pods")

	_ = conn.Close(websocket.StatusGoingAway, "tab closed")

	select {
	case <-f.done:
	case <-time.After(5 * time.Second):
		t.Fatal("handler still running after the browser disconnected")
	}
	if !fw.IsStopped() {
		t.Fatal("upstream watch not stopped")
	}
}

func TestWatchRejectsBadRequests(t *testing.T) {
	f := newWatchFixture(t)
	cases := map[string]int{
		"/api/clusters/dev-1/watch?version=v1":                                 http.StatusBadRequest,
		"/api/clusters/dev-1/watch?resource=pods":                              http.StatusBadRequest,
		"/api/clusters/dev-1/watch?version=v1&resource=pods&namespace=Bad_NS":  http.StatusBadRequest,
		"/api/clusters/prod/watch?version=v1&resource=pods":                    http.StatusNotFound,
		"/api/clusters/dev-1/watch?version=v1&resource=pods&group=apps%2Fevil": http.StatusBadRequest,
	}
	for path, want := range cases {
		resp, err := http.Get(f.srv.URL + path) //nolint:noctx // test
		if err != nil {
			t.Fatal(err)
		}
		_ = resp.Body.Close()
		if resp.StatusCode != want {
			t.Errorf("%s: status %d, want %d", path, resp.StatusCode, want)
		}
	}
}

func TestStatusOf(t *testing.T) {
	if st := statusOf(errors.New("dial tcp: refused")); st.Code != http.StatusBadGateway {
		t.Errorf("plain error -> %d, want 502", st.Code)
	}
}
