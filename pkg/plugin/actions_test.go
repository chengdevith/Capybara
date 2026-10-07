package plugin

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	dynfake "k8s.io/client-go/dynamic/fake"
	k8stesting "k8s.io/client-go/testing"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
)

type fakeDyn struct{ c dynamic.Interface }

func (f fakeDyn) Dynamic(string) (dynamic.Interface, error) { return f.c, nil }

var prGVR = schema.GroupVersionResource{Group: "tekton.dev", Version: "v1", Resource: "pipelineruns"}

func pipelineRun(name, uid, succeeded string, inline bool) *unstructured.Unstructured {
	spec := map[string]any{
		"pipelineRef":     map[string]any{"name": "build"},
		"params":          []any{map[string]any{"name": "x", "value": "1"}},
		"taskRunTemplate": map[string]any{"serviceAccountName": "builder"},
		"status":          "",
	}
	if inline {
		delete(spec, "pipelineRef")
		spec["pipelineSpec"] = map[string]any{"tasks": []any{}}
	}
	o := &unstructured.Unstructured{Object: map[string]any{
		"apiVersion": "tekton.dev/v1", "kind": "PipelineRun",
		"metadata": map[string]any{"name": name, "namespace": "ci", "uid": uid,
			"labels": map[string]any{"team": "a", "tekton.dev/pipeline": "build"}},
		"spec":   spec,
		"status": map[string]any{"conditions": []any{map[string]any{"type": "Succeeded", "status": succeeded}}},
	}}
	return o
}

func tektonActionsPlugin() *v1alpha1.Plugin {
	patch := []byte(`{"spec":{"status":"Cancelled"}}`)
	return &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "tekton"}, Spec: v1alpha1.PluginSpec{
		Name: "tekton", DisplayName: "Pipelines", Version: "0.1.0",
		Actions: []v1alpha1.PluginAction{
			{Name: "rerun", Title: "Rerun", Group: "tekton.dev", Version: "v1", Resource: "pipelineruns", Kind: "PipelineRun", Type: v1alpha1.ActionCopy,
				CopyFields: []string{"spec.pipelineRef", "spec.pipelineSpec", "spec.params", "spec.workspaces", "spec.taskRunTemplate", "spec.timeouts"}},
			{Name: "cancel", Title: "Cancel", Group: "tekton.dev", Version: "v1", Resource: "pipelineruns", Kind: "PipelineRun", Type: v1alpha1.ActionPatch,
				Patch: &runtime.RawExtension{Raw: patch}, When: &v1alpha1.ActionCondition{Type: "Succeeded", Status: []string{"Unknown"}}, Danger: true},
		},
	}}
}

