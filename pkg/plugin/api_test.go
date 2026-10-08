package plugin

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
)

type fakeClusters map[string]v1alpha1.ClusterStatus

func (f fakeClusters) List() []cluster.Info {
	var out []cluster.Info
	for id := range f {
		out = append(out, cluster.Info{ID: id})
	}
	return out
}
func (f fakeClusters) Status(id string) (v1alpha1.ClusterStatus, bool) { s, ok := f[id]; return s, ok }

func installerStatus(ok bool) v1alpha1.ClusterStatus {
	st, reason := metav1.ConditionFalse, "NotConfigured"
	if ok {
		st, reason = metav1.ConditionTrue, "Ready"
	}
	return v1alpha1.ClusterStatus{Conditions: []metav1.Condition{{Type: v1alpha1.ConditionInstallerReady, Status: st, Reason: reason, Message: "msg-" + reason}}}
}

type apiFixture struct {
	srv       *httptest.Server
	c         client.Client
	auditPath string
	store     *audit.FileStore
}

func testPlugin(t *testing.T) *v1alpha1.Plugin {
	t.Helper()
	_, spec, _ := LoadDir("../../plugins/monitoring", "builtin")
	return &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "monitoring"}, Spec: *spec, Status: v1alpha1.PluginStatus{Available: true}}
}

func newAPI(t *testing.T, objs ...client.Object) *apiFixture {
	t.Helper()
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	repo := &v1alpha1.PluginRepository{ObjectMeta: metav1.ObjectMeta{Name: "builtin"}, Spec: v1alpha1.PluginRepositorySpec{Type: "builtin", Trusted: true}}
	c := fake.NewClientBuilder().WithScheme(scheme).WithObjects(append(objs, repo)...).
		WithStatusSubresource(&v1alpha1.Plugin{}, &v1alpha1.PluginInstallation{}).Build()
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, _ := audit.NewFileStore(path)
	a := &API{Mgmt: c, Clusters: fakeClusters{"dev-1": installerStatus(true), "dev-2": installerStatus(false)},
		Auditor: audit.NewAuditor(store, quiet), Logger: quiet}
	mux := http.NewServeMux()
	a.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(srv.Close)
	return &apiFixture{srv: srv, c: c, auditPath: path, store: store}
}

func (f *apiFixture) do(t *testing.T, method, path string, body any) (int, map[string]any) {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req, _ := http.NewRequestWithContext(context.Background(), method, f.srv.URL+path, &buf)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close() //nolint:errcheck
	var out map[string]any
	raw, _ := io.ReadAll(resp.Body)
	_ = json.Unmarshal(raw, &out)
	return resp.StatusCode, out
}

func (f *apiFixture) actions(t *testing.T) []string {
	t.Helper()
	recs, _ := f.store.List(context.Background(), audit.Filter{})
	var out []string
	for _, r := range recs {
		out = append(out, r.Action+"="+string(r.Result))
	}
	return out
}

func TestAPIInstallRefusals(t *testing.T) {
	unavailable := testPlugin(t)
	unavailable.Name = "broken"
	unavailable.Status = v1alpha1.PluginStatus{Available: false, Problem: "sha256 does not match"}
	f := newAPI(t, testPlugin(t), unavailable)
	cases := []struct {
		body CreateRequest
		code int
		text string
	}{
		{CreateRequest{Plugin: "monitoring", Cluster: "dev-2", Mode: "install"}, 409, "plugin installs are disabled on dev-2"},
		{CreateRequest{Plugin: "monitoring", Cluster: "dev-9", Mode: "install"}, 404, "not registered"},
		{CreateRequest{Plugin: "nope", Cluster: "dev-1", Mode: "install"}, 404, "not in the catalog"},
		{CreateRequest{Plugin: "broken", Cluster: "dev-1", Mode: "install"}, 409, "sha256"},
		{CreateRequest{Plugin: "monitoring", Cluster: "dev-1", Mode: "install", Config: map[string]any{"bogus": 1}}, 400, "unknown key"},
		{CreateRequest{Plugin: "monitoring", Cluster: "dev-1", Mode: "connect", Config: map[string]any{"namespace": "Bad!"}}, 400, "does not match"},
	}
	for _, c := range cases {
		code, body := f.do(t, http.MethodPost, "/api/plugins/installations", c.body)
		if code != c.code || !strings.Contains(body["error"].(string), c.text) {
			t.Errorf("%+v: %d %v", c.body, code, body)
		}
	}
	for _, a := range f.actions(t) {
		if !strings.HasSuffix(a, "=failure") && !strings.HasSuffix(a, "=denied") {
			t.Errorf("refusal not audited as such: %s", a)
		}
	}
}

