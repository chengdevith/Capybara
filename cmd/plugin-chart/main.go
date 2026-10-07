// Command plugin-chart builds a plugin's Helm chart from a vendored upstream
// manifest (for tools that ship plain YAML, not a chart), deterministically:
// the same inputs give the same archive bytes, so its sha256 can be pinned
// in plugin.yaml and make lint can rebuild and compare it.
//
// plugins/<name>/upstream/build.yaml says what to build:
//
//	source: release-v1.17.0.yaml        # vendored, pinned by sha256
//	sha256: <hex>
//	chart: {name: tekton-pipelines, version: 1.17.0, appVersion: v1.17.0, description: …}
//	dropNamespaces: [tekton-pipelines]  # the release namespace: the controller creates it
//	configMapData:                      # the only edits: ConfigMap values
//	  - {namespace: …, name: …, data: {key: value}}
//
// CustomResourceDefinitions go to crds/ (one file each), everything else to
// templates/ unchanged; a manifest containing "{{" is refused (Helm would
// treat it as a template).
//
//	go run ./cmd/plugin-chart -plugin plugins/tekton          build, print the sha256
//	go run ./cmd/plugin-chart -plugin plugins/tekton -check   fail unless the committed archive is identical
package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"sigs.k8s.io/yaml"
)

// Build is plugins/<name>/upstream/build.yaml.
type Build struct {
	Source string `json:"source"`
	SHA256 string `json:"sha256"`
	URL    string `json:"url,omitempty"`
	Chart  struct {
		Name        string `json:"name"`
		Version     string `json:"version"`
		AppVersion  string `json:"appVersion"`
		Description string `json:"description"`
	} `json:"chart"`
	DropNamespaces []string        `json:"dropNamespaces,omitempty"`
	ConfigMapData  []ConfigMapEdit `json:"configMapData,omitempty"`
}

// ConfigMapEdit sets existing keys of one upstream ConfigMap.
type ConfigMapEdit struct {
	Namespace string            `json:"namespace"`
	Name      string            `json:"name"`
	Data      map[string]string `json:"data"`
}

func main() {
	dir := flag.String("plugin", "", "plugin directory, e.g. plugins/tekton")
	check := flag.Bool("check", false, "fail unless the committed archive equals a fresh build")
	flag.Parse()
	if err := run(*dir, *check); err != nil {
		fmt.Fprintln(os.Stderr, "plugin-chart:", err)
		os.Exit(1)
	}
}

func run(dir string, check bool) error {
	if dir == "" {
		return errors.New("-plugin is required")
	}
	raw, err := os.ReadFile(filepath.Join(dir, "upstream", "build.yaml")) //nolint:gosec // developer-supplied path
	if err != nil {
		return err
	}
	var b Build
	if err := yaml.UnmarshalStrict(raw, &b); err != nil {
		return fmt.Errorf("build.yaml: %w", err)
	}
	src, err := os.ReadFile(filepath.Join(dir, "upstream", b.Source)) //nolint:gosec // developer-supplied path
	if err != nil {
		return err
	}
	if sum := sha256.Sum256(src); hex.EncodeToString(sum[:]) != b.SHA256 {
		return fmt.Errorf("%s: sha256 %x does not match the pinned %s", b.Source, sum, b.SHA256)
	}
	archive, err := BuildChart(b, string(src))
	if err != nil {
		return err
	}
	out := filepath.Join(dir, "chart", fmt.Sprintf("%s-%s.tgz", b.Chart.Name, b.Chart.Version))
	sum := sha256.Sum256(archive)
	if check {
		have, err := os.ReadFile(out) //nolint:gosec // developer-supplied path
		if err != nil {
			return err
		}
		if !bytes.Equal(have, archive) {
			return fmt.Errorf("%s is not what %s builds to; run: make plugin-chart PLUGIN=%s", out, b.Source, filepath.Base(dir))
		}
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(out), 0o755); err != nil { //nolint:gosec // a source directory
		return err
	}
	if err := os.WriteFile(out, archive, 0o644); err != nil { //nolint:gosec // a committed source file
		return err
	}
	fmt.Printf("%s sha256 %x\n", out, sum)
	return nil
}

type doc struct {
	text                  string
	kind, name, namespace string
}

var separator = regexp.MustCompile(`(?m)^---[ \t]*$`)

