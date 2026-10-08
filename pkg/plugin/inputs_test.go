package plugin

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"

	"github.com/capybara/capybara/api/v1alpha1"
)

func syncAction() v1alpha1.PluginAction {
	return v1alpha1.PluginAction{Name: "sync", Title: "Sync", Group: "argoproj.io", Version: "v1alpha1", Resource: "applications", Kind: "Application",
		Type: v1alpha1.ActionPatch,
		Patch: &runtime.RawExtension{Raw: []byte(`{"operation": {"initiatedBy": {"username": "$(user)"},
			"sync": {"revision": "$(inputs.revision)", "prune": "$(inputs.prune)", "syncOptions": ["CreateNamespace=false"]}}}`)},
		Inputs: []v1alpha1.ActionInput{
			{Name: "revision", Type: "string", Pattern: `[A-Za-z0-9._/-]{1,200}`, Optional: true},
			{Name: "prune", Type: "bool"},
		},
		ConfirmName: &v1alpha1.ActionConfirm{Input: "prune", Equals: "true"},
	}
}

func TestRenderPatch(t *testing.T) {
	a := syncAction()
	got, err := RenderPatch(a, map[string]any{"revision": "v1.2", "prune": true}, "dev")
	if err != nil {
		t.Fatal(err)
	}
	want := `{"operation":{"initiatedBy":{"username":"dev"},"sync":{"prune":true,"revision":"v1.2","syncOptions":["CreateNamespace=false"]}}}`
	if string(got) != want {
		t.Errorf("patch = %s", got)
	}
	// A missing optional input removes its field; the bool stays typed.
	got, _ = RenderPatch(a, map[string]any{"prune": false}, "dev")
	var m map[string]any
	_ = json.Unmarshal(got, &m)
	sync := m["operation"].(map[string]any)["sync"].(map[string]any)
	if _, has := sync["revision"]; has || sync["prune"] != false {
		t.Errorf("patch without revision = %s", got)
	}
	for _, bad := range []map[string]any{
		{},                                     // prune is required
		{"prune": "true"},                      // a string is not a bool
		{"prune": true, "revision": "a b"},     // pattern (anchored)
		{"prune": true, "revision": 3},         // not a string
		{"prune": true, "operation": "x"},      // undeclared
		{"prune": true, "revision": "$(user)"}, // values are never placeholders... but must still match the pattern
	} {
		if _, err := RenderPatch(a, bad, "dev"); err == nil {
			t.Errorf("inputs %v accepted", bad)
		}
	}
	// Values are inserted as data: an input that looks like a placeholder stays literal.
	b := syncAction()
	b.Inputs[0].Pattern = ""
	got, _ = RenderPatch(b, map[string]any{"prune": false, "revision": "$(user)"}, "dev")
	if !strings.Contains(string(got), `"revision":"$(user)"`) {
		t.Errorf("an input was expanded: %s", got)
	}
}

func TestNeedsConfirmAndConditions(t *testing.T) {
	a := syncAction()
	if needsConfirm(a.ConfirmName, map[string]any{"prune": false}) || !needsConfirm(a.ConfirmName, map[string]any{"prune": true}) {
		t.Error("confirm only when pruning")
	}
	if !needsConfirm(&v1alpha1.ActionConfirm{}, nil) || needsConfirm(nil, nil) {
		t.Error("confirm without an input is always needed")
	}

	app := &unstructured.Unstructured{Object: map[string]any{"spec": map[string]any{
		"source": map[string]any{"repoURL": "https://x"}, "syncPolicy": map[string]any{"automated": map[string]any{}}}}}
	rollback := &v1alpha1.ActionCondition{Absent: []string{"spec.syncPolicy.automated", "spec.sources"}}
	if why := conditionBlocks(app, rollback); why != "spec.syncPolicy.automated is set" {
		t.Errorf("rollback with auto-sync: %q", why)
	}
	unstructured.RemoveNestedField(app.Object, "spec", "syncPolicy", "automated")
	if why := conditionBlocks(app, rollback); why != "" {
		t.Errorf("rollback without auto-sync: %q", why)
	}
	_ = unstructured.SetNestedSlice(app.Object, []any{map[string]any{}}, "spec", "sources")
	if why := conditionBlocks(app, rollback); why != "spec.sources is set" {
		t.Errorf("rollback of a multi-source app: %q", why)
	}
	// Status conditions still work, and both parts must hold.
	run := &unstructured.Unstructured{Object: map[string]any{"status": map[string]any{"conditions": []any{map[string]any{"type": "Succeeded", "status": "True"}}}}}
	if why := conditionBlocks(run, &v1alpha1.ActionCondition{Type: "Succeeded", Status: []string{"Unknown"}}); why != "Succeeded is True" {
		t.Errorf("cancel a finished run: %q", why)
	}
}

