package plugin

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/validation"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
)

// The console extension API this Capybara provides, as major.minor
// (sdk/src/extensions.ts must agree). Minor versions only add; a plugin
// declares the lowest 1.M it works with (minExtensionApi).
const (
	ExtensionAPIVersion = 1 // major
	ExtensionAPIMinor   = 3
)

// CheckExtensionAPI says why a plugin needing major and min ("1.M", empty
// for 1.0) cannot run on this Capybara, or "" when it can.
func CheckExtensionAPI(major int, min string) string {
	if major != ExtensionAPIVersion {
		return fmt.Sprintf("written for extension API %d.x; this Capybara provides %d.%d", major, ExtensionAPIVersion, ExtensionAPIMinor)
	}
	if min == "" {
		return ""
	}
	var mj, mn int
	if _, err := fmt.Sscanf(min, "%d.%d", &mj, &mn); err != nil || mj != major {
		return fmt.Sprintf("minExtensionApi %q must be %d.<minor>", min, major)
	}
	if mn > ExtensionAPIMinor {
		return fmt.Sprintf("needs extension API %s; this Capybara provides %d.%d", min, ExtensionAPIVersion, ExtensionAPIMinor)
	}
	return ""
}

// ManifestFile is the manifest's name inside a plugin directory.
const ManifestFile = "plugin.yaml"

const maxIconBytes = 16 << 10

// Manifest is plugins/<name>/plugin.yaml.
type Manifest struct {
	Name                string                           `json:"name"`
	DisplayName         string                           `json:"displayName"`
	Version             string                           `json:"version"`
	Description         string                           `json:"description,omitempty"`
	Icon                string                           `json:"icon,omitempty"`
	ExtensionAPI        int                              `json:"extensionApi"`
	MinExtensionAPI     string                           `json:"minExtensionApi,omitempty"`
	Scope               string                           `json:"scope"`
	Modes               []v1alpha1.InstallMode           `json:"modes"`
	ExtensionPoints     []string                         `json:"extensionPoints,omitempty"`
	Backend             string                           `json:"backend,omitempty"`
	Chart               *v1alpha1.ChartRef               `json:"chart,omitempty"`
	UI                  *v1alpha1.UIBundle               `json:"ui,omitempty"`
	Config              *ConfigSection                   `json:"config,omitempty"`
	ConnectNamespaceKey string                           `json:"connectNamespaceKey,omitempty"`
	Permissions         v1alpha1.PluginPermissions       `json:"permissions,omitempty"`
	Steps               []v1alpha1.InstallStep           `json:"steps,omitempty"`
	Dependencies        []string                         `json:"dependencies,omitempty"`
	Actions             []v1alpha1.PluginAction          `json:"actions,omitempty"`
	Objects             []v1alpha1.PluginObject          `json:"objects,omitempty"`
	Policies            map[string]v1alpha1.ObjectPolicy `json:"policies,omitempty"`
	Detect              *v1alpha1.Detect                 `json:"detect,omitempty"`
	UninstallBlockers   []v1alpha1.UninstallBlocker      `json:"uninstallBlockers,omitempty"`
}

// ConfigSection holds the installation config schema.
type ConfigSection struct {
	Schema map[string]any `json:"schema"`
}

var (
	nameRE    = regexp.MustCompile(`^[a-z0-9]([-a-z0-9]{0,30}[a-z0-9])?$`)
	versionRE = regexp.MustCompile(`^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$`)
	sha256RE  = regexp.MustCompile(`^[0-9a-f]{64}$`)
	dnsRE     = regexp.MustCompile(`^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`)
)

var knownExtensionPoints = []string{
	"nav-section", "nav-item", "route", "resource-detail-tab", "resource-action",
	"cluster-overview-card", "project-overview-card", "settings-page",
}

