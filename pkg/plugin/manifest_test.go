package plugin

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
)

func TestMonitoringManifestIsValid(t *testing.T) {
	m, spec, err := LoadDir("../../plugins/monitoring", "builtin")
	if m == nil {
		t.Fatal(err)
	}
	var ui *UIBundleError
	if err != nil && !errors.As(err, &ui) {
		t.Fatalf("only the UI bundle may be unverified here: %v", err)
	}
	if spec.Chart.Version != "91.9.0" || len(spec.Permissions.Services) != 2 || !strings.HasPrefix(spec.Icon, "data:image/svg+xml") {
		t.Errorf("spec = %+v", spec)
	}
}

func TestParseManifestRejects(t *testing.T) {
	base := `name: x
displayName: X
version: 1.0.0
extensionApi: 1
scope: per-cluster
modes: [connect]
`
	cases := map[string]string{
		"bad name":         strings.Replace(base, "name: x", "name: X_", 1),
		"unknown field":    base + "surprise: true\n",
		"install no chart": strings.Replace(base, "[connect]", "[install]", 1),
		"escaping bundle":  base + "ui: {bundle: ../evil.js, sha256: " + strings.Repeat("a", 64) + "}\n",
		"absolute bundle":  base + "ui: {bundle: /etc/x.js, sha256: " + strings.Repeat("a", 64) + "}\n",
		"short sha":        base + "ui: {bundle: ui/x.js, sha256: abc}\n",
		"unknown point":    base + "extensionPoints: [toolbar]\n",
		"step unknown svc": base + "steps: [{name: a, title: A, check: {type: service, service: nope}}]\n",
		"service query":    base + "permissions: {services: [{name: p, methods: [GET], paths: ['/x?y']}]}\n",
		"schema keyword":   base + "config: {schema: {type: object, properties: {a: {type: string, format: uri}}}}\n",
		"schema bad type":  base + "config: {schema: {type: object, properties: {a: {type: array}}}}\n",
		"bad default":      base + "config: {schema: {type: object, properties: {a: {type: string, enum: [x], default: y}}}}\n",
	}
	for name, raw := range cases {
		if _, err := ParseManifest([]byte(raw)); err == nil {
			t.Errorf("%s: accepted", name)
		}
	}
	if _, err := ParseManifest([]byte(base)); err != nil {
		t.Fatalf("base: %v", err)
	}
}

func TestValidateConfig(t *testing.T) {
	schema := []byte(`{"type":"object","required":["service"],"properties":{
		"service":{"type":"string","pattern":"^[a-z]+$"},
		"port":{"type":"string","default":"9090"},
		"mode":{"type":"string","enum":["a","b"],"default":"a"},
		"replicas":{"type":"integer","minimum":1,"maximum":3}}}`)
	got, err := ValidateConfig(schema, map[string]any{"service": "prom", "replicas": 2.0})
	if err != nil {
		t.Fatal(err)
	}
	if got["port"] != "9090" || got["mode"] != "a" || got["replicas"] != 2.0 {
		t.Errorf("defaults not applied: %v", got)
	}
	for name, vals := range map[string]map[string]any{
		"missing required": {},
		"pattern":          {"service": "Prom!"},
		"enum":             {"service": "p", "mode": "c"},
		"unknown key":      {"service": "p", "extra": 1},
		"range":            {"service": "p", "replicas": 9.0},
		"not integer":      {"service": "p", "replicas": 1.5},
		"type":             {"service": 3},
	} {
		if _, err := ValidateConfig(schema, vals); err == nil {
			t.Errorf("%s: accepted", name)
		}
	}
}