func TestPluginActions(t *testing.T) {
	ready := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "tekton.dev-1"},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: "tekton", Cluster: "dev-1", Mode: v1alpha1.ModeInstall, Enabled: true},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady}}
	f := newAPI(t, tektonActionsPlugin(), ready)
	scheme := runtime.NewScheme()
	dyn := dynfake.NewSimpleDynamicClientWithCustomListKinds(scheme, map[schema.GroupVersionResource]string{prGVR: "PipelineRunList"},
		pipelineRun("build-1", "u1", "True", false), pipelineRun("build-2", "u2", "Unknown", false), pipelineRun("inline-1", "u3", "False", true))
	// The fake does not implement generateName; name new objects like the API server.
	n := 0
	dyn.PrependReactor("create", "pipelineruns", func(action k8stesting.Action) (bool, runtime.Object, error) {
		o := action.(k8stesting.CreateAction).GetObject().(*unstructured.Unstructured)
		if o.GetName() == "" {
			n++
			o.SetName(fmt.Sprintf("%s%05d", o.GetGenerateName(), n))
		}
		return false, nil, nil
	})
	store, _ := audit.NewFileStore(f.auditPath)
	a := &ActionAPI{Mgmt: f.c, Clusters: fakeDyn{dyn}, Auditor: audit.NewAuditor(store, quiet), Logger: quiet}
	mux := http.NewServeMux()
	a.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	defer srv.Close()
	f.srv = srv
	ctx := context.Background()
	call := func(cluster, action string, req ActionRequest) (int, map[string]any) {
		return f.do(t, http.MethodPost, "/api/clusters/"+cluster+"/plugin-actions/tekton/"+action, req)
	}

	// Rerun: a new run with only the declared fields, generateName from the original.
	code, body := call("dev-1", "rerun", ActionRequest{Namespace: "ci", Name: "build-1", UID: "u1"})
	if code != 200 {
		t.Fatalf("rerun: %d %v", code, body)
	}
	list, _ := dyn.Resource(prGVR).Namespace("ci").List(ctx, metav1.ListOptions{})
	var rerun *unstructured.Unstructured
	for i := range list.Items {
		if list.Items[i].GetAnnotations()[CopyAnnotation] == "build-1" {
			rerun = &list.Items[i]
		}
	}
	if rerun == nil || rerun.GetGenerateName() != "build-1-" {
		t.Fatalf("rerun not created: %+v", list.Items)
	}
	if _, has := rerun.Object["status"]; has {
		t.Error("status copied")
	}
	if v, _, _ := unstructured.NestedString(rerun.Object, "spec", "status"); v != "" {
		t.Error("spec.status (cancel state) copied")
	}
	if sa, _, _ := unstructured.NestedString(rerun.Object, "spec", "taskRunTemplate", "serviceAccountName"); sa != "builder" {
		t.Error("taskRunTemplate not copied")
	}
	if _, has, _ := unstructured.NestedMap(rerun.Object, "spec", "pipelineSpec"); has {
		t.Error("pipelineSpec copied although the original had none")
	}
	if l := rerun.GetLabels(); l["team"] != "a" || l["tekton.dev/pipeline"] != "" || l[v1alpha1.LabelPlugin] != "tekton" {
		t.Errorf("labels = %v (tool-set tekton.dev/ labels must not be copied)", l)
	}
	// An inline pipelineSpec is copied when the original had one.
	if code, _ := call("dev-1", "rerun", ActionRequest{Namespace: "ci", Name: "inline-1", UID: "u3"}); code != 200 {
		t.Fatalf("inline rerun: %d", code)
	}

	// Cancel: only while running.
	if code, body := call("dev-1", "cancel", ActionRequest{Namespace: "ci", Name: "build-1", UID: "u1"}); code != 409 || !strings.Contains(body["error"].(string), "Succeeded is True") {
		t.Errorf("cancel finished run: %d %v", code, body)
	}
	if code, body := call("dev-1", "cancel", ActionRequest{Namespace: "ci", Name: "build-2", UID: "u2"}); code != 200 {
		t.Fatalf("cancel: %d %v", code, body)
	}
	got, _ := dyn.Resource(prGVR).Namespace("ci").Get(ctx, "build-2", metav1.GetOptions{})
	if s, _, _ := unstructured.NestedString(got.Object, "spec", "status"); s != "Cancelled" {
		t.Errorf("spec.status = %q", s)
	}

	// Refusals.
	for _, c := range []struct {
		cluster, action string
		req             ActionRequest
		code            int
	}{
		{"dev-1", "rerun", ActionRequest{Namespace: "ci", Name: "build-1", UID: "stale"}, 409},
		{"dev-1", "delete", ActionRequest{Namespace: "ci", Name: "build-1", UID: "u1"}, 404},
		{"dev-2", "rerun", ActionRequest{Namespace: "ci", Name: "build-1", UID: "u1"}, 403},
		{"dev-1", "rerun", ActionRequest{Namespace: "ci", Name: "Bad Name", UID: "u1"}, 400},
	} {
		if code, body := call(c.cluster, c.action, c.req); code != c.code {
			t.Errorf("%s %s %+v: %d %v, want %d", c.cluster, c.action, c.req, code, body, c.code)
		}
	}

	actions := f.actions(t)
	want := "tekton.rerun=failure tekton.rerun=denied tekton.rerun=failure tekton.cancel=success tekton.cancel=failure tekton.rerun=success tekton.rerun=success"
	if strings.Join(actions, " ") != want {
		t.Errorf("audit = %v", actions)
	}
}