func TestAPIInstallLifecycle(t *testing.T) {
	f := newAPI(t, testPlugin(t))
	ctx := context.Background()
	code, body := f.do(t, http.MethodPost, "/api/plugins/installations", CreateRequest{Plugin: "monitoring", Cluster: "dev-1", Mode: "install"})
	if code != http.StatusCreated {
		t.Fatalf("create: %d %v", code, body)
	}
	var in v1alpha1.PluginInstallation
	if err := f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-1"}, &in); err != nil {
		t.Fatal(err)
	}
	if !in.Spec.Enabled || in.Spec.Version != "0.1.0" || in.Annotations[v1alpha1.AnnotationRequestedBy] != "dev" || in.Annotations[v1alpha1.AnnotationRequestAuditID] == "" {
		t.Errorf("installation = %+v %v", in.Spec, in.Annotations)
	}
	if code, _ := f.do(t, http.MethodPost, "/api/plugins/installations", CreateRequest{Plugin: "monitoring", Cluster: "dev-1", Mode: "install"}); code != http.StatusConflict {
		t.Errorf("duplicate: %d", code)
	}
	in.UID = "uid-1" // the fake client assigns none
	if err := f.c.Update(ctx, &in); err != nil {
		t.Fatal(err)
	}

	no := false
	if code, _ := f.do(t, http.MethodPatch, "/api/plugins/installations/monitoring.dev-1", UpdateRequest{Enabled: &no, UID: "stale"}); code != http.StatusConflict {
		t.Errorf("stale uid: %d", code)
	}
	if code, b := f.do(t, http.MethodPatch, "/api/plugins/installations/monitoring.dev-1", UpdateRequest{Enabled: &no, UID: string(in.UID)}); code != http.StatusOK {
		t.Fatalf("disable: %d %v", code, b)
	}
	if code, _ := f.do(t, http.MethodPatch, "/api/plugins/installations/monitoring.dev-1", UpdateRequest{Version: "9.9.9", UID: string(in.UID)}); code != http.StatusConflict {
		t.Errorf("upgrade to a version the catalog lacks: %d", code)
	}

	// CRD removal must confirm the latest scan.
	if code, b := f.do(t, http.MethodPost, "/api/plugins/installations/monitoring.dev-1/_crd-scan", nil); code != http.StatusAccepted || b["request"] == "" {
		t.Fatalf("scan: %d %v", code, b)
	}
	_ = f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-1"}, &in)
	if in.Annotations[v1alpha1.AnnotationCRDScanRequest] == "" {
		t.Fatal("scan request not recorded")
	}
	uid := string(in.UID)
	if code, _ := f.do(t, http.MethodDelete, "/api/plugins/installations/monitoring.dev-1?confirm=x&uid="+uid, nil); code != http.StatusBadRequest {
		t.Errorf("confirm mismatch: %d", code)
	}
	if code, _ := f.do(t, http.MethodDelete, "/api/plugins/installations/monitoring.dev-1?confirm=monitoring.dev-1&uid="+uid+"&removeCRDs=abc", nil); code != http.StatusConflict {
		t.Errorf("unscanned CRD removal: %d", code)
	}
	foreign := []string{"ServiceMonitor default/other"}
	in.Status.CRDScan = &v1alpha1.CRDScan{Request: in.Annotations[v1alpha1.AnnotationCRDScanRequest], Foreign: foreign, Hash: HashList(foreign), CRDs: []string{"servicemonitors.monitoring.coreos.com"}}
	if err := f.c.Status().Update(ctx, &in); err != nil {
		t.Fatal(err)
	}
	q := url.Values{"confirm": {"monitoring.dev-1"}, "uid": {uid}, "keepData": {"true"}, "removeCRDs": {HashList(foreign)}}
	if code, b := f.do(t, http.MethodDelete, "/api/plugins/installations/monitoring.dev-1?"+q.Encode(), nil); code != http.StatusOK {
		t.Fatalf("uninstall: %d %v", code, b)
	}
	// The fake client deletes outright (no finalizer here); the request was
	// recorded with its options.
	if err := f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-1"}, &in); !apierrors.IsNotFound(err) {
		t.Errorf("installation not deleted: %v", err)
	}
	want := "uninstall=success uninstall=failure uninstall=failure configure+upgrade=failure disable=success disable=failure install=failure install=success"
	got := strings.Join(f.actions(t), " ")
	if strings.Replace(want, "configure+upgrade", "upgrade", 1) != got {
		t.Errorf("audit = %s", got)
	}
}