func TestPolicyPlaceholdersAndMatch(t *testing.T) {
	rules := []v1alpha1.ObjectRule{
		{Path: "spec.project", Default: "capybara-{{project}}"},
		{Path: "spec.project", Allow: []string{"capybara-{{project}}"}},
		{Path: "spec.destination.namespace", Default: "{{namespace}}"},
		{Path: "spec.destination.namespace", Allow: []string{"{{namespace}}"}},
		{Path: "spec.source.repoURL", Match: `^(https://.+|(http|git)://[^/]+\.svc(\.cluster\.local)?(:[0-9]+)?/.*)$`},
		{Path: "spec.note", Match: `^{{project}}$`},
	}
	vars := PolicyVars("team.a", "team-a", "dev-1")
	filled := SubstituteRules(rules, vars)
	if rules[0].Default != "capybara-{{project}}" {
		t.Fatal("SubstituteRules changed its input")
	}
	check := func(obj string) string {
		var m map[string]any
		if err := json.Unmarshal([]byte(obj), &m); err != nil {
			t.Fatal(err)
		}
		v, err := ApplyPolicy(context.Background(), filled, m, nil)
		if err != nil {
			t.Fatal(err)
		}
		var paths []string
		for _, x := range v {
			paths = append(paths, x.Path)
		}
		return strings.Join(paths, " ")
	}
	if got := check(`{"spec": {"source": {"repoURL": "https://github.com/x/y"}}}`); got != "" {
		t.Errorf("defaults: %s", got)
	}
	if got := check(`{"spec": {"project": "default", "destination": {"namespace": "kube-system"}, "source": {"repoURL": "git://evil.example/x"}}}`); got != "spec.destination.namespace spec.project spec.source.repoURL" {
		t.Errorf("violations: %s", got)
	}
	for url, ok := range map[string]bool{
		"https://gitlab.example/x.git":                   true,
		"http://git.e2e-git.svc.cluster.local:9418/repo": true,
		"git://git.e2e-git.svc/repo":                     true,
		"http://example.com/repo":                        false,
		"ssh://git@github.com/x":                         false,
		"git@github.com:x/y.git":                         false,
		"http://svc.evil.com/repo":                       false,
	} {
		if got := check(`{"spec": {"source": {"repoURL": "`+url+`"}}}`) == ""; got != ok {
			t.Errorf("repoURL %s allowed = %v", url, got)
		}
	}
	// Placeholders in a match are quoted: "team.a" does not match "teamXa".
	if got := check(`{"spec": {"note": "teamXa", "source": {"repoURL": "https://x"}}}`); got != "spec.note" {
		t.Errorf("quoted placeholder: %s", got)
	}
}

func TestManifestChecksNewFields(t *testing.T) {
	base := func(extra string) []byte {
		return []byte(`name: gadgets
displayName: Gadgets
version: 1.0.0
extensionApi: 1
scope: per-cluster
modes: [connect]
permissions:
  console:
    clusterRules: [{apiGroups: [example.com], resources: [gadgets], verbs: [get, list, watch, patch]}]
  project:
    rules: [{apiGroups: [example.com], resources: [gadgets], verbs: [create, delete]}]
steps:
  - {name: ready, title: Ready, check: {type: apiResource, name: example.com/gadgets}}
` + extra)
	}
	for extra, want := range map[string]string{
		`objects: [{name: gadgets, group: example.com, version: v1, resource: gadgets, kind: Gadget, verbs: [delete], deleteModes: [{name: cascade, title: Cascade}]}]`:      "delete modes need the delete verb and patch",
		`objects: [{name: gadgets, group: example.com, version: v1, resource: gadgets, kind: Gadget, verbs: [create], requiresStep: nope}]`:                                  `requiresStep "nope" is not a declared step`,
		`actions: [{name: sync, title: Sync, group: example.com, version: v1, resource: gadgets, kind: Gadget, type: patch, patch: {x: "$(inputs.rev)"}}]`:                   `undeclared input "rev"`,
		`actions: [{name: sync, title: Sync, group: example.com, version: v1, resource: gadgets, kind: Gadget, type: patch, patch: {x: 1}, inputs: [{name: a, type: int}]}]`: "type string or bool",
		`actions: [{name: sync, title: Sync, group: example.com, version: v1, resource: gadgets, kind: Gadget, type: patch, patch: {x: 1}, confirmName: {input: b}}]`:        `confirmName names undeclared input "b"`,
		`uninstallBlockers: [{group: example.com, version: v1, resource: gadgets, kind: Gadget}]`:                                                                            "needs group, version, resource, kind and a message",
		`policies: {p: {rules: [{path: spec.x, match: "("}]}}`:                                                                                                               "match:",
	} {
		_, err := ParseManifest(base(extra))
		if err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("%s:\n  got %v\n  want %q", extra, err, want)
		}
	}
	fieldStep := strings.Replace(string(base("")), "{name: ready, title: Ready, check: {type: apiResource, name: example.com/gadgets}}",
		"{name: mode, title: Mode, informational: true, check: {type: field, fields: [{version: v1, resource: configmaps, name: cm, path: data.x}]}}", 1)
	if _, err := ParseManifest([]byte(fieldStep)); err == nil || !strings.Contains(err.Error(), "each field needs") {
		t.Errorf("field check without contains: %v", err)
	}
}
