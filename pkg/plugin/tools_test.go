package plugin

import (
	"context"
	"encoding/json"
	"encoding/pem"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
)

type fixedConfigs struct{ cfg *rest.Config }

func (f fixedConfigs) RESTConfig(string) (*rest.Config, error) { return rest.CopyConfig(f.cfg), nil }

func toolPlugin() *v1alpha1.Plugin {
	return &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "argocd"}, Spec: v1alpha1.PluginSpec{
		Name: "argocd", DisplayName: "GitOps", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall},
		Chart: &v1alpha1.ChartRef{Namespace: "argocd"},
		Tools: []v1alpha1.Tool{
			{Name: "argocd", Title: "Argo CD", Icon: "argocd", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall},
				Service: &v1alpha1.ToolService{Service: "argocd-server", Port: "http"}, Cookies: []string{"argocd.token"}},
		},
	}}
}

func readyInstallation(plugin, cluster string, enabled bool) *v1alpha1.PluginInstallation {
	return &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.InstallationName(plugin, cluster)},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: plugin, Cluster: cluster, Mode: v1alpha1.ModeInstall, Enabled: enabled},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady, InstalledVersion: "0.1.0"}}
}

func TestToolProxy(t *testing.T) {
	const prefix = "/api/v1/namespaces/argocd/services/argocd-server:http/proxy"
	var seen *http.Request
	kube := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen = r.Clone(context.Background())
		http.SetCookie(w, &http.Cookie{Name: "argocd.token", Value: "t1", Path: "/"})
		http.SetCookie(w, &http.Cookie{Name: "other", Value: "x"})
		if strings.HasSuffix(r.URL.Path, "/login") {
			w.Header().Set("Location", prefix+"/api/plugins/argocd/tools/argocd/dev-1/applications")
			w.WriteHeader(http.StatusFound)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		_, _ = io.WriteString(w, `<base href="`+prefix+`/api/plugins/argocd/tools/argocd/dev-1/">`)
	}))
	defer kube.Close()
	ca := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: kube.Certificate().Raw})
	cfg := &rest.Config{Host: kube.URL, BearerToken: "capybara-token", TLSClientConfig: rest.TLSClientConfig{CAData: ca}}

	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	mgmt := fake.NewClientBuilder().WithScheme(scheme).WithObjects(toolPlugin(), readyInstallation("argocd", "dev-1", true), readyInstallation("argocd", "dev-2", false)).Build()
	store, _ := audit.NewFileStore(filepath.Join(t.TempDir(), "audit.jsonl"))
	p := &ToolProxy{Mgmt: mgmt, Clusters: fixedConfigs{cfg}, Auditor: audit.NewAuditor(store, quiet), Logger: quiet}
	mux := http.NewServeMux()
	p.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	defer srv.Close()
	noRedirect := &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	// do returns the status, headers and body (read and closed).
	type result struct {
		StatusCode int
		Header     http.Header
	}
	do := func(method, path string) (result, []byte) {
		req, _ := http.NewRequest(method, srv.URL+path, nil)
		req.Header.Set("Cookie", "argocd.token=t0; capybara-session=secret")
		req.Header.Set("Authorization", "Bearer from-the-browser")
		resp, err := noRedirect.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		body, _ := io.ReadAll(resp.Body)
		_ = resp.Body.Close()
		return result{resp.StatusCode, resp.Header}, body
	}

	resp, body := do(http.MethodGet, "/api/plugins/argocd/tools/argocd/dev-1/?x=1")
	if resp.StatusCode != 200 || seen.URL.Path != prefix+"/api/plugins/argocd/tools/argocd/dev-1/" || seen.URL.RawQuery != "x=1" {
		t.Fatalf("forwarded %d %s?%s", resp.StatusCode, seen.URL.Path, seen.URL.RawQuery)
	}
	// Only the tool's cookie goes in; Capybara's own credential, not the browser's.
	if c := seen.Header.Get("Cookie"); c != "argocd.token=t0" {
		t.Errorf("cookie sent = %q", c)
	}
	if a := seen.Header.Get("Authorization"); a != "Bearer capybara-token" {
		t.Errorf("authorization sent = %q", a)
	}
	// Only the tool's cookie comes back, under the tool's path; links lose the proxy prefix.
	if sc := resp.Header.Values("Set-Cookie"); len(sc) != 1 || !strings.HasPrefix(sc[0], "argocd.token=t1") || !strings.Contains(sc[0], "Path=/api/plugins/argocd/tools/argocd/dev-1") {
		t.Errorf("set-cookie = %v", sc)
	}
	if string(body) != `<base href="/api/plugins/argocd/tools/argocd/dev-1/">` {
		t.Errorf("body = %s", body)
	}
	// Redirects point at Capybara's path, not the API server's.
	resp, _ = do(http.MethodPost, "/api/plugins/argocd/tools/argocd/dev-1/login")
	if loc := resp.Header.Get("Location"); resp.StatusCode != http.StatusFound || loc != "/api/plugins/argocd/tools/argocd/dev-1/applications" {
		t.Errorf("redirect %d to %q", resp.StatusCode, loc)
	}
	// Writes are audited; reads are not.
	recs, _ := store.List(context.Background(), audit.Filter{})
	if len(recs) != 1 || recs[0].Action != "argocd.tool-request" || recs[0].Name != "argocd" || !strings.Contains(recs[0].Detail, "POST /login → 302") {
		t.Errorf("audit = %+v", recs)
	}
	// Not where the plugin is disabled, nor tools it does not declare.
	for _, path := range []string{"/api/plugins/argocd/tools/argocd/dev-2/", "/api/plugins/argocd/tools/grafana/dev-1/", "/api/plugins/monitoring/tools/argocd/dev-1/"} {
		if resp, _ := do(http.MethodGet, path); resp.StatusCode != http.StatusNotFound {
			t.Errorf("%s: %d", path, resp.StatusCode)
		}
	}
	if resp, _ := do(http.MethodGet, "/api/plugins/argocd/tools/argocd/dev-1/..%2f..%2fapi"); resp.StatusCode != http.StatusBadRequest {
		t.Errorf("path escape: %d", resp.StatusCode)
	}
}

func TestToolsList(t *testing.T) {
	grafana := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "monitoring"}, Spec: v1alpha1.PluginSpec{Name: "monitoring",
		Tools: []v1alpha1.Tool{{Name: "grafana", Title: "Grafana", Icon: "grafana", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall}, URL: "/api/plugins/monitoring/grafana/{{cluster}}/"}}}}
	f := newAPI(t, toolPlugin(), grafana, readyInstallation("argocd", "dev-1", true), readyInstallation("monitoring", "dev-1", true), readyInstallation("argocd", "dev-2", false))
	code, body := f.doList(t, "/api/clusters/dev-1/tools")
	if code != 200 || len(body) != 2 || body[0]["title"] != "Argo CD" || body[0]["url"] != "/api/plugins/argocd/tools/argocd/dev-1/" ||
		body[1]["title"] != "Grafana" || body[1]["url"] != "/api/plugins/monitoring/grafana/dev-1/" {
		t.Fatalf("dev-1 tools: %d %v", code, body)
	}
	if code, body := f.doList(t, "/api/clusters/dev-2/tools"); code != 200 || len(body) != 0 {
		t.Errorf("dev-2 (disabled) tools: %d %v", code, body)
	}
}

func (f *apiFixture) doList(t *testing.T, path string) (int, []map[string]any) {
	t.Helper()
	resp, err := http.Get(f.srv.URL + path)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close() //nolint:errcheck
	var out []map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}