func TestConnectTokenIsWriteOnly(t *testing.T) {
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-1", UID: "u1"},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-1", Mode: "connect", Version: "0.1.0"}}
	f := newAPI(t, testPlugin(t), in)
	const secret = "sha256~OCP-BEARER-TOKEN-VALUE"
	if code, b := f.do(t, http.MethodPut, "/api/plugins/installations/monitoring.dev-1/connect-token", map[string]string{"token": secret}); code != http.StatusOK {
		t.Fatalf("set: %d %v", code, b)
	}
	var s corev1.Secret
	if err := f.c.Get(context.Background(), types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: ConnectTokenSecretName("monitoring.dev-1")}, &s); err != nil {
		t.Fatal(err)
	}
	if s.Type != v1alpha1.PluginConnectSecretType || string(s.Data[TokenKey]) != secret {
		t.Errorf("secret = %s", s.Type)
	}
	_, view := f.do(t, http.MethodGet, "/api/plugins/installations/monitoring.dev-1", nil)
	raw, _ := json.Marshal(view)
	audited, _ := os.ReadFile(f.auditPath)
	if strings.Contains(string(raw), secret) || strings.Contains(string(audited), secret) {
		t.Fatal("connect token leaked")
	}
}

func writeBundle(t *testing.T, dir, content string) string {
	t.Helper()
	_ = os.MkdirAll(filepath.Join(dir, "monitoring", "ui", "dist"), 0o755)
	_ = os.WriteFile(filepath.Join(dir, "monitoring", "ui", "dist", "monitoring.js"), []byte(content), 0o600)
	sum := sha256.Sum256([]byte(content))
	return hex.EncodeToString(sum[:])
}

func TestBundles(t *testing.T) {
	dir, devDir := t.TempDir(), t.TempDir()
	sha := writeBundle(t, dir, "export default 1")
	writeBundle(t, devDir, "export default 'dev'")
	p := testPlugin(t)
	p.Spec.UI = &v1alpha1.UIBundle{Bundle: "ui/dist/monitoring.js", SHA256: sha}
	f := newAPI(t, p)
	b := &Bundles{Mgmt: f.c, PluginsDir: dir}
	mux := http.NewServeMux()
	mux.Handle("GET /api/plugins/_ui/{name}/{file}", b)
	get := func(path string) *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		return rec
	}
	if r := get("/api/plugins/_ui/monitoring/" + sha + ".js"); r.Code != 200 || r.Body.String() != "export default 1" || !strings.Contains(r.Header().Get("Cache-Control"), "immutable") {
		t.Errorf("pinned: %d %q", r.Code, r.Body)
	}
	if r := get("/api/plugins/_ui/monitoring/" + strings.Repeat("0", 64) + ".js"); r.Code != 404 {
		t.Errorf("other sha: %d", r.Code)
	}
	if r := get("/api/plugins/_ui/monitoring/dev.js"); r.Code != 404 {
		t.Errorf("dev bundle without --plugin-dev-dir: %d", r.Code)
	}
	b.DevDir = devDir
	if r := get("/api/plugins/_ui/monitoring/dev.js"); r.Code != 200 || r.Header().Get("X-Capybara-Dev-Bundle") != "1" {
		t.Errorf("dev bundle: %d", r.Code)
	}
	// Tampered on disk: never served.
	_ = os.WriteFile(filepath.Join(dir, "monitoring", "ui", "dist", "monitoring.js"), []byte("evil()"), 0o600)
	if r := get("/api/plugins/_ui/monitoring/" + sha + ".js"); r.Code != 409 || strings.Contains(r.Body.String(), "evil") {
		t.Errorf("tampered: %d %q", r.Code, r.Body)
	}
	// Untrusted repository: nothing served.
	var repo v1alpha1.PluginRepository
	_ = f.c.Get(context.Background(), types.NamespacedName{Name: "builtin"}, &repo)
	repo.Spec.Trusted = false
	_ = f.c.Update(context.Background(), &repo)
	if r := get("/api/plugins/_ui/monitoring/dev.js"); r.Code != 403 {
		t.Errorf("untrusted: %d", r.Code)
	}
}

