package plugin

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
)

const monitoringChart = "../../plugins/monitoring/chart/kube-prometheus-stack-91.9.0.tgz"

func renderMonitoring(t *testing.T, mutate func(map[string]any)) *Rendered {
	t.Helper()
	archive, err := os.ReadFile(monitoringChart)
	if err != nil {
		t.Fatal(err)
	}
	ch, err := LoadChart(archive)
	if err != nil {
		t.Fatal(err)
	}
	raw, err := os.ReadFile(filepath.Join("..", "..", "plugins", "monitoring", "chart", "values-small.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	vals := map[string]any{}
	if err := yaml.Unmarshal(raw, &vals); err != nil {
		t.Fatal(err)
	}
	if mutate != nil {
		mutate(vals)
	}
	r, err := Render(context.Background(), ch, RenderOptions{ReleaseName: "capybara-monitoring", Namespace: "capybara-monitoring", Values: vals, KubeVersion: "v1.35.5+k3s1"})
	if err != nil {
		t.Fatal(err)
	}
	return r
}

func TestRenderSmallPreset(t *testing.T) {
	r := renderMonitoring(t, nil)
	kinds := map[string]int{}
	for _, o := range r.Objects {
		kinds[o.GetKind()]++
		if o.GetKind() == "Secret" {
			data, _ := o.Object["data"].(map[string]any)
			if _, inline := data["admin-password"]; inline {
				t.Errorf("Grafana admin password rendered inline in %s", o.GetName())
			}
		}
	}
	for _, k := range []string{"Prometheus", "Deployment", "DaemonSet", "ClusterRole", "ClusterRoleBinding", "ValidatingWebhookConfiguration"} {
		if kinds[k] == 0 {
			t.Errorf("no %s rendered (kinds %v)", k, kinds)
		}
	}
	if kinds["Alertmanager"] != 0 {
		t.Error("Alertmanager must be off in the small preset")
	}
	if len(r.CRDs) < 10 {
		t.Errorf("CRDs = %d", len(r.CRDs))
	}
}

func TestImagesMatchPinnedList(t *testing.T) {
	lists, _ := filepath.Glob("../../plugins/*/images.txt")
	if len(lists) == 0 {
		t.Fatalf("image lists: %v", lists)
	}
	for _, list := range lists {
		dir := filepath.Dir(list)
		_, spec, err := LoadDir(dir, "builtin")
		if err != nil {
			t.Fatal(err)
		}
		ch, values, err := LoadInstallChart(dir, spec, "dev-1")
		if err != nil {
			t.Fatal(err)
		}
		apiVersions, err := ChartAPIVersions(ch)
		if err != nil {
			t.Fatal(err)
		}
		r, err := Render(context.Background(), ch, RenderOptions{ReleaseName: spec.Chart.ReleaseName, Namespace: spec.Chart.Namespace,
			Values: values, KubeVersion: "v1.35.5", APIVersions: apiVersions})
		if err != nil {
			t.Fatal(err)
		}
		got := Images(r.Objects)
		raw, err := os.ReadFile(list) //nolint:gosec // test fixture
		if err != nil {
			t.Fatal(err)
		}
		var want []string
		for _, line := range strings.Split(string(raw), "\n") {
			f := strings.Fields(line)
			if len(f) == 0 || strings.HasPrefix(line, "#") {
				continue
			}
			switch {
			case len(f) == 3 && f[1] == "-" && f[2] == "skip":
			case len(f) == 2 && strings.HasPrefix(f[1], "sha256:"):
				if at := strings.LastIndex(f[0], "@"); at >= 0 && f[0][at+1:] != f[1] {
					t.Errorf("%s: %s: digest column differs from the reference", list, f[0])
				}
			default:
				t.Errorf("%s: %q: want <reference> <sha256:digest>, or <reference> - skip", list, line)
			}
			want = append(want, f[0])
		}
		if strings.Join(got, ",") != strings.Join(want, ",") {
			t.Errorf("%s: images\n got %v\nwant %v", list, got, want)
		}
		for _, img := range got {
			if strings.Contains(img, "bats") {
				t.Errorf("%s: test hook images must not be listed", list)
			}
		}
	}
}

// Tekton's chart (built from the vendored release) renders, creates only
// what its manifest declares, keeps only the cluster resolver, and leaves
// the release namespace to the controller.
func TestTektonChartWithinDeclaredPermissions(t *testing.T) {
	_, spec, err := LoadDir("../../plugins/tekton", "builtin")
	if err != nil {
		t.Fatal(err)
	}
	ch, values, err := LoadInstallChart("../../plugins/tekton", spec, "dev-1")
	if err != nil {
		t.Fatal(err)
	}
	r, err := Render(context.Background(), ch, RenderOptions{ReleaseName: spec.Chart.ReleaseName, Namespace: spec.Chart.Namespace, Values: values, KubeVersion: "v1.35.5"})
	if err != nil {
		t.Fatal(err)
	}
	rules, _ := InstallerRules(spec, v1alpha1.ModeInstall, nil, spec.Chart.Namespace)
	for _, o := range append(r.Objects, r.CRDs...) {
		gvr := guessResource(o)
		for _, verb := range []string{"create", "delete"} {
			if !allows(rules, gvr.Group, gvr.Resource, verb) {
				t.Errorf("%s %s %s: not declared", verb, o.GetKind(), o.GetName())
			}
		}
		if o.GetKind() == "Namespace" && o.GetName() == spec.Chart.Namespace {
			t.Error("the release namespace must come from the controller (with namespaceLabels), not the chart")
		}
		if o.GetKind() == "ConfigMap" && o.GetName() == "resolvers-feature-flags" {
			data, _, _ := unstructured.NestedStringMap(o.Object, "data")
			for k, v := range data {
				if strings.HasPrefix(k, "enable-") && strings.HasSuffix(k, "-resolver") && (v == "true") != (k == "enable-cluster-resolver") {
					t.Errorf("resolver flag %s = %s", k, v)
				}
			}
		}
	}
	if len(r.CRDs) != 8 {
		t.Errorf("CRDs = %d", len(r.CRDs))
	}
}

// Only plugins that keep data in volumes offer to keep or remove it.
func TestHasData(t *testing.T) {
	for name, want := range map[string]bool{"monitoring": true, "tekton": false} {
		_, spec, err := LoadDir("../../plugins/"+name, "builtin")
		if err != nil {
			t.Fatal(err)
		}
		if got := HasData(spec); got != want {
			t.Errorf("%s: HasData = %v", name, got)
		}
	}
}
