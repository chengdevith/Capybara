package plugin

import (
	"reflect"
	"testing"

	rbacv1 "k8s.io/api/rbac/v1"

	"github.com/capybara/capybara/api/v1alpha1"
)

func TestBackendRoleIsExact(t *testing.T) {
	_, spec, _ := LoadDir("../../plugins/monitoring", "builtin")
	install, err := ResolveServices(spec, v1alpha1.ModeInstall, nil)
	if err != nil {
		t.Fatal(err)
	}
	got := BackendRole(install, "capybara-monitoring")
	want := []rbacv1.PolicyRule{
		{APIGroups: []string{""}, Resources: []string{"services/proxy"}, ResourceNames: []string{"capybara-monitoring-prometheus:9090", "capybara-monitoring-grafana:80"}, Verbs: []string{"get"}},
		{APIGroups: []string{""}, Resources: []string{"services/proxy"}, ResourceNames: []string{"capybara-monitoring-grafana:80"}, Verbs: []string{"create"}},
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("install role = %+v", got)
	}

	// Connect: Prometheus only (Grafana is install-only), from the config.
	connect, err := ResolveServices(spec, v1alpha1.ModeConnect, map[string]any{"namespace": "monitoring", "service": "prom", "port": "https:web"})
	if err != nil {
		t.Fatal(err)
	}
	if len(connect) != 1 || connect[0].ProxyName() != "https:prom:web" {
		t.Fatalf("connect services = %+v", connect)
	}
	cluster, ns := InstallerRules(spec, v1alpha1.ModeConnect, connect, "monitoring")
	if len(cluster) != 0 {
		t.Errorf("connect mode must need no cluster-wide rules: %+v", cluster)
	}
	last := ns[len(ns)-1]
	if !reflect.DeepEqual(last.ResourceNames, []string{"https:prom:web"}) || !reflect.DeepEqual(last.Verbs, []string{"get"}) {
		t.Errorf("connect installer services/proxy rule = %+v", last)
	}
	for _, r := range ns {
		for _, res := range r.Resources {
			if res == "secrets" || res == "clusterroles" || res == "pods" {
				t.Errorf("connect installer rule too broad: %+v", r)
			}
		}
	}
}
