package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"sort"
	"strings"

	authzv1 "k8s.io/api/authorization/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"

	chart "helm.sh/helm/v4/pkg/chart/v2"

	"github.com/capybara/capybara/api/v1alpha1"
)

// PreflightResult is what a pre-flight found. Install proceeds only when
// OK; Problems say why not, in words an admin can act on.
type PreflightResult struct {
	OK        bool                `json:"ok"`
	Mode      string              `json:"mode"`
	Namespace string              `json:"namespace"`
	Problems  []string            `json:"problems,omitempty"`
	Missing   []string            `json:"missing,omitempty"` // installer permissions it lacks
	Services  []Service           `json:"services,omitempty"`
	Objects   map[string]int      `json:"objects,omitempty"` // install: kinds the chart creates
	CRDs      []string            `json:"crds,omitempty"`
	Images    []string            `json:"images,omitempty"`
	Installer string              `json:"installer,omitempty"`
	Config    map[string]any      `json:"config,omitempty"`
	Backend   []rbacv1.PolicyRule `json:"backendRole,omitempty"`
}

// PreflightInput is everything a pre-flight needs.
type PreflightInput struct {
	Spec      *v1alpha1.PluginSpec
	PluginDir string
	Cluster   string
	Mode      v1alpha1.InstallMode
	Config    map[string]any
	// Installer is the installer credential (nil: none).
	Installer *rest.Config
	// InstallerIdentity, for the report.
	InstallerIdentity string
	// KubeVersion of the cluster, for rendering.
	KubeVersion string
	// ReleaseDeployed: the plugin's own release exists (an upgrade). Helm
	// installs crds/ without ownership metadata, so existing CRDs are
	// expected then.
	ReleaseDeployed bool
	// Probe is Capybara's own connection to the cluster, for detecting an
	// existing installation (discovery and namespaces need no installer).
	Probe *rest.Config
}

// Preflight checks an installation before anything is changed.
func Preflight(ctx context.Context, in PreflightInput) (*PreflightResult, error) {
	res := &PreflightResult{Mode: string(in.Mode), Installer: in.InstallerIdentity}
	problem := func(format string, args ...any) { res.Problems = append(res.Problems, fmt.Sprintf(format, args...)) }
	spec := in.Spec

	if !slices.Contains(spec.Modes, in.Mode) {
		problem("this plugin does not support %s mode", in.Mode)
		return res, nil
	}
	schema := []byte(nil)
	if spec.ConfigSchema != nil {
		schema = spec.ConfigSchema.Raw
	}
	cfg, err := ValidateConfig(schema, in.Config)
	if err != nil {
		problem("%v", err)
		return res, nil
	}
	res.Config = cfg
	if res.Namespace, err = Namespace(spec, in.Mode, cfg); err != nil {
		problem("%v", err)
		return res, nil
	}
	if res.Services, err = ResolveServices(spec, in.Mode, cfg); err != nil {
		problem("%v", err)
		return res, nil
	}
	res.Backend = BackendRole(res.Services, res.Namespace)
	if in.Installer == nil {
		problem("plugin installs are disabled on %s: it has no installer credential (set one on the cluster's page)", in.Cluster)
		return res, nil
	}
	// The checks are many small requests (one access review per declared
	// rule): client-go's default 5 requests/s made a refusal take ~30s.
	in.Installer = rest.CopyConfig(in.Installer)
	in.Installer.QPS, in.Installer.Burst = 50, 100
	cs, err := kubernetes.NewForConfig(in.Installer)
	if err != nil {
		return nil, err
	}

	// The installer must hold every permission declared for this mode.
	clusterRules, nsRules := InstallerRules(spec, in.Mode, res.Services, res.Namespace)
	missing, err := checkRules(ctx, cs, clusterRules, "")
	if err != nil {
		return nil, err
	}
	nsMissing, err := checkRules(ctx, cs, nsRules, res.Namespace)
	if err != nil {
		return nil, err
	}
	res.Missing = append(missing, nsMissing...)
	if len(res.Missing) > 0 {
		problem("the installer credential (%s) lacks %d permission(s) this plugin declares for %s mode; regenerate it with: hack/capybara-sa.sh %s --installer %s%s",
			nonEmpty(in.InstallerIdentity), len(res.Missing), in.Mode, in.Cluster, pluginName(in.PluginDir), connectFlags(in.Mode, cfg, spec))
	}

	if in.Mode == v1alpha1.ModeInstall {
		if err := preflightInstall(ctx, in, cs, clusterRules, res); err != nil {
			return nil, err
		}
		// The controller server-side applies the chart's CRDs on every
		// install and upgrade (Helm never upgrades crds/).
		var crdRules []rbacv1.PolicyRule
		if len(res.CRDs) > 0 {
			crdRules = append(crdRules, rbacv1.PolicyRule{APIGroups: []string{"apiextensions.k8s.io"}, Resources: []string{"customresourcedefinitions"}, Verbs: []string{"create"}},
				rbacv1.PolicyRule{APIGroups: []string{"apiextensions.k8s.io"}, Resources: []string{"customresourcedefinitions"}, ResourceNames: res.CRDs, Verbs: []string{"get", "patch"}})
		}
		crdMissing, err := checkRules(ctx, cs, crdRules, "")
		if err != nil {
			return nil, err
		}
		if len(crdMissing) > 0 {
			res.Missing = append(res.Missing, crdMissing...)
			problem("the installer credential cannot create or update the plugin's CRDs (needed for upgrades): %s", strings.Join(crdMissing, ", "))
		}
	}
	if err := detect(ctx, in, res); err != nil {
		return nil, err
	}
	res.OK = len(res.Problems) == 0
	return res, nil
}