// BuildChart returns the chart archive.
func BuildChart(b Build, manifest string) ([]byte, error) {
	if b.Chart.Name == "" || b.Chart.Version == "" {
		return nil, errors.New("chart.name and chart.version are required")
	}
	if strings.Contains(manifest, "{{") {
		return nil, errors.New(`the manifest contains "{{": Helm would render it as a template`)
	}
	var docs []doc
	for _, text := range separator.Split(manifest, -1) {
		var meta struct {
			Kind     string `json:"kind"`
			Metadata struct {
				Name      string `json:"name"`
				Namespace string `json:"namespace"`
			} `json:"metadata"`
		}
		if err := yaml.Unmarshal([]byte(text), &meta); err != nil {
			return nil, fmt.Errorf("document %d: %w", len(docs)+1, err)
		}
		if meta.Kind == "" {
			continue // comments only
		}
		docs = append(docs, doc{text: strings.TrimSpace(text) + "\n", kind: meta.Kind, name: meta.Metadata.Name, namespace: meta.Metadata.Namespace})
	}

	for _, e := range b.ConfigMapData {
		i := slices.IndexFunc(docs, func(d doc) bool { return d.kind == "ConfigMap" && d.name == e.Name && d.namespace == e.Namespace })
		if i < 0 {
			return nil, fmt.Errorf("configMapData: no ConfigMap %s/%s", e.Namespace, e.Name)
		}
		text, err := setData(docs[i].text, e.Data)
		if err != nil {
			return nil, fmt.Errorf("ConfigMap %s/%s: %w", e.Namespace, e.Name, err)
		}
		docs[i].text = text
	}

	files := map[string]string{}
	var templates []string
	dropped := map[string]bool{}
	for _, d := range docs {
		switch {
		case d.kind == "Namespace" && slices.Contains(b.DropNamespaces, d.name):
			dropped[d.name] = true
		case d.kind == "CustomResourceDefinition":
			name := "crds/" + d.name + ".yaml"
			if _, dup := files[name]; dup {
				return nil, fmt.Errorf("CRD %s appears twice", d.name)
			}
			files[name] = d.text
		default:
			templates = append(templates, d.text)
		}
	}
	for _, ns := range b.DropNamespaces {
		if !dropped[ns] {
			return nil, fmt.Errorf("dropNamespaces: no Namespace %s in the manifest", ns)
		}
	}
	files["templates/"+strings.TrimSuffix(filepath.Base(b.Source), filepath.Ext(b.Source))+".yaml"] = strings.Join(templates, "---\n")
	meta := map[string]string{"apiVersion": "v2", "name": b.Chart.Name, "version": b.Chart.Version, "appVersion": b.Chart.AppVersion,
		"description": b.Chart.Description, "type": "application"}
	chartYAML, err := yaml.Marshal(meta)
	if err != nil {
		return nil, err
	}
	files["Chart.yaml"] = "# Generated by cmd/plugin-chart from upstream/" + b.Source + ". Do not edit.\n" + string(chartYAML)
	return archive(b.Chart.Name, files)
}

// setData sets existing keys of a ConfigMap document's data, in place, so
// the upstream comments stay. Only top-level `data:` keys are touched.
func setData(text string, data map[string]string) (string, error) {
	lines := strings.Split(text, "\n")
	start := -1
	for i, l := range lines {
		if l == "data:" {
			start = i
			break
		}
	}
	if start < 0 {
		return "", errors.New("no data")
	}
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		found := false
		for i := start + 1; i < len(lines) && (lines[i] == "" || strings.HasPrefix(lines[i], " ") || strings.HasPrefix(lines[i], "#")); i++ {
			if strings.HasPrefix(lines[i], "  "+k+":") {
				lines[i] = "  " + k + ": " + strconv.Quote(data[k])
				found = true
			}
		}
		if !found {
			return "", fmt.Errorf("no data key %q", k)
		}
	}
	out := strings.Join(lines, "\n")
	// The result must still parse, with exactly the values asked for.
	var cm struct {
		Data map[string]string `json:"data"`
	}
	if err := yaml.Unmarshal([]byte(out), &cm); err != nil {
		return "", err
	}
	for _, k := range keys {
		if cm.Data[k] != data[k] {
			return "", fmt.Errorf("data key %q: got %q after the edit", k, cm.Data[k])
		}
	}
	return out, nil
}

// archive writes a .tgz with sorted entries, fixed times and modes, and no
// owner names, so the bytes depend only on the files.
func archive(name string, files map[string]string) ([]byte, error) {
	paths := make([]string, 0, len(files))
	for p := range files {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	var buf bytes.Buffer
	gz, err := gzip.NewWriterLevel(&buf, gzip.BestCompression)
	if err != nil {
		return nil, err
	}
	gz.ModTime = time.Time{}
	tw := tar.NewWriter(gz)
	for _, p := range paths {
		body := []byte(files[p])
		h := &tar.Header{Name: name + "/" + p, Mode: 0o644, Size: int64(len(body)), ModTime: time.Unix(0, 0), Typeflag: tar.TypeReg, Format: tar.FormatUSTAR}
		if err := tw.WriteHeader(h); err != nil {
			return nil, err
		}
		if _, err := tw.Write(body); err != nil {
			return nil, err
		}
	}
	if err := tw.Close(); err != nil {
		return nil, err
	}
	if err := gz.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
