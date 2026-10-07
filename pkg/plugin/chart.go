// Package plugin is Capybara's plugin system: the catalog, the installer
// that deploys a plugin's chart into a managed cluster, and the proxies
// that let the browser and plugin backends reach what a plugin declared.
package plugin

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"helm.sh/helm/v4/pkg/action"
	chartcommon "helm.sh/helm/v4/pkg/chart/common"
	chart "helm.sh/helm/v4/pkg/chart/v2"
	"helm.sh/helm/v4/pkg/chart/v2/loader"
	releasev1 "helm.sh/helm/v4/pkg/release/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	utilyaml "k8s.io/apimachinery/pkg/util/yaml"
	"sigs.k8s.io/yaml"
)

// MaxChartBytes bounds a chart archive.
const MaxChartBytes = 16 << 20

// LoadChart parses a chart archive.
func LoadChart(archive []byte) (*chart.Chart, error) {
	if len(archive) > MaxChartBytes {
		return nil, fmt.Errorf("chart archive is larger than %d bytes", MaxChartBytes)
	}
	return loader.LoadArchive(bytes.NewReader(archive))
}

// RenderOptions are the inputs of a client-side render.
type RenderOptions struct {
	ReleaseName string
	Namespace   string
	Values      map[string]any
	// KubeVersion of the target cluster, e.g. "v1.35.5+k3s1"; empty uses Helm's default.
	KubeVersion string
	// APIVersions available in the target cluster (e.g. "monitoring.coreos.com/v1").
	APIVersions []string
}

// Rendered is everything a chart would create.
type Rendered struct {
	// Objects in the manifest and hooks, in order.
	Objects []*unstructured.Unstructured
	// CRDs from the chart's crds/ directories (installed before the rest).
	CRDs []*unstructured.Unstructured
}

// Render renders a chart without contacting a cluster, hooks and CRDs included.
func Render(ctx context.Context, ch *chart.Chart, opts RenderOptions) (*Rendered, error) {
	cfg := &action.Configuration{}
	install := action.NewInstall(cfg)
	install.DryRunStrategy = action.DryRunClient
	install.ReleaseName = opts.ReleaseName
	install.Namespace = opts.Namespace
	install.Replace = true
	install.IncludeCRDs = false
	install.APIVersions = chartcommon.VersionSet(opts.APIVersions)
	if opts.KubeVersion != "" {
		kv, err := chartcommon.ParseKubeVersion(opts.KubeVersion)
		if err != nil {
			return nil, fmt.Errorf("kube version %q: %w", opts.KubeVersion, err)
		}
		install.KubeVersion = kv
	}
	vals := opts.Values
	if vals == nil {
		vals = map[string]any{}
	}
	r, err := install.RunWithContext(ctx, ch, vals)
	if err != nil {
		return nil, fmt.Errorf("render chart: %w", err)
	}
	rel, ok := r.(*releasev1.Release)
	if !ok {
		return nil, errors.New("render chart: unexpected release type")
	}
	out := &Rendered{}
	docs := []string{rel.Manifest}
	for _, h := range rel.Hooks {
		docs = append(docs, h.Manifest)
	}
	for _, d := range docs {
		objs, err := decodeObjects(d)
		if err != nil {
			return nil, err
		}
		out.Objects = append(out.Objects, objs...)
	}
	for _, crd := range ch.CRDObjects() {
		objs, err := decodeObjects(string(crd.File.Data))
		if err != nil {
			return nil, fmt.Errorf("crd %s: %w", crd.Filename, err)
		}
		out.CRDs = append(out.CRDs, objs...)
	}
	return out, nil
}

func decodeObjects(manifest string) ([]*unstructured.Unstructured, error) {
	var out []*unstructured.Unstructured
	dec := utilyaml.NewYAMLOrJSONDecoder(strings.NewReader(manifest), 4096)
	for {
		var m map[string]any
		if err := dec.Decode(&m); err != nil {
			if errors.Is(err, io.EOF) {
				return out, nil
			}
			return nil, fmt.Errorf("decode rendered manifest: %w", err)
		}
		if len(m) == 0 {
			continue
		}
		out = append(out, &unstructured.Unstructured{Object: m})
	}
}