func preflightInstall(ctx context.Context, in PreflightInput, cs kubernetes.Interface, rules []rbacv1.PolicyRule, res *PreflightResult) error {
	spec := in.Spec
	problem := func(format string, args ...any) { res.Problems = append(res.Problems, fmt.Sprintf(format, args...)) }
	groups, err := cs.Discovery().ServerGroups()
	if err != nil {
		return fmt.Errorf("discovery: %w", err)
	}
	if slices.Contains(spec.Chart.RefuseInstallOn, "openshift") && isOpenShift(groups) {
		problem("this is OpenShift, which ships its own %s: use Connect existing instead of installing a second one", spec.DisplayName)
	}
	ch, values, err := LoadInstallChart(in.PluginDir, spec, in.Cluster)
	if err != nil {
		return err
	}
	var apiVersions []string
	for _, g := range groups.Groups {
		for _, v := range g.Versions {
			apiVersions = append(apiVersions, v.GroupVersion)
		}
	}
	r, err := Render(ctx, ch, RenderOptions{ReleaseName: spec.Chart.ReleaseName, Namespace: spec.Chart.Namespace,
		Values: values, KubeVersion: in.KubeVersion, APIVersions: apiVersions})
	if err != nil {
		problem("the chart does not render: %v", err)
		return nil
	}
	res.Objects = map[string]int{}
	for _, o := range append(r.Objects, r.CRDs...) {
		if isTestHook(o) {
			continue
		}
		res.Objects[o.GetKind()]++
		gvr := guessResource(o)
		if !allows(rules, gvr.Group, gvr.Resource, "create") {
			problem("the chart creates %s %q, which the plugin does not declare", o.GetKind(), o.GetName())
		} else if !allows(rules, gvr.Group, gvr.Resource, "delete") {
			// Otherwise uninstall would stop halfway.
			problem("the chart creates %s %q, which the plugin may not delete (uninstall would fail)", o.GetKind(), o.GetName())
		}
	}
	for _, crd := range r.CRDs {
		res.CRDs = append(res.CRDs, crd.GetName())
	}
	sort.Strings(res.CRDs)
	res.Images = Images(r.Objects)

	// Never take over CRDs another installation owns (e.g. an existing
	// Prometheus Operator): connect to it instead.
	dyn, err := dynamic.NewForConfig(in.Installer)
	if err != nil {
		return err
	}
	crdGVR := schema.GroupVersionResource{Group: "apiextensions.k8s.io", Version: "v1", Resource: "customresourcedefinitions"}
	for _, name := range res.CRDs {
		if in.ReleaseDeployed {
			break
		}
		obj, err := dyn.Resource(crdGVR).Get(ctx, name, metav1.GetOptions{})
		if apierrors.IsNotFound(err) {
			continue
		}
		if err != nil {
			return err
		}
		// Ours if the controller labelled it at an earlier install (Helm's
		// crds/ carry no ownership metadata), or Helm-owned by our release.
		if obj.GetLabels()[v1alpha1.LabelPlugin] == pluginName(in.PluginDir) {
			continue
		}
		if owner := obj.GetAnnotations()["meta.helm.sh/release-name"]; owner != spec.Chart.ReleaseName || obj.GetAnnotations()["meta.helm.sh/release-namespace"] != spec.Chart.Namespace {
			if owner == "" {
				owner = "something other than Helm"
			}
			problem("CRD %s already exists (installed by %s): another installation provides it; use Connect existing", name, owner)
			break
		}
	}
	return nil
}

