package main

import (
	"bytes"
	"strings"
	"testing"

	"github.com/capybara/capybara/pkg/plugin"
)

const manifest = `# header comment only
---
apiVersion: v1
kind: Namespace
metadata:
  name: tool
---
apiVersion: v1
kind: Namespace
metadata:
  name: tool-extra
---
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: widgets.example.com
spec:
  group: example.com
  scope: Namespaced
  names: {plural: widgets, singular: widget, kind: Widget, listKind: WidgetList}
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema: {type: object}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: flags
  namespace: tool-extra
data:
  # Remote fetching.
  enable-git: "true"
  enable-cluster: "true"
`

func build() Build {
	var b Build
	b.Source = "release.yaml"
	b.Chart.Name, b.Chart.Version = "tool", "1.0.0"
	b.DropNamespaces = []string{"tool"}
	b.ConfigMapData = []ConfigMapEdit{{Namespace: "tool-extra", Name: "flags", Data: map[string]string{"enable-git": "false"}}}
	return b
}

func TestBuildChart(t *testing.T) {
	a, err := BuildChart(build(), manifest)
	if err != nil {
		t.Fatal(err)
	}
	again, _ := BuildChart(build(), manifest)
	if !bytes.Equal(a, again) {
		t.Fatal("two builds differ")
	}
	ch, err := plugin.LoadChart(a)
	if err != nil {
		t.Fatal(err)
	}
	if len(ch.CRDObjects()) != 1 {
		t.Errorf("crds = %d", len(ch.CRDObjects()))
	}
	if len(ch.Templates) != 1 {
		t.Fatalf("templates = %d", len(ch.Templates))
	}
	tmpl := string(ch.Templates[0].Data)
	if strings.Contains(tmpl, "name: tool\n") || !strings.Contains(tmpl, "name: tool-extra") {
		t.Errorf("namespaces not dropped as asked:\n%s", tmpl)
	}
	if !strings.Contains(tmpl, `enable-git: "false"`) || !strings.Contains(tmpl, `enable-cluster: "true"`) || !strings.Contains(tmpl, "# Remote fetching.") {
		t.Errorf("ConfigMap edit:\n%s", tmpl)
	}
	if strings.Contains(tmpl, "CustomResourceDefinition") {
		t.Error("CRD left in templates")
	}
}

func TestBuildChartRefusals(t *testing.T) {
	for name, c := range map[string]struct {
		edit     func(*Build)
		manifest string
		want     string
	}{
		"template braces": {func(*Build) {}, manifest + "# {{ x }}\n", `contains "{{"`},
		"missing key":     {func(b *Build) { b.ConfigMapData[0].Data = map[string]string{"enable-hub": "false"} }, manifest, `no data key "enable-hub"`},
		"missing map":     {func(b *Build) { b.ConfigMapData[0].Name = "nope" }, manifest, "no ConfigMap tool-extra/nope"},
		"missing ns":      {func(b *Build) { b.DropNamespaces = []string{"other"} }, manifest, "no Namespace other"},
	} {
		b := build()
		c.edit(&b)
		if _, err := BuildChart(b, c.manifest); err == nil || !strings.Contains(err.Error(), c.want) {
			t.Errorf("%s: %v", name, err)
		}
	}
}