// ParseManifest decodes and validates a manifest (files are not read).
func ParseManifest(raw []byte) (*Manifest, error) {
	var m Manifest
	if err := yaml.UnmarshalStrict(raw, &m); err != nil {
		return nil, fmt.Errorf("plugin.yaml: %w", err)
	}
	var problems []string
	add := func(format string, args ...any) { problems = append(problems, fmt.Sprintf(format, args...)) }
	if !nameRE.MatchString(m.Name) || m.Name == "installations" {
		add("name must be a short DNS label (not \"installations\")")
	}
	if m.DisplayName == "" {
		add("displayName is required")
	}
	if !versionRE.MatchString(m.Version) {
		add("version must be semver (x.y.z)")
	}
	if m.Scope != "per-cluster" && m.Scope != "global" {
		add("scope must be per-cluster or global")
	}
	if len(m.Modes) == 0 {
		add("modes is required")
	}
	for _, mode := range m.Modes {
		if mode != v1alpha1.ModeInstall && mode != v1alpha1.ModeConnect {
			add("unknown mode %q", mode)
		}
	}
	for _, ep := range m.ExtensionPoints {
		if !slices.Contains(knownExtensionPoints, ep) {
			add("unknown extension point %q", ep)
		}
	}
	if slices.Contains(m.Modes, v1alpha1.ModeInstall) && m.Chart == nil {
		add("install mode needs a chart")
	}
	if c := m.Chart; c != nil {
		if !sha256RE.MatchString(c.SHA256) {
			add("chart.sha256 must be 64 hex characters")
		}
		if !dnsRE.MatchString(c.ReleaseName) || !dnsRE.MatchString(c.Namespace) {
			add("chart.releaseName and chart.namespace must be DNS labels")
		}
		for _, f := range []string{c.Archive, c.Values} {
			if f != "" && !localPath(f) {
				add("chart files must be relative paths inside the plugin directory")
			}
		}
		for k, v := range c.NamespaceLabels {
			if errs := validation.IsQualifiedName(k); len(errs) > 0 {
				add("chart.namespaceLabels: %q: %s", k, strings.Join(errs, "; "))
			}
			if errs := validation.IsValidLabelValue(v); len(errs) > 0 {
				add("chart.namespaceLabels %s: %s", k, strings.Join(errs, "; "))
			}
		}
		for _, p := range c.RefuseInstallOn {
			if p != "openshift" {
				add("chart.refuseInstallOn: unknown platform %q", p)
			}
		}
		for _, g := range c.GeneratedSecrets {
			if !dnsRE.MatchString(g.Name) || len(g.Keys) == 0 {
				add("generated secret %q: needs a DNS name and keys", g.Name)
			}
			for _, k := range g.Keys {
				if k.Name == "" || (k.Value == "") == !k.Random {
					add("generated secret %q: each key needs a name and exactly one of value or random", g.Name)
				}
			}
		}
	}
	if u := m.UI; u != nil {
		if !sha256RE.MatchString(u.SHA256) {
			add("ui.sha256 must be 64 hex characters")
		}
		if !localPath(u.Bundle) || !strings.HasSuffix(u.Bundle, ".js") {
			add("ui.bundle must be a .js file inside the plugin directory")
		}
	}
	if m.Icon != "" && (!localPath(m.Icon) || !strings.HasSuffix(m.Icon, ".svg")) {
		add("icon must be an .svg file inside the plugin directory")
	}
	if m.Backend != "" && !nameRE.MatchString(m.Backend) {
		add("backend must be a short DNS label")
	}
	for _, s := range m.Permissions.Services {
		problems = append(problems, validateService(s)...)
	}
	for _, st := range m.Steps {
		problems = append(problems, validateStep(st, m.Permissions.Services)...)
	}
	if m.Config != nil {
		if err := checkSchema(m.Config.Schema); err != nil {
			add("config.schema: %v", err)
		}
	}
	if m.MinExtensionAPI != "" && !regexp.MustCompile(`^\d+\.\d+$`).MatchString(m.MinExtensionAPI) {
		add("minExtensionApi must look like 1.1")
	}
	steps := map[string]bool{}
	for _, st := range m.Steps {
		steps[st.Name] = true
	}
	requiresStep := func(what, step string) {
		if step != "" && !steps[step] {
			add("%s: requiresStep %q is not a declared step", what, step)
		}
	}
	problems = append(problems, validateProjectAccess(m.Permissions.Project)...)
	problems = append(problems, validatePolicies(m.Policies)...)
	problems = append(problems, validateObjects(m.Objects, m.Policies, m.Permissions.Project)...)
	for _, o := range m.Objects {
		requiresStep("object "+o.Name, o.RequiresStep)
	}
	for _, a := range m.Actions {
		problems = append(problems, validateAction(a, m.Permissions, m.Policies)...)
		requiresStep("action "+a.Name, a.RequiresStep)
	}
	for _, b := range m.UninstallBlockers {
		if !dnsRE.MatchString(b.Resource) || b.Version == "" || b.Kind == "" || b.Message == "" {
			add("uninstallBlockers: %q needs group, version, resource, kind and a message", b.Resource)
		}
	}
	if d := m.Detect; d != nil {
		for _, r := range d.APIResources {
			if g, res, ok := strings.Cut(r, "/"); !ok || g == "" || !dnsRE.MatchString(res) {
				add("detect.apiResources: %q must be <group>/<resource>", r)
			}
		}
	}
	if len(problems) > 0 {
		return nil, &ManifestError{Problems: problems}
	}
	return &m, nil
}