// LoadInstallChart reads the pinned chart and builds the values for one
// cluster: the preset, then the manifest's installValues ({{cluster}}
// replaced).
func LoadInstallChart(dir string, spec *v1alpha1.PluginSpec, clusterID string) (*chart.Chart, map[string]any, error) {
	archive, err := ReadPinned(dir, spec.Chart.Archive, spec.Chart.SHA256)
	if err != nil {
		return nil, nil, err
	}
	ch, err := LoadChart(archive)
	if err != nil {
		return nil, nil, err
	}
	values := map[string]any{}
	if spec.Chart.Values != "" {
		raw, err := readPluginFile(dir, spec.Chart.Values)
		if err != nil {
			return nil, nil, err
		}
		if values, err = parseYAMLMap(raw); err != nil {
			return nil, nil, fmt.Errorf("values: %w", err)
		}
	}
	if spec.Chart.InstallValues != nil && len(spec.Chart.InstallValues.Raw) > 0 {
		raw := strings.ReplaceAll(string(spec.Chart.InstallValues.Raw), "{{cluster}}", clusterID)
		var extra map[string]any
		if err := json.Unmarshal([]byte(raw), &extra); err != nil {
			return nil, nil, fmt.Errorf("installValues: %w", err)
		}
		values = mergeValues(values, extra)
	}
	return ch, values, nil
}

// detect refuses install mode where the tool already runs (connect to it
// instead) and connect mode where it does not.
func detect(ctx context.Context, in PreflightInput, res *PreflightResult) error {
	d := in.Spec.Detect
	if d == nil || in.Probe == nil {
		return nil
	}
	probe, err := kubernetes.NewForConfig(in.Probe)
	if err != nil {
		return err
	}
	problem := func(format string, args ...any) { res.Problems = append(res.Problems, fmt.Sprintf(format, args...)) }
	var served []string
	for _, r := range d.APIResources {
		ok, err := APIResourceServed(probe, r)
		if err != nil {
			return fmt.Errorf("discovery: %w", err)
		}
		if ok {
			served = append(served, r)
		}
	}
	switch in.Mode {
	case v1alpha1.ModeConnect:
		if len(served) == 0 {
			problem("nothing to connect to: the cluster does not serve %s (install it, or use Install mode)", strings.Join(d.APIResources, ", "))
		}
	case v1alpha1.ModeInstall:
		for _, ns := range d.Namespaces {
			if _, err := probe.CoreV1().Namespaces().Get(ctx, ns, metav1.GetOptions{}); err == nil {
				problem("namespace %s exists: the tool is already installed (e.g. by an operator); use Connect existing", ns)
			}
		}
		dyn, err := dynamic.NewForConfig(in.Installer)
		if err != nil {
			return err
		}
		crdGVR := schema.GroupVersionResource{Group: "apiextensions.k8s.io", Version: "v1", Resource: "customresourcedefinitions"}
		for _, r := range served {
			group, resource, _ := strings.Cut(r, "/")
			crd, err := dyn.Resource(crdGVR).Get(ctx, resource+"."+group, metav1.GetOptions{})
			// Ours only if an earlier install of this plugin labelled it.
			if err != nil || crd.GetLabels()[v1alpha1.LabelPlugin] != pluginName(in.PluginDir) {
				problem("%s is already served by another installation; use Connect existing", r)
			}
		}
	}
	return nil
}