// Images lists the container images the objects would run, sorted and
// de-duplicated (containers, init containers, and Prometheus Operator
// resources' image fields are not included: the operator's defaults come
// from its own flags, which are part of its Deployment's args).
func Images(objs []*unstructured.Unstructured) []string {
	seen := map[string]bool{}
	var walk func(v any)
	walk = func(v any) {
		switch t := v.(type) {
		case map[string]any:
			for _, key := range []string{"containers", "initContainers"} {
				if cs, ok := t[key].([]any); ok {
					for _, c := range cs {
						if cm, ok := c.(map[string]any); ok {
							if img, ok := cm["image"].(string); ok && img != "" {
								seen[img] = true
							}
						}
					}
				}
			}
			for _, child := range t {
				walk(child)
			}
		case []any:
			for _, child := range t {
				walk(child)
			}
		}
	}
	for _, o := range objs {
		if isTestHook(o) {
			continue // `helm test` only; never run by an install
		}
		walk(o.Object)
		// The operator starts the config reloader and Prometheus itself:
		// their images are flags on its container.
		args := containerArgs(o)
		for i, arg := range args {
			for _, flag := range []string{"--prometheus-config-reloader=", "--prometheus-default-base-image="} {
				if img, ok := strings.CutPrefix(arg, flag); ok && img != "" {
					seen[img] = true
				}
			}
			// Controllers that start pods name those images in flags
			// (Tekton: "-entrypoint-image", "<ref>"; or --x-image=<ref>).
			if imageFlagRE.MatchString(arg) && i+1 < len(args) && args[i+1] != "" {
				seen[args[i+1]] = true
			}
			if k, v, ok := strings.Cut(arg, "="); ok && imageFlagRE.MatchString(k) && v != "" {
				seen[v] = true
			}
		}
		// Prometheus resources name their image explicitly.
		if o.GetKind() == "Prometheus" {
			if img, ok, _ := unstructured.NestedString(o.Object, "spec", "image"); ok && img != "" {
				seen[img] = true
			}
		}
	}
	out := make([]string, 0, len(seen))
	for img := range seen {
		out = append(out, img)
	}
	sort.Strings(out)
	return out
}

func isTestHook(o *unstructured.Unstructured) bool {
	for _, h := range strings.Split(o.GetAnnotations()["helm.sh/hook"], ",") {
		if strings.TrimSpace(h) == "test" || strings.TrimSpace(h) == "test-success" {
			return true
		}
	}
	return false
}

// imageFlagRE matches command-line flags that take an image reference.
var imageFlagRE = regexp.MustCompile(`^--?[a-z0-9-]*-image(-[a-z]+)?$`)

func containerArgs(o *unstructured.Unstructured) []string {
	cs, _, _ := unstructured.NestedSlice(o.Object, "spec", "template", "spec", "containers")
	var args []string
	for _, c := range cs {
		cm, _ := c.(map[string]any)
		as, _, _ := unstructured.NestedStringSlice(cm, "args")
		args = append(args, as...)
	}
	return args
}

func readPluginFile(dir, rel string) ([]byte, error) {
	if !localPath(rel) {
		return nil, fmt.Errorf("%s: not a path inside the plugin directory", rel)
	}
	return os.ReadFile(filepath.Join(dir, filepath.FromSlash(rel))) //nolint:gosec // checked above
}

func parseYAMLMap(raw []byte) (map[string]any, error) {
	out := map[string]any{}
	if err := yaml.Unmarshal(raw, &out); err != nil {
		return nil, err
	}
	return out, nil
}

// chartCRDObjects decodes the chart's crds/ files.
func chartCRDObjects(ch *chart.Chart) ([]*unstructured.Unstructured, error) {
	var out []*unstructured.Unstructured
	for _, crd := range ch.CRDObjects() {
		objs, err := decodeObjects(string(crd.File.Data))
		if err != nil {
			return nil, fmt.Errorf("crd %s: %w", crd.Filename, err)
		}
		out = append(out, objs...)
	}
	return out, nil
}

// ChartAPIVersions lists "<group>/<version>" for every served version of
// the chart's CRDs (crds/ directories, dependencies included).
func ChartAPIVersions(ch *chart.Chart) ([]string, error) {
	crds, err := chartCRDObjects(ch)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, c := range crds {
		group, _, _ := unstructured.NestedString(c.Object, "spec", "group")
		versions, _, _ := unstructured.NestedSlice(c.Object, "spec", "versions")
		for _, v := range versions {
			vm, _ := v.(map[string]any)
			if name, _ := vm["name"].(string); name != "" && vm["served"] != false {
				out = append(out, group+"/"+name)
			}
		}
	}
	return out, nil
}