func TestBackendProxy(t *testing.T) {
	var seen *http.Request
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen = r
		http.SetCookie(w, &http.Cookie{Name: "x", Value: "y"})
		_, _ = w.Write([]byte("ok"))
	}))
	defer backend.Close()
	p := &BackendProxy{Backends: map[string]string{"monitoring": backend.URL}, Logger: quiet}
	mux := http.NewServeMux()
	p.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	defer srv.Close()
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, srv.URL+"/api/plugins/monitoring/clusters/dev-1/metrics?x=1", nil)
	req.Header.Set("Authorization", "Bearer browser")
	req.Header.Set("Cookie", "session=1")
	req.Header.Set("Impersonate-User", "admin")
	req.Header.Set("X-Capybara-User", "mallory")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	_ = resp.Body.Close()
	if seen.URL.Path != "/clusters/dev-1/metrics" || seen.URL.RawQuery != "x=1" {
		t.Errorf("forwarded %s?%s", seen.URL.Path, seen.URL.RawQuery)
	}
	for _, h := range []string{"Authorization", "Cookie", "Impersonate-User"} {
		if seen.Header.Get(h) != "" {
			t.Errorf("%s forwarded", h)
		}
	}
	if seen.Header.Get("X-Capybara-User") != "dev" || resp.Header.Get("Set-Cookie") != "" {
		t.Errorf("user %q, set-cookie %q", seen.Header.Get("X-Capybara-User"), resp.Header.Get("Set-Cookie"))
	}
	resp, _ = http.Get(srv.URL + "/api/plugins/other/x") //nolint:noctx // test
	_ = resp.Body.Close()
	if resp.StatusCode != 404 {
		t.Errorf("unknown backend: %d", resp.StatusCode)
	}
}

func TestScopedProxy(t *testing.T) {
	var seen *http.Request
	k8s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen = r
		if strings.HasSuffix(r.URL.Path, "/index") {
			w.Header().Set("Content-Type", "text/html")
			_, _ = w.Write([]byte(`<a href="/api/v1/namespaces/capybara-monitoring/services/capybara-monitoring-grafana:80/proxy/api/plugins/monitoring/grafana/dev-1/x">`))
			return
		}
		_, _ = w.Write([]byte(`{"status":"success"}`))
	}))
	defer k8s.Close()
	_, spec, _ := LoadDir("../../plugins/monitoring", "builtin")
	services, _ := ResolveServices(spec, v1alpha1.ModeInstall, nil)
	svcJSON, _ := json.Marshal(services)
	ready := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-1"},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-1", Mode: "install", Enabled: true},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady}}
	disabled := ready.DeepCopy()
	disabled.Name, disabled.Spec.Cluster, disabled.Spec.Enabled = "monitoring.dev-2", "dev-2", false
	tok := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName("monitoring", "dev-1")},
		Type: v1alpha1.PluginTokenSecretType, Data: map[string][]byte{TokenKey: []byte("plugin-k8s-token"),
			ExpiresKey: []byte(time.Now().Add(time.Hour).UTC().Format(time.RFC3339)), ServicesKey: svcJSON}}
	f := newAPI(t, ready, disabled, tok)
	creds, good := issue(t)
	p := &ScopedProxy{Mgmt: f.c, Credentials: creds, Clusters: staticConfigs{Host: k8s.URL}, Logger: quiet}
	mux := http.NewServeMux()
	p.Register(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	call := func(method, path, token string) (int, string) {
		req, _ := http.NewRequestWithContext(context.Background(), method, srv.URL+path, nil)
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close() //nolint:errcheck
		b, _ := io.ReadAll(resp.Body)
		return resp.StatusCode, string(b)
	}
	base := "/internal/plugins/monitoring/clusters/dev-1/services/"
	cases := []struct {
		method, path, token string
		code                int
	}{
		{"GET", base + "prometheus/api/v1/query?query=up", "", 401},
		{"GET", base + "prometheus/api/v1/query?query=up", "wrong", 401},
		{"GET", "/internal/plugins/monitoring/clusters/dev-2/services/prometheus/api/v1/query", good, 403},
		{"GET", "/internal/plugins/monitoring/clusters/dev-3/services/prometheus/api/v1/query", good, 403},
		{"GET", base + "kube-dns/api/v1/query", good, 403},
		{"POST", base + "prometheus/api/v1/query", good, 405},
		{"GET", base + "prometheus/api/v1/admin/tsdb/delete_series", good, 403},
		// ServeMux cleans the path first; the result is not an allowed path.
		{"GET", base + "prometheus/api/v1/query/../../admin", good, 403},
		{"GET", base + "prometheus/api/v1/%2e%2e/admin", good, 400},
	}
	for _, c := range cases {
		if code, body := call(c.method, c.path, c.token); code != c.code {
			t.Errorf("%s %s: %d %s, want %d", c.method, c.path, code, body, c.code)
		}
	}
	// Grafana: reads anywhere, POST only to the dashboard query API.
	g := base + "grafana/api/plugins/monitoring/grafana/dev-1"
	for _, c := range []struct {
		method, path string
		code         int
	}{
		{"POST", g + "/api/admin/users", 403},
		{"POST", g + "/api/user/password", 403},
		{"POST", g + "/api/orgs", 403},
		{"POST", g + "/api/datasources", 403},
		{"PUT", g + "/api/datasources/1", 405},
		{"DELETE", g + "/api/dashboards/uid/x", 405},
		{"POST", g + "/api/ds/queryx", 403},
	} {
		if code, body := call(c.method, c.path, good); code != c.code {
			t.Errorf("%s %s: %d %s, want %d", c.method, c.path, code, body, c.code)
		}
	}
	if seen != nil {
		t.Fatal("a refused request reached the cluster")
	}
	if code, _ := call("POST", g+"/api/ds/query", good); code != 200 || seen.Method != "POST" {
		t.Errorf("grafana query POST: %d", code)
	}
	seen = nil
	code, _ := call("GET", base+"prometheus/api/v1/query?query=up", good)
	if code != 200 || seen.URL.Path != "/api/v1/namespaces/capybara-monitoring/services/capybara-monitoring-prometheus:9090/proxy/api/v1/query" ||
		seen.URL.RawQuery != "query=up" || seen.Header.Get("Authorization") != "Bearer plugin-k8s-token" {
		t.Errorf("forwarded %d %s?%s auth=%q", code, seen.URL.Path, seen.URL.RawQuery, seen.Header.Get("Authorization"))
	}
	// Grafana's HTML, rewritten by the apiserver, comes back with Capybara's paths.
	_, html := call("GET", base+"grafana/api/plugins/monitoring/grafana/dev-1/index", good)
	if html != `<a href="/api/plugins/monitoring/grafana/dev-1/x">` {
		t.Errorf("html = %s", html)
	}
}