func mergeValues(base, over map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range base {
		out[k] = v
	}
	for k, v := range over {
		if bm, ok := out[k].(map[string]any); ok {
			if om, ok := v.(map[string]any); ok {
				out[k] = mergeValues(bm, om)
				continue
			}
		}
		out[k] = v
	}
	return out
}

func isOpenShift(groups *metav1.APIGroupList) bool {
	for _, g := range groups.Groups {
		if g.Name == "config.openshift.io" || g.Name == "route.openshift.io" {
			return true
		}
	}
	return false
}

func guessResource(o *unstructured.Unstructured) schema.GroupVersionResource {
	gv, _ := schema.ParseGroupVersion(o.GetAPIVersion())
	plural, _ := meta.UnsafeGuessKindToResource(gv.WithKind(o.GetKind()))
	return plural
}

// allows reports whether rules grant verb on group/resource (any name).
func allows(rules []rbacv1.PolicyRule, group, resource, verb string) bool {
	for _, r := range rules {
		if len(r.ResourceNames) > 0 {
			continue
		}
		if (slices.Contains(r.APIGroups, group) || slices.Contains(r.APIGroups, "*")) &&
			(slices.Contains(r.Resources, resource) || slices.Contains(r.Resources, "*")) &&
			(slices.Contains(r.Verbs, verb) || slices.Contains(r.Verbs, "*")) {
			return true
		}
	}
	return false
}

// checkRules asks the cluster whether the credential holds each
// verb/resource/name in rules (in namespace, or cluster-wide when "").
func checkRules(ctx context.Context, cs kubernetes.Interface, rules []rbacv1.PolicyRule, namespace string) ([]string, error) {
	var missing []string
	for _, r := range rules {
		names := r.ResourceNames
		if len(names) == 0 {
			names = []string{""}
		}
		for _, g := range r.APIGroups {
			for _, res := range r.Resources {
				resource, sub, _ := strings.Cut(res, "/")
				for _, verb := range r.Verbs {
					for _, name := range names {
						review := &authzv1.SelfSubjectAccessReview{Spec: authzv1.SelfSubjectAccessReviewSpec{
							ResourceAttributes: &authzv1.ResourceAttributes{
								Namespace: namespace, Verb: verb, Group: g, Resource: resource, Subresource: sub, Name: name,
							},
						}}
						out, err := cs.AuthorizationV1().SelfSubjectAccessReviews().Create(ctx, review, metav1.CreateOptions{})
						if err != nil {
							return nil, fmt.Errorf("permission check: %w", err)
						}
						if !out.Status.Allowed {
							missing = append(missing, describe(verb, g, res, name, namespace))
						}
					}
				}
			}
		}
	}
	return missing, nil
}

func describe(verb, group, resource, name, namespace string) string {
	s := verb + " " + resource
	if group != "" {
		s += "." + group
	}
	if name != "" {
		s += " " + name
	}
	if namespace != "" {
		s += " in " + namespace
	}
	return s
}

func nonEmpty(s string) string {
	if s == "" {
		return "unknown identity"
	}
	return s
}

func pluginName(dir string) string {
	parts := strings.Split(strings.TrimRight(dir, "/"), "/")
	return parts[len(parts)-1]
}

func connectFlags(mode v1alpha1.InstallMode, cfg map[string]any, spec *v1alpha1.PluginSpec) string {
	if mode != v1alpha1.ModeConnect {
		return ""
	}
	out := " --connect"
	keys := map[string]bool{spec.ConnectNamespaceKey: true}
	for _, s := range spec.Permissions.Services {
		keys[s.NamespaceKey], keys[s.ServiceKey], keys[s.PortKey] = true, true, true
	}
	var sorted []string
	for k := range keys {
		if k != "" && ConfigString(cfg, k) != "" {
			sorted = append(sorted, k)
		}
	}
	sort.Strings(sorted)
	for _, k := range sorted {
		out += fmt.Sprintf(" --set %s=%s", k, ConfigString(cfg, k))
	}
	return out
}