func writePlugin(t *testing.T, root, name, bundle string) {
	t.Helper()
	dir := filepath.Join(root, name)
	_ = os.MkdirAll(filepath.Join(dir, "ui"), 0o755)
	_ = os.WriteFile(filepath.Join(dir, "ui", "b.js"), []byte(bundle), 0o600)
	sum := sha256.Sum256([]byte("export default 1"))
	manifest := "name: " + name + "\ndisplayName: N\nversion: 1.0.0\nextensionApi: 1\nscope: per-cluster\nmodes: [connect]\n" +
		"ui: {bundle: ui/b.js, sha256: " + hex.EncodeToString(sum[:]) + "}\n"
	_ = os.WriteFile(filepath.Join(dir, ManifestFile), []byte(manifest), 0o600)
}

func TestCatalogSync(t *testing.T) {
	root := t.TempDir()
	writePlugin(t, root, "good", "export default 1")
	writePlugin(t, root, "tampered", "export default 2")
	_ = os.MkdirAll(filepath.Join(root, "broken"), 0o755)
	_ = os.WriteFile(filepath.Join(root, "broken", ManifestFile), []byte("name: broken\n"), 0o600)

	scheme := runtime.NewScheme()
	_ = v1alpha1.AddToScheme(scheme)
	repo := &v1alpha1.PluginRepository{}
	repo.Name = "builtin"
	repo.Spec = v1alpha1.PluginRepositorySpec{Type: v1alpha1.RepositoryBuiltin, Trusted: true}
	c := fake.NewClientBuilder().WithScheme(scheme).WithObjects(repo).
		WithStatusSubresource(&v1alpha1.PluginRepository{}, &v1alpha1.Plugin{}).Build()
	r := &CatalogReconciler{Client: c, PluginsDir: root}
	ctx := context.Background()
	if _, err := r.Reconcile(ctx, ctrl.Request{NamespacedName: types.NamespacedName{Name: "builtin"}}); err != nil {
		t.Fatal(err)
	}
	get := func(name string) v1alpha1.Plugin {
		var p v1alpha1.Plugin
		if err := c.Get(ctx, types.NamespacedName{Name: name}, &p); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		return p
	}
	if p := get("good"); !p.Status.Available {
		t.Errorf("good: %+v", p.Status)
	}
	if p := get("tampered"); p.Status.Available || !strings.Contains(p.Status.Problem, "sha256") {
		t.Errorf("tampered: %+v", p.Status)
	}
	_ = c.Get(ctx, types.NamespacedName{Name: "builtin"}, repo)
	if repo.Status.Phase != "Error" || !strings.Contains(repo.Status.Message, "broken") || len(repo.Status.Plugins) != 2 {
		t.Errorf("repo status = %+v", repo.Status)
	}

	// Dev mode tolerates the UI mismatch; an untrusted repository makes nothing available.
	r.DevUI = true
	_, _ = r.Reconcile(ctx, ctrl.Request{NamespacedName: types.NamespacedName{Name: "builtin"}})
	if p := get("tampered"); !p.Status.Available || !strings.HasPrefix(p.Status.Problem, "dev bundle") {
		t.Errorf("dev tampered: %+v", p.Status)
	}
	_ = c.Get(ctx, types.NamespacedName{Name: "builtin"}, repo)
	repo.Spec.Trusted = false
	if err := c.Update(ctx, repo); err != nil {
		t.Fatal(err)
	}
	_, _ = r.Reconcile(ctx, ctrl.Request{NamespacedName: types.NamespacedName{Name: "builtin"}})
	if p := get("good"); p.Status.Available || p.Status.Problem != "repository is not trusted" {
		t.Errorf("untrusted: %+v", p.Status)
	}

	// Removed from the repository: listed but not installable.
	_ = os.RemoveAll(filepath.Join(root, "good"))
	_ = c.Get(ctx, types.NamespacedName{Name: "builtin"}, repo)
	repo.Spec.Trusted = true
	if err := c.Update(ctx, repo); err != nil {
		t.Fatal(err)
	}
	_, _ = r.Reconcile(ctx, ctrl.Request{NamespacedName: types.NamespacedName{Name: "builtin"}})
	if p := get("good"); p.Status.Available || !strings.Contains(p.Status.Problem, "no longer") {
		t.Errorf("removed: %+v", p.Status)
	}
}
