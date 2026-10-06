package proxy

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"k8s.io/client-go/rest"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

type seen struct {
	path, query, auth, cookie, impersonate string
}

// upstream fakes a kube-apiserver and records what reached it.
func upstream(t *testing.T) (*httptest.Server, *seen) {
	t.Helper()
	got := &seen{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		*got = seen{
			path: r.URL.Path, query: r.URL.RawQuery, auth: r.Header.Get("Authorization"),
			cookie: r.Header.Get("Cookie"), impersonate: r.Header.Get("Impersonate-User"),
		}
		w.Header().Set("Set-Cookie", "upstream=1")
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `{"kind":"PodList","items":[]}`)
	}))
	t.Cleanup(srv.Close)
	return srv, got
}

func serve(t *testing.T, srv *httptest.Server, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	p := &clustertest.Provider{
		Infos:   []cluster.Info{{ID: "dev-1"}, {ID: "dev-2"}},
		Configs: map[string]*rest.Config{"dev-1": {Host: srv.URL, BearerToken: "cluster-token"}},
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/k8s/{path...}", Handler(p, slog.New(slog.DiscardHandler)))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	return rec
}

func TestForwardsReadsWithClusterCredentials(t *testing.T) {
	srv, got := upstream(t)
	req := httptest.NewRequest(http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/pods?limit=5&labelSelector=app%3Dweb", nil)
	req.Header.Set("Authorization", "Bearer browser-token")
	req.Header.Set("Cookie", "session=abc")
	req.Header.Set("Impersonate-User", "admin")

	rec := serve(t, srv, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d: %s", rec.Code, rec.Body)
	}
	if got.path != "/api/v1/namespaces/default/pods" || got.query != "limit=5&labelSelector=app%3Dweb" {
		t.Errorf("upstream got %s?%s", got.path, got.query)
	}
	if got.auth != "Bearer cluster-token" {
		t.Errorf("upstream auth = %q, want the cluster's credentials only", got.auth)
	}
	if got.cookie != "" || got.impersonate != "" {
		t.Errorf("browser headers leaked: cookie=%q impersonate=%q", got.cookie, got.impersonate)
	}
	if rec.Header().Get("Set-Cookie") != "" {
		t.Error("upstream Set-Cookie must not reach the browser")
	}
	if !json.Valid(rec.Body.Bytes()) {
		t.Error("body not passed through")
	}
}

func TestRefusesUnsafeRequests(t *testing.T) {
	srv, _ := upstream(t)
	cases := []struct {
		name, method, url string
		upgrade           bool
		want              int
	}{
		{"write", http.MethodPost, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/pods", false, http.StatusMethodNotAllowed},
		{"delete", http.MethodDelete, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/pods/x", false, http.StatusMethodNotAllowed},
		{"exec", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/pods/x/exec?command=sh", false, http.StatusForbidden},
		{"attach", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/pods/x/attach", false, http.StatusForbidden},
		{"service proxy", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/namespaces/default/services/web/proxy/", false, http.StatusForbidden},
		{"node proxy", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/nodes/n1/proxy/metrics", false, http.StatusForbidden},
		{"upgrade", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/pods", true, http.StatusForbidden},
		{"watch", http.MethodGet, "/api/clusters/dev-1/k8s/api/v1/pods?watch=true", false, http.StatusBadRequest},
		{"non-api path", http.MethodGet, "/api/clusters/dev-1/k8s/healthz", false, http.StatusForbidden},
		{"metrics", http.MethodGet, "/api/clusters/dev-1/k8s/metrics", false, http.StatusForbidden},
		{"unknown cluster", http.MethodGet, "/api/clusters/prod/k8s/api/v1/pods", false, http.StatusNotFound},
		{"cluster down", http.MethodGet, "/api/clusters/dev-2/k8s/api/v1/pods", false, http.StatusBadGateway},
	}
	for _, tc := range cases {
		req := httptest.NewRequest(tc.method, tc.url, nil)
		if tc.upgrade {
			req.Header.Set("Connection", "Upgrade")
			req.Header.Set("Upgrade", "websocket")
		}
		if rec := serve(t, srv, req); rec.Code != tc.want {
			t.Errorf("%s: status = %d, want %d (%s)", tc.name, rec.Code, tc.want, rec.Body)
		}
	}
}

func TestAllowsReadSubresources(t *testing.T) {
	srv, got := upstream(t)
	for _, path := range []string{
		"/api/v1/namespaces/default/pods/x/log",
		"/apis/apps/v1/namespaces/default/deployments/web/scale",
		"/api/v1/namespaces/default",
		"/apis/apps/v1",
		"/version",
	} {
		rec := serve(t, srv, httptest.NewRequest(http.MethodGet, "/api/clusters/dev-1/k8s"+path, nil))
		if rec.Code != http.StatusOK || got.path != path {
			t.Errorf("%s: status %d, upstream path %q", path, rec.Code, got.path)
		}
	}
}

func TestSubresource(t *testing.T) {
	cases := map[string]string{
		"/api/v1/pods":                                    "",
		"/api/v1/namespaces/ns":                           "",
		"/api/v1/namespaces/ns/pods":                      "",
		"/api/v1/namespaces/ns/pods/p":                    "",
		"/api/v1/namespaces/ns/pods/p/exec":               "exec",
		"/api/v1/nodes/n/proxy/metrics":                   "proxy",
		"/apis/apps/v1/namespaces/ns/deployments/d/scale": "scale",
		"/apis/apps/v1/deployments":                       "",
	}
	for path, want := range cases {
		if got := subresource(path); got != want {
			t.Errorf("subresource(%q) = %q, want %q", path, got, want)
		}
	}
}
