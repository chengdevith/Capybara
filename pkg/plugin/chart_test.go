package plugin

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"sigs.k8s.io/yaml"
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
	got := Images(renderMonitoring(t, nil).Objects)
	raw, err := os.ReadFile("../../plugins/monitoring/images.txt")
	if err != nil {
		t.Fatal(err)
	}
	var want []string
	for _, line := range strings.Split(string(raw), "\n") {
		if f := strings.Fields(line); len(f) == 2 && !strings.HasPrefix(line, "#") {
			if !strings.HasPrefix(f[1], "sha256:") {
				t.Errorf("%s is not pinned by digest", f[0])
			}
			want = append(want, f[0])
		}
	}
	if strings.Join(got, ",") != strings.Join(want, ",") {
		t.Fatalf("images\n got %v\nwant %v", got, want)
	}
	for _, img := range got {
		if strings.Contains(img, "bats") {
			t.Error("test hook images must not be listed")
		}
	}
}
