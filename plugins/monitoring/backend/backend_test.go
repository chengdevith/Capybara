package main

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestTargetsAreValidatedAndQuoted(t *testing.T) {
	for _, bad := range []Target{
		{Kind: "pod", Namespace: `a"}`, Name: "x"},
		{Kind: "pod", Namespace: "ns", Name: "x\n"},
		{Kind: "deployment", Namespace: "ns", Name: ".*"},
		{Kind: "node", Name: `n"} or vector(1)`},
		{Kind: "secret", Namespace: "ns", Name: "x"},
	} {
		if bad.validate() == nil {
			t.Errorf("%+v accepted", bad)
		}
	}
	cpu, mem := Target{Kind: "deployment", Namespace: "shop", Name: "web.api"}.Series()
	if !strings.Contains(cpu, `pod=~"web\\.api-[a-z0-9]{5,10}-[a-z0-9]{5}"`) || !strings.HasPrefix(cpu, "sum by (pod)") {
		t.Errorf("deployment cpu = %s", cpu)
	}
	if !strings.Contains(mem, "container_memory_working_set_bytes") {
		t.Errorf("memory = %s", mem)
	}
	if c, _ := (Target{Kind: "node", Name: "n1"}).Capacity(); c != `sum(machine_cpu_cores{node="n1"})` {
		t.Errorf("capacity = %s", c)
	}
}

func TestBackendThroughCapybara(t *testing.T) {
	dir := t.TempDir()
	tokenFile := filepath.Join(dir, "monitoring.token")
	_ = os.WriteFile(tokenFile, []byte("old"), 0o600)
	var calls atomic.Int32
	capybara := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		if r.Header.Get("Authorization") != "Bearer new" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if strings.Contains(r.URL.Path, "/clusters/dev-2/") {
			w.WriteHeader(http.StatusForbidden)
			_, _ = io.WriteString(w, `{"error":"monitoring is not installed on dev-2"}`)
			return
		}
		if !strings.HasPrefix(r.URL.Path, "/internal/plugins/monitoring/clusters/dev-1/services/prometheus/api/v1/query") {
			t.Errorf("unexpected path %s", r.URL.Path)
		}
		_, _ = io.WriteString(w, `{"status":"success","data":{"result":[{"metric":{},"value":[1,"42"]}]}}`)
	}))
	defer capybara.Close()
	b := &Backend{Capybara: capybara.URL, TokenFile: tokenFile, Client: capybara.Client(), Logger: slog.New(slog.DiscardHandler)}
	srv := httptest.NewServer(b.Handler())
	defer srv.Close()

	// Capybara restarted: the backend re-reads its credential after a 401.
	_ = os.WriteFile(tokenFile, []byte("new"), 0o600)
	get := func(path string) (int, string) {
		resp, err := http.Get(srv.URL + path) //nolint:noctx // test
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close() //nolint:errcheck
		body, _ := io.ReadAll(resp.Body)
		return resp.StatusCode, string(body)
	}
	if code, body := get("/clusters/dev-1/namespaces/shop/usage"); code != 200 || !strings.Contains(body, `"cpu":42`) {
		t.Fatalf("usage: %d %s", code, body)
	}
	before := calls.Load()
	get("/clusters/dev-1/namespaces/shop/usage")
	if calls.Load() != before {
		t.Error("instant results must be cached")
	}
	if code, body := get("/clusters/dev-2/overview"); code != 403 || !strings.Contains(body, "not installed") {
		t.Errorf("dev-2: %d %s", code, body)
	}
	if code, _ := get("/clusters/Bad_Id/overview"); code != 400 {
		t.Errorf("bad cluster id: %d", code)
	}
	if code, _ := get("/clusters/dev-1/metrics/pod?namespace=a%22&name=x"); code != 400 {
		t.Errorf("injection: %d", code)
	}
	b.Now = func() time.Time { return time.Now().Add(time.Hour) }
	get("/clusters/dev-1/namespaces/shop/usage")
	if calls.Load() == before {
		t.Error("cache must expire")
	}
}