// issue issues the monitoring backend's credential and reads it back the
// way the backend does (from its file, mode 600).
func issue(t *testing.T) (*BackendCredentials, string) {
	t.Helper()
	dir := t.TempDir()
	creds, err := IssueBackendCredentials(dir, []string{"monitoring"})
	if err != nil {
		t.Fatal(err)
	}
	fi, err := os.Stat(filepath.Join(dir, "monitoring.token"))
	if err != nil || fi.Mode().Perm() != 0o600 {
		t.Fatalf("token file: %v %v", err, fi)
	}
	tok, _ := os.ReadFile(filepath.Join(dir, "monitoring.token"))
	return creds, string(tok)
}

type staticConfigs struct{ Host string }

func (s staticConfigs) RESTConfig(string) (*rest.Config, error) {
	return &rest.Config{Host: s.Host, BearerToken: "capybara-main-token"}, nil
}

func TestThanosRequest(t *testing.T) {
	q := url.Values{"query": {"up"}, "namespace": {"sneaky"}}
	req, err := ThanosRequest(context.Background(), "https://thanos-querier-openshift-monitoring.apps.example.com", "team-a", "/api/v1/query", q, "tok")
	if err != nil {
		t.Fatal(err)
	}
	if req.URL.String() != "https://thanos-querier-openshift-monitoring.apps.example.com/api/v1/query?namespace=team-a&query=up" ||
		req.Header.Get("Authorization") != "Bearer tok" {
		t.Errorf("request = %s %v", req.URL, req.Header)
	}
	for _, bad := range []string{"http://thanos", "https://user:pw@thanos", "ftp://x", ""} {
		if _, err := ThanosRequest(context.Background(), bad, "", "/api/v1/query", nil, ""); err == nil {
			t.Errorf("%q accepted", bad)
		}
	}
	if _, err := ThanosRequest(context.Background(), "https://t", "Bad NS", "/x", nil, ""); err == nil {
		t.Error("bad tenancy namespace accepted")
	}
}

