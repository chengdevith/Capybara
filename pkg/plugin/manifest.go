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
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
)

// ExtensionAPIVersion is the console extension API this Capybara provides
// (web/src/extensions/types.ts and sdk/ must agree).
const ExtensionAPIVersion = 1

// ManifestFile is the manifest's name inside a plugin directory.
const ManifestFile = "plugin.yaml"

const maxIconBytes = 16 << 10

// Manifest is plugins/<name>/plugin.yaml.
type Manifest struct {
	Name                string                     `json:"name"`
	DisplayName         string                     `json:"displayName"`
	Version             string                     `json:"version"`
	Description         string                     `json:"description,omitempty"`
	Icon                string                     `json:"icon,omitempty"`
	ExtensionAPI        int                        `json:"extensionApi"`
	Scope               string                     `json:"scope"`
	Modes               []v1alpha1.InstallMode     `json:"modes"`
	ExtensionPoints     []string                   `json:"extensionPoints,omitempty"`
	Backend             string                     `json:"backend,omitempty"`
	Chart               *v1alpha1.ChartRef         `json:"chart,omitempty"`
	UI                  *v1alpha1.UIBundle         `json:"ui,omitempty"`
	Config              *ConfigSection             `json:"config,omitempty"`
	ConnectNamespaceKey string                     `json:"connectNamespaceKey,omitempty"`
	Permissions         v1alpha1.PluginPermissions `json:"permissions,omitempty"`
	Steps               []v1alpha1.InstallStep     `json:"steps,omitempty"`
	Dependencies        []string                   `json:"dependencies,omitempty"`
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
	if !nameRE.MatchString(m.Name) {
		add("name must be a short DNS label")
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
	for _, p := range s.Paths {
		if !strings.HasPrefix(p, "/") || strings.Contains(p, "..") || strings.ContainsAny(p, "?#") {
			problems = append(problems, fmt.Sprintf("service %q: path %q must be an absolute path prefix", s.Name, p))
		}
	}
	return problems
}

func validateStep(st v1alpha1.InstallStep, services []v1alpha1.ServiceAccess) []string {
	switch st.Check.Type {
	case "helm":
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
		Repository: repository, DisplayName: m.DisplayName, Version: m.Version, Description: m.Description,
		ExtensionAPI: m.ExtensionAPI, Scope: m.Scope, Modes: m.Modes, ExtensionPoints: m.ExtensionPoints,
		Chart: m.Chart, UI: m.UI, Backend: m.Backend, Permissions: m.Permissions, Steps: m.Steps,
		Dependencies: m.Dependencies, ConnectNamespaceKey: m.ConnectNamespaceKey,
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
	if spec.ExtensionAPI != ExtensionAPIVersion {
		return fmt.Errorf("written for extension API %d; this Capybara provides %d", spec.ExtensionAPI, ExtensionAPIVersion)
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