// ManifestError lists what is wrong with a manifest.
type ManifestError struct{ Problems []string }

func (e *ManifestError) Error() string {
	return "invalid plugin manifest: " + strings.Join(e.Problems, "; ")
}

func localPath(p string) bool {
	return p != "" && !path.IsAbs(p) && !strings.Contains(p, "\\") && path.Clean(p) == p && !strings.HasPrefix(p, "..")
}

var methods = []string{"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"}

func validateService(s v1alpha1.ServiceAccess) []string {
	var problems []string
	if !nameRE.MatchString(s.Name) {
		problems = append(problems, fmt.Sprintf("service %q: name must be a DNS label", s.Name))
	}
	if len(s.Methods) == 0 || len(s.Paths) == 0 {
		problems = append(problems, fmt.Sprintf("service %q: methods and paths are required", s.Name))
	}
	for _, m := range s.Methods {
		if !slices.Contains(methods, m) {
			problems = append(problems, fmt.Sprintf("service %q: unknown method %q", s.Name, m))
		}
	}
	for _, p := range append(append([]string{}, s.Paths...), s.WritePaths...) {
		if !strings.HasPrefix(p, "/") || strings.Contains(p, "..") || strings.ContainsAny(p, "?#") {
			problems = append(problems, fmt.Sprintf("service %q: path %q must be an absolute path prefix", s.Name, p))
		}
	}
	return problems
}

func validateStep(st v1alpha1.InstallStep, services []v1alpha1.ServiceAccess) []string {
	switch st.Check.Type {
	case "apiResource":
		if g, r, ok := strings.Cut(st.Check.Name, "/"); !ok || g == "" || r == "" {
			return []string{fmt.Sprintf("step %q: apiResource checks need name <group>/<resource>", st.Name)}
		}
	case "dryRun":
		if st.Check.Object == nil || len(st.Check.Object.Raw) == 0 {
			return []string{fmt.Sprintf("step %q: dryRun checks need an object", st.Name)}
		}
	case "helm":
	case "field":
		if len(st.Check.Fields) == 0 {
			return []string{fmt.Sprintf("step %q: field checks need fields", st.Name)}
		}
		for _, f := range st.Check.Fields {
			if !dnsRE.MatchString(f.Resource) || f.Version == "" || f.Path == "" || f.Contains == "" || (f.Namespace != "" && f.NamespaceKey != "") {
				return []string{fmt.Sprintf("step %q: each field needs version, resource, path, contains and at most one of namespace/namespaceKey", st.Name)}
			}
		}
	case "workload":
		if !slices.Contains([]string{"Deployment", "StatefulSet", "DaemonSet"}, st.Check.Kind) || !dnsRE.MatchString(st.Check.Name) {
			return []string{fmt.Sprintf("step %q: workload checks need kind Deployment/StatefulSet/DaemonSet and a name", st.Name)}
		}
	case "service":
		if !slices.ContainsFunc(services, func(s v1alpha1.ServiceAccess) bool { return s.Name == st.Check.Service }) {
			return []string{fmt.Sprintf("step %q: unknown service %q", st.Name, st.Check.Service)}
		}
	default:
		return []string{fmt.Sprintf("step %q: unknown check type %q", st.Name, st.Check.Type)}
	}
	return nil
}

