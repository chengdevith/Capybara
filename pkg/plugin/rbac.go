package plugin

import (
	"fmt"
	"slices"
	"strings"

	rbacv1 "k8s.io/api/rbac/v1"

	"github.com/capybara/capybara/api/v1alpha1"
)

// BackendAccount is the ServiceAccount (and Role/RoleBinding) Capybara
// creates in the plugin's namespace for its backend: it may only `get
// services/proxy` on the declared services.
func BackendAccount(plugin string) string { return "capybara-plugin-" + plugin }

// Service is a declared service access resolved for one installation.
type Service struct {
	Name      string   `json:"name"`
	Namespace string   `json:"namespace"`
	Service   string   `json:"service"`
	Port      string   `json:"port"`
	Methods   []string `json:"methods"`
	Paths     []string `json:"paths"`
	// WritePaths limit non-GET methods (empty: Paths).
	WritePaths []string `json:"writePaths,omitempty"`
}

// ProxyName is the services/proxy name Capybara uses for this service:
// "<service>:<port>" or "https:<service>:<port>". RBAC checks exactly this
// string, so the backend's Role names one endpoint.
func (s Service) ProxyName() string {
	if port, ok := strings.CutPrefix(s.Port, "https:"); ok {
		return "https:" + s.Service + ":" + port
	}
	return s.Service + ":" + s.Port
}

func applies(modes []v1alpha1.InstallMode, mode v1alpha1.InstallMode) bool {
	return len(modes) == 0 || slices.Contains(modes, mode)
}

// ResolveServices returns the services the backend may reach for an
// installation in mode with config (connect mode reads namespace, service
// and port from the config keys the manifest names).
func ResolveServices(spec *v1alpha1.PluginSpec, mode v1alpha1.InstallMode, cfg map[string]any) ([]Service, error) {
	var out []Service
	for _, a := range spec.Permissions.Services {
		if !applies(a.Modes, mode) {
			continue
		}
		s := Service{Name: a.Name, Namespace: a.Namespace, Service: a.Service, Port: a.Port, Methods: a.Methods, Paths: a.Paths, WritePaths: a.WritePaths}
		if mode == v1alpha1.ModeConnect {
			for key, dst := range map[string]*string{a.NamespaceKey: &s.Namespace, a.ServiceKey: &s.Service, a.PortKey: &s.Port} {
				if key != "" {
					if v := ConfigString(cfg, key); v != "" {
						*dst = v
					}
				}
			}
		}
		if s.Namespace == "" || s.Service == "" || s.Port == "" {
			return nil, fmt.Errorf("service %s: namespace, service and port are required", a.Name)
		}
		out = append(out, s)
	}
	return out, nil
}

// Namespace is where an installation's objects (chart, or the backend's
// account in connect mode) live.
func Namespace(spec *v1alpha1.PluginSpec, mode v1alpha1.InstallMode, cfg map[string]any) (string, error) {
	if mode == v1alpha1.ModeInstall {
		if spec.Chart == nil {
			return "", fmt.Errorf("plugin has no chart")
		}
		return spec.Chart.Namespace, nil
	}
	if spec.ConnectNamespaceKey == "" {
		return "", nil // connect without a service (e.g. an existing Tekton): no namespace of its own
	}
	if ns := ConfigString(cfg, spec.ConnectNamespaceKey); ns != "" {
		return ns, nil
	}
	return "", fmt.Errorf("connect mode needs config %q (the namespace of the connected service)", spec.ConnectNamespaceKey)
}

// ConsoleRole is the ClusterRole (and binding) granting Capybara's own
// account a plugin's console permissions.
func ConsoleRole(plugin string) string { return "capybara-plugin-" + plugin + "-console" }

// proxyVerb is the RBAC verb Kubernetes checks for an HTTP method sent
// through the service proxy.
func proxyVerb(method string) string {
	switch method {
	case "POST":
		return "create"
	case "PUT":
		return "update"
	case "PATCH":
		return "patch"
	case "DELETE":
		return "delete"
	default: // GET, HEAD
		return "get"
	}
}

// BackendRole is the Role given to the backend's account in namespace:
// services/proxy on exactly the resolved services there, with only the
// verbs their declared methods need.
func BackendRole(services []Service, namespace string) []rbacv1.PolicyRule {
	byVerb := map[string][]string{}
	var verbs []string
	for _, s := range services {
		if s.Namespace != namespace {
			continue
		}
		for _, m := range s.Methods {
			v := proxyVerb(m)
			if !slices.Contains(byVerb[v], s.ProxyName()) {
				if byVerb[v] == nil {
					verbs = append(verbs, v)
				}
				byVerb[v] = append(byVerb[v], s.ProxyName())
			}
		}
	}
	var rules []rbacv1.PolicyRule
	for _, v := range verbs {
		rules = append(rules, rbacv1.PolicyRule{APIGroups: []string{""}, Resources: []string{"services/proxy"}, ResourceNames: byVerb[v], Verbs: []string{v}})
	}
	return rules
}

// InstallerRules is what the installer credential needs for an
// installation: the manifest's rules for the mode, plus in connect mode
// `get services/proxy` on the connected services (RBAC lets an account
// grant only what it holds).
func InstallerRules(spec *v1alpha1.PluginSpec, mode v1alpha1.InstallMode, services []Service, namespace string) (cluster, ns []rbacv1.PolicyRule) {
	set := spec.Permissions.Install
	if mode == v1alpha1.ModeConnect {
		set = spec.Permissions.Connect
	}
	cluster = toRBAC(set.ClusterRules)
	ns = toRBAC(set.NamespaceRules)
	if mode == v1alpha1.ModeConnect {
		ns = append(ns, BackendRole(services, namespace)...)
	}
	// Granting the console permissions: the installer creates the role and
	// binding, and must hold what it grants (RBAC escalation rules).
	if console := toRBAC(spec.Permissions.Console.ClusterRules); len(console) > 0 {
		name := ConsoleRole(pluginNameOf(spec))
		cluster = append(cluster,
			rbacv1.PolicyRule{APIGroups: []string{"rbac.authorization.k8s.io"}, Resources: []string{"clusterroles", "clusterrolebindings"}, Verbs: []string{"create"}},
			rbacv1.PolicyRule{APIGroups: []string{"rbac.authorization.k8s.io"}, Resources: []string{"clusterroles", "clusterrolebindings"}, ResourceNames: []string{name}, Verbs: []string{"get", "patch", "delete"}},
		)
		cluster = append(cluster, console...)
	}
	return cluster, ns
}

// pluginNameOf is a spec's plugin name (set by catalog sync on the spec copy).
func pluginNameOf(spec *v1alpha1.PluginSpec) string { return spec.Name }

func toRBAC(rules []v1alpha1.PolicyRule) []rbacv1.PolicyRule {
	out := make([]rbacv1.PolicyRule, 0, len(rules))
	for _, r := range rules {
		out = append(out, rbacv1.PolicyRule{APIGroups: r.APIGroups, Resources: r.Resources, ResourceNames: r.ResourceNames, Verbs: r.Verbs})
	}
	return out
}