func TestScopedThanosIsLoopbackOnly(t *testing.T) {
	var auth string
	thanos := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth = r.Header.Get("Authorization")
		_, _ = w.Write([]byte(r.URL.RawQuery))
	}))
	defer thanos.Close()
	http.DefaultClient.Transport = thanos.Client().Transport
	defer func() { http.DefaultClient.Transport = nil }()
	cfg, _ := json.Marshal(map[string]any{"target": "thanos-querier", "thanosURL": thanos.URL, "tenancyNamespace": "team-a", "namespace": "openshift-monitoring", "service": "thanos-querier", "port": "https:9091"})
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.ocp"},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "ocp", Mode: "connect", Enabled: true,
			Config: &runtime.RawExtension{Raw: cfg}, ConnectSecret: &v1alpha1.SecretRef{Name: "c"}},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady}}
	_, spec, _ := LoadDir("../../plugins/monitoring", "builtin")
	services, _ := ResolveServices(spec, v1alpha1.ModeConnect, map[string]any{"namespace": "openshift-monitoring", "service": "thanos-querier", "port": "https:9091"})
	svcJSON, _ := json.Marshal(services)
	tok := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName("monitoring", "ocp")},
		Type: v1alpha1.PluginTokenSecretType, Data: map[string][]byte{TokenKey: []byte("t"), ExpiresKey: []byte(time.Now().Add(time.Hour).UTC().Format(time.RFC3339)), ServicesKey: svcJSON}}
	conn := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "c"}, Type: v1alpha1.PluginConnectSecretType, Data: map[string][]byte{TokenKey: []byte("ocp-bearer")}}
	f := newAPI(t, in, tok, conn)
	creds, good := issue(t)
	p := &ScopedProxy{Mgmt: f.c, Credentials: creds, Clusters: staticConfigs{}, Logger: quiet}
	mux := http.NewServeMux()
	p.Register(mux)
	call := func() *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/internal/plugins/monitoring/clusters/ocp/services/prometheus/api/v1/query?query=up", nil)
		req.Header.Set("Authorization", "Bearer "+good)
		mux.ServeHTTP(rec, req)
		return rec
	}
	if r := call(); r.Code != 200 || r.Body.String() != "namespace=team-a&query=up" || auth != "Bearer ocp-bearer" {
		t.Errorf("loopback thanos: %d %q auth=%q", r.Code, r.Body, auth)
	}
	p.AllowExternal = func(string) bool { return false }
	if r := call(); r.Code != 403 || !strings.Contains(r.Body.String(), "Phase 5") {
		t.Errorf("external thanos: %d %s", r.Code, r.Body)
	}
}

func TestPathAllowed(t *testing.T) {
	prefixes := []string{"/api/v1/query", "/api/plugins/monitoring/grafana/*/api/ds/query"}
	for p, want := range map[string]bool{
		"/api/v1/query":       true,
		"/api/v1/query/x":     true,
		"/api/v1/query_range": false,
		"/api/v1":             false,
		"/api/plugins/monitoring/grafana/dev-1/api/ds/query":  true,
		"/api/plugins/monitoring/grafana/dev-1/api/ds/queryx": false,
		"/api/plugins/monitoring/grafana/dev-1/api/admin":     false,
		"/api/plugins/monitoring/grafana/a/b/api/ds/query":    false,
	} {
		if got := pathAllowed(prefixes, p); got != want {
			t.Errorf("%s: %v, want %v", p, got, want)
		}
	}
	if !pathAllowed([]string{"/"}, "/anything/at/all") {
		t.Error("/ allows everything")
	}
}

// Removing an installation the pre-flight refused (nothing applied) is a
// cancelled request, and the audit says so.
func TestCancelRefusedRequest(t *testing.T) {
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-1", UID: "u1"},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-1", Mode: v1alpha1.ModeInstall, Version: "0.1.0"},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallError, Message: "pre-flight refused: ..."}}
	f := newAPI(t, testPlugin(t), in)
	if code, b := f.do(t, http.MethodDelete, "/api/plugins/installations/monitoring.dev-1?confirm=monitoring.dev-1&uid=u1&keepData=false", nil); code != http.StatusOK {
		t.Fatalf("cancel: %d %v", code, b)
	}
	recs, _ := f.store.List(context.Background(), audit.Filter{})
	if len(recs) == 0 || recs[0].Detail != "request cancelled; nothing was deployed" {
		t.Errorf("audit = %+v", recs)
	}
}