// validateAction checks an action is well formed and that the console
// permissions allow it (create for copy, patch for patch), or for a
// Project-only action, the per-Project grant.
func validateAction(a v1alpha1.PluginAction, perms v1alpha1.PluginPermissions, policies map[string]v1alpha1.ObjectPolicy) []string {
	var problems []string
	add := func(format string, args ...any) {
		problems = append(problems, fmt.Sprintf("action %q: "+format, append([]any{a.Name}, args...)...))
	}
	if !nameRE.MatchString(a.Name) || a.Title == "" {
		add("needs a DNS-label name and a title")
	}
	if !dnsRE.MatchString(a.Resource) || a.Version == "" || a.Kind == "" {
		add("needs group, version, resource and kind")
	}
	verb := "create"
	switch a.Type {
	case v1alpha1.ActionCopy:
		if len(a.CopyFields) == 0 {
			add("copy needs copyFields")
		}
		for _, f := range a.CopyFields {
			if !strings.HasPrefix(f, "spec.") {
				add("copyFields must be under spec (got %q)", f)
			}
		}
	case v1alpha1.ActionPatch:
		verb = "patch"
		if a.Patch == nil || len(a.Patch.Raw) == 0 {
			add("patch needs a patch")
		}
	default:
		add("unknown type %q", a.Type)
	}
	inputs := map[string]bool{}
	for _, in := range a.Inputs {
		inputs[in.Name] = true
		if !regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9]*$`).MatchString(in.Name) || (in.Type != "string" && in.Type != "bool") {
			add("input %q needs a name (letters and digits) and type string or bool", in.Name)
		}
		if in.Pattern != "" {
			if _, err := regexp.Compile(in.Pattern); err != nil {
				add("input %q: pattern: %v", in.Name, err)
			}
		}
	}
	if len(a.Inputs) > 0 && a.Type != v1alpha1.ActionPatch {
		add("only patch actions take inputs")
	}
	if a.Patch != nil {
		for _, m := range regexp.MustCompile(`\$\(inputs\.([^)]*)\)`).FindAllStringSubmatch(string(a.Patch.Raw), -1) {
			if !inputs[m[1]] {
				add("patch uses undeclared input %q", m[1])
			}
		}
	}
	if c := a.ConfirmName; c != nil && c.Input != "" && !inputs[c.Input] {
		add("confirmName names undeclared input %q", c.Input)
	}
	if w := a.When; w != nil {
		if w.Type == "" && len(w.Absent) == 0 && len(w.Present) == 0 {
			add("when needs a condition type, absent or present fields")
		}
		for _, f := range append(slices.Clone(w.Absent), w.Present...) {
			if err := ValidatePath(f); err != nil {
				add("when.absent %q: %v", f, err)
			}
		}
	}
	if a.Policy != "" {
		if _, ok := policies[a.Policy]; !ok {
			add("no policy %q", a.Policy)
		}
		if !a.ProjectOnly {
			add("an action with a policy must be projectOnly")
		}
	}
	if a.ProjectOnly {
		if perms.Project == nil || !allows(toRBAC(perms.Project.Rules), a.Group, a.Resource, verb) {
			add("permissions.project must allow %s on %s", verb, a.Resource)
		}
	} else if !allows(toRBAC(perms.Console.ClusterRules), a.Group, a.Resource, verb) {
		add("permissions.console must allow %s on %s", verb, a.Resource)
	}
	return problems
}

func validateProjectAccess(pa *v1alpha1.ProjectAccess) []string {
	if pa == nil {
		return nil
	}
	var problems []string
	if len(pa.Rules) == 0 {
		problems = append(problems, "permissions.project needs rules")
	}
	for _, sa := range pa.ServiceAccounts {
		if !dnsRE.MatchString(sa.Name) {
			problems = append(problems, fmt.Sprintf("permissions.project: service account %q is not a DNS name", sa.Name))
		}
	}
	for i, o := range pa.Objects {
		if _, err := RenderProjectObject(o, ProjectRef{Name: "x", Namespace: "x"}, "x", "x"); err != nil {
			problems = append(problems, fmt.Sprintf("permissions.project.objects[%d]: %v", i, err))
		}
	}
	return problems
}

func validatePolicies(policies map[string]v1alpha1.ObjectPolicy) []string {
	var problems []string
	for name, p := range policies {
		if _, err := ResolvePolicy(policies, name); err != nil {
			problems = append(problems, err.Error())
		}
		for i, r := range p.Rules {
			at := fmt.Sprintf("policy %q rule %d", name, i)
			if err := ValidatePath(r.Path); err != nil {
				problems = append(problems, at+": "+err.Error())
			}
			kinds := 0
			for _, set := range []bool{r.Deny, len(r.Allow) > 0, r.Default != "", len(r.AllowKeys) > 0 || len(r.ExactlyOneOf) > 0, r.WithinQuota != "", r.CountQuota != "", r.Match != ""} {
				if set {
					kinds++
				}
			}
			if kinds != 1 {
				problems = append(problems, at+": needs exactly one of deny, allow, default, allowKeys/exactlyOneOf, withinQuota, countQuota, match")
			}
			if r.Match != "" {
				if _, err := regexp.Compile(SubstituteRules([]v1alpha1.ObjectRule{r}, PolicyVars("x", "x", "x"))[0].Match); err != nil {
					problems = append(problems, at+": match: "+err.Error())
				}
			}
			if r.Equals != "" && !r.Deny {
				problems = append(problems, at+": equals goes with deny")
			}
		}
	}
	return problems
}

func validateObjects(objects []v1alpha1.PluginObject, policies map[string]v1alpha1.ObjectPolicy, project *v1alpha1.ProjectAccess) []string {
	var problems []string
	names := map[string]bool{}
	for _, o := range objects {
		names[o.Name] = true
	}
	for _, o := range objects {
		add := func(format string, args ...any) {
			problems = append(problems, fmt.Sprintf("object %q: "+format, append([]any{o.Name}, args...)...))
		}
		if !dnsRE.MatchString(o.Name) || !dnsRE.MatchString(o.Resource) || o.Version == "" || o.Kind == "" {
			add("needs a name, group, version, resource and kind")
		}
		if len(o.Verbs) == 0 {
			add("needs verbs")
		}
		if o.Policy != "" {
			if _, ok := policies[o.Policy]; !ok {
				add("no policy %q", o.Policy)
			}
		}
		for _, v := range o.Verbs {
			if project == nil || !allows(toRBAC(project.Rules), o.Group, o.Resource, string(v)) {
				add("permissions.project must allow %s on %s", v, o.Resource)
			}
		}
		for verb, action := range o.Audit {
			if !slices.Contains(o.Verbs, v1alpha1.ObjectVerb(verb)) || !nameRE.MatchString(action) {
				add("audit maps %q to %q: needs a declared verb and a DNS-label action", verb, action)
			}
		}
		modes := map[string]bool{}
		for _, m := range o.DeleteModes {
			if !dnsRE.MatchString(m.Name) || m.Title == "" || modes[m.Name] {
				add("delete mode %q needs a unique DNS-label name and a title", m.Name)
			}
			modes[m.Name] = true
		}
		if len(o.DeleteModes) > 0 && (!slices.Contains(o.Verbs, v1alpha1.ObjectDelete) || project == nil || !allows(toRBAC(project.Rules), o.Group, o.Resource, "patch")) {
			add("delete modes need the delete verb and patch in permissions.project (finalizers are set first)")
		}
		if o.Cleanup != nil && (o.Cleanup.GroupLabel == "" || o.Cleanup.FinishedCondition == "" || !slices.Contains(o.Verbs, v1alpha1.ObjectDelete)) {
			add("cleanup needs groupLabel, finishedCondition and the delete verb")
		}
		for _, ref := range o.References {
			if err := ValidatePath(ref.Path); err != nil || !names[ref.Object] {
				add("reference %q -> %q: needs a valid path and a declared object", ref.Path, ref.Object)
			}
		}
	}
	return problems
}

// LoadDir reads and verifies the plugin in dir: manifest, then the chart
// archive and UI bundle against their pinned hashes. The returned spec is
// what the catalog stores; a non-nil problem means the plugin is listed
// but cannot be installed.
func LoadDir(dir, repository string) (*Manifest, *v1alpha1.PluginSpec, error) {
	raw, err := os.ReadFile(filepath.Join(dir, ManifestFile)) //nolint:gosec // inside the plugins directory
	if err != nil {
		return nil, nil, err
	}
	m, err := ParseManifest(raw)
	if err != nil {
		return nil, nil, err
	}
	spec := &v1alpha1.PluginSpec{
		Name: m.Name, Repository: repository, DisplayName: m.DisplayName, Version: m.Version, Description: m.Description,
		ExtensionAPI: m.ExtensionAPI, Scope: m.Scope, Modes: m.Modes, ExtensionPoints: m.ExtensionPoints,
		Chart: m.Chart, UI: m.UI, Backend: m.Backend, Permissions: m.Permissions, Steps: m.Steps,
		Dependencies: m.Dependencies, ConnectNamespaceKey: m.ConnectNamespaceKey,
		MinExtensionAPI: m.MinExtensionAPI, Actions: m.Actions, Detect: m.Detect,
		Objects: m.Objects, Policies: m.Policies, UninstallBlockers: m.UninstallBlockers,
	}
	if m.Config != nil {
		b, _ := json.Marshal(m.Config.Schema)
		spec.ConfigSchema = &runtime.RawExtension{Raw: b}
	}
	if m.Icon != "" {
		icon, err := os.ReadFile(filepath.Join(dir, filepath.FromSlash(m.Icon))) //nolint:gosec // inside the plugins directory
		if err == nil && len(icon) <= maxIconBytes {
			spec.Icon = "data:image/svg+xml;base64," + base64.StdEncoding.EncodeToString(icon)
		}
	}
	return m, spec, Verify(dir, spec)
}

// ErrHashMismatch means a file does not match its pinned sha256.
var ErrHashMismatch = errors.New("sha256 does not match the manifest")

// Verify checks the files a spec pins, and the extension API version.
func Verify(dir string, spec *v1alpha1.PluginSpec) error {
	if why := CheckExtensionAPI(spec.ExtensionAPI, spec.MinExtensionAPI); why != "" {
		return errors.New(why)
	}
	if spec.Chart != nil {
		if _, err := ReadPinned(dir, spec.Chart.Archive, spec.Chart.SHA256); err != nil {
			return fmt.Errorf("chart: %w", err)
		}
	}
	if spec.UI != nil {
		if _, err := ReadPinned(dir, spec.UI.Bundle, spec.UI.SHA256); err != nil {
			return &UIBundleError{Err: err}
		}
	}
	return nil
}

// UIBundleError is a UI bundle that is missing or does not match its pin.
// With --plugin-dev-dir it is tolerated (the dev bundle is served instead).
type UIBundleError struct{ Err error }

func (e *UIBundleError) Error() string { return "ui bundle: " + e.Err.Error() }
func (e *UIBundleError) Unwrap() error { return e.Err }

// ReadPinned reads a file inside dir and checks its sha256.
func ReadPinned(dir, rel, wantHex string) ([]byte, error) {
	if !localPath(rel) {
		return nil, fmt.Errorf("%s: not a path inside the plugin directory", rel)
	}
	b, err := os.ReadFile(filepath.Join(dir, filepath.FromSlash(rel))) //nolint:gosec // checked above
	if err != nil {
		return nil, fmt.Errorf("%s: %w", rel, err)
	}
	sum := sha256.Sum256(b)
	if hex.EncodeToString(sum[:]) != wantHex {
		return nil, fmt.Errorf("%s: %w", rel, ErrHashMismatch)
	}
	return b, nil
}
