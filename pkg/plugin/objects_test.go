package plugin

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	dynfake "k8s.io/client-go/dynamic/fake"
	"k8s.io/client-go/kubernetes"
	k8sfake "k8s.io/client-go/kubernetes/fake"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	k8stesting "k8s.io/client-go/testing"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
)

type fakeObjectClusters struct {
	dyn dynamic.Interface
	cs  kubernetes.Interface
}

func (f fakeObjectClusters) Dynamic(string) (dynamic.Interface, error)   { return f.dyn, nil }
func (f fakeObjectClusters) Client(string) (kubernetes.Interface, error) { return f.cs, nil }

var (
	taskGVR     = schema.GroupVersionResource{Group: "tekton.dev", Version: "v1", Resource: "tasks"}
	pipelineGVR = schema.GroupVersionResource{Group: "tekton.dev", Version: "v1", Resource: "pipelines"}
	trGVR       = schema.GroupVersionResource{Group: "tekton.dev", Version: "v1", Resource: "taskruns"}
)

type objectFixture struct {
	apiFixture
	dyn *dynfake.FakeDynamicClient
	cs  *k8sfake.Clientset
}

func unstr(t *testing.T, y string) *unstructured.Unstructured {
	t.Helper()
	return &unstructured.Unstructured{Object: obj(t, y)}
}

// newObjectAPI: Tekton installed and Ready on dev-1, a Ready Project "team"
// there (its pipeline ServiceAccount Capybara's), a Pipeline "build" using
// Task "say", and a node that has busybox:1.36.
func newObjectAPI(t *testing.T) *objectFixture {
	t.Helper()
	_, spec, err := LoadDir("../../plugins/tekton", "builtin")
	if err != nil {
		t.Fatal(err)
	}
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "tekton"}, Spec: *spec, Status: v1alpha1.PluginStatus{Available: true}}
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "tekton.dev-1"},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: "tekton", Cluster: "dev-1", Mode: v1alpha1.ModeInstall, Enabled: true, Version: spec.Version},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady}}
	pr := &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: "team"},
		Spec: v1alpha1.ProjectSpec{Cluster: "dev-1", Namespace: "team", Owner: "devs", Size: "S"}, Status: v1alpha1.ProjectStatus{Phase: v1alpha1.PhaseReady}}
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	mgmt := fake.NewClientBuilder().WithScheme(scheme).WithObjects(p, in, pr).WithStatusSubresource(&v1alpha1.Project{}).Build()

	dyn := dynfake.NewSimpleDynamicClientWithCustomListKinds(runtime.NewScheme(), map[schema.GroupVersionResource]string{
		taskGVR: "TaskList", pipelineGVR: "PipelineList", prGVR: "PipelineRunList", trGVR: "TaskRunList"},
		unstr(t, `{apiVersion: tekton.dev/v1, kind: Task, metadata: {name: say, namespace: team, uid: t1}, spec: {steps: [{name: s, image: "busybox:1.36", script: "true"}]}}`),
		unstr(t, `{apiVersion: tekton.dev/v1, kind: Pipeline, metadata: {name: build, namespace: team, uid: p1}, spec: {params: [{name: app}], tasks: [{name: a, taskRef: {name: say}}]}}`))
	// The fake ignores dry runs and generateName: behave like the API server.
	n := 0
	dyn.PrependReactor("create", "*", func(action k8stesting.Action) (bool, runtime.Object, error) {
		ca := action.(k8stesting.CreateActionImpl)
		o := ca.GetObject().(*unstructured.Unstructured)
		if len(ca.CreateOptions.DryRun) > 0 {
			return true, o, nil
		}
		if o.GetName() == "" {
			n++
			o.SetName(fmt.Sprintf("%s%05d", o.GetGenerateName(), n))
		}
		if o.GetUID() == "" {
			o.SetUID(types.UID("uid-" + o.GetName()))
		}
		return false, nil, nil
	})
	dyn.PrependReactor("update", "*", func(action k8stesting.Action) (bool, runtime.Object, error) {
		ua := action.(k8stesting.UpdateActionImpl)
		if len(ua.UpdateOptions.DryRun) > 0 {
			return true, ua.GetObject(), nil
		}
		return false, nil, nil
	})

	cs := k8sfake.NewClientset(
		&corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: "pipeline", Namespace: "team", Labels: map[string]string{LabelProjectAccess: "true"}}},
		&corev1.ResourceQuota{ObjectMeta: metav1.ObjectMeta{Name: "capybara-project-quota", Namespace: "team"}, Status: corev1.ResourceQuotaStatus{
			Hard: corev1.ResourceList{"requests.storage": resource.MustParse("10Gi"), "persistentvolumeclaims": resource.MustParse("2")},
			Used: corev1.ResourceList{"requests.storage": resource.MustParse("8Gi"), "persistentvolumeclaims": resource.MustParse("1")}}},
		&corev1.Node{ObjectMeta: metav1.ObjectMeta{Name: "node-0"}, Status: corev1.NodeStatus{Images: []corev1.ContainerImage{
			{Names: []string{"docker.io/library/busybox:1.36"}}}}},
	)

	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, _ := audit.NewFileStore(path)
	auditor := audit.NewAuditor(store, quiet)
	objects := &ObjectAPI{Mgmt: mgmt, Clusters: fakeObjectClusters{dyn: dyn, cs: cs}, Auditor: auditor, Logger: quiet}
	actions := &ActionAPI{Mgmt: mgmt, Clusters: fakeDyn{dyn}, Auditor: auditor, Logger: quiet, Objects: objects}
	mux := http.NewServeMux()
	objects.Register(mux)
	actions.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(srv.Close)
	return &objectFixture{apiFixture: apiFixture{srv: srv, c: mgmt, auditPath: path, store: store}, dyn: dyn, cs: cs}
}

func yamlObj(t *testing.T, y string) map[string]any { return obj(t, y) }

func problemPaths(body map[string]any) string {
	ps, _ := body["problems"].([]any)
	var out []string
	for _, p := range ps {
		m, _ := p.(map[string]any)
		out = append(out, fmt.Sprintf("%v", m["path"]))
	}
	return strings.Join(out, ",")
}

const objBase = "/api/clusters/dev-1/plugin-objects/tekton/"

func TestObjectsCreateEditDeleteInAProject(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()

	// Validate: defaults and warnings, nothing written.
	code, body := f.do(t, http.MethodPost, objBase+"tasks/team/_validate", ObjectRequest{Object: yamlObj(t, `
metadata: {name: hello}
spec: {steps: [{name: s, image: "alpine:3.20", script: "echo hi"}]}`)})
	if code != 200 || problemPaths(body) != "" || !strings.Contains(fmt.Sprint(body["warnings"]), "alpine:3.20 is not on any node of dev-1") {
		t.Fatalf("validate: %d %v", code, body)
	}
	if _, err := f.dyn.Resource(taskGVR).Namespace("team").Get(ctx, "hello", metav1.GetOptions{}); err == nil {
		t.Fatal("validate wrote the object")
	}

	// Create.
	code, body = f.do(t, http.MethodPost, objBase+"tasks/team", ObjectRequest{Object: yamlObj(t, `
metadata: {name: hello}
spec: {steps: [{name: s, image: "busybox:1.36", script: "echo hi"}]}`)})
	if code != 200 {
		t.Fatalf("create: %d %v", code, body)
	}
	got, err := f.dyn.Resource(taskGVR).Namespace("team").Get(ctx, "hello", metav1.GetOptions{})
	if err != nil {
		t.Fatal(err)
	}

	// Validating an edit needs no uid (nothing is written).
	if code, body := f.do(t, http.MethodPost, objBase+"tasks/team/_validate", ObjectRequest{Name: "hello", Object: yamlObj(t, `
metadata: {name: hello}
spec: {steps: [{name: s, image: "busybox:1.36", securityContext: {privileged: true}}]}`)}); code != 200 || problemPaths(body) != "spec.steps[0].securityContext.privileged" {
		t.Errorf("validate an edit: %d %v", code, body)
	}

	// Update: stale uid refused; the right one accepted; a privileged step refused.
	edit := yamlObj(t, `
metadata: {name: hello}
spec: {steps: [{name: s, image: "busybox:1.36", script: "echo hello"}]}`)
	if code, _ := f.do(t, http.MethodPut, objBase+"tasks/team/hello", ObjectRequest{Object: edit, UID: "stale"}); code != http.StatusConflict {
		t.Errorf("stale update: %d", code)
	}
	if code, body := f.do(t, http.MethodPut, objBase+"tasks/team/hello", ObjectRequest{Object: edit, UID: string(got.GetUID())}); code != 200 {
		t.Errorf("update: %d %v", code, body)
	}
	code, body = f.do(t, http.MethodPut, objBase+"tasks/team/hello", ObjectRequest{Object: yamlObj(t, `
metadata: {name: hello}
spec: {steps: [{name: s, image: "busybox:1.36", securityContext: {privileged: true}}]}`), UID: string(got.GetUID())})
	if code != http.StatusUnprocessableEntity || problemPaths(body) != "spec.steps[0].securityContext.privileged" {
		t.Errorf("privileged step: %d %v", code, body)
	}
	// The kind cannot be swapped.
	if code, _ := f.do(t, http.MethodPost, objBase+"tasks/team", ObjectRequest{Object: yamlObj(t, `{kind: Pipeline, metadata: {name: x}}`)}); code != http.StatusBadRequest {
		t.Errorf("kind swap: %d", code)
	}

	// Delete needs the uid.
	if code, _ := f.do(t, http.MethodDelete, objBase+"tasks/team/hello?uid=wrong", nil); code != http.StatusConflict {
		t.Errorf("delete with a wrong uid: %d", code)
	}
	if code, body := f.do(t, http.MethodDelete, objBase+"tasks/team/hello?uid="+string(got.GetUID()), nil); code != 200 {
		t.Errorf("delete: %d %v", code, body)
	}

	// Newest first.
	want := "tekton.delete=success tekton.delete=failure tekton.create=failure tekton.update=denied tekton.update=success tekton.update=failure tekton.create=success"
	if got := strings.Join(f.actions(t), " "); got != want {
		t.Errorf("audit = %s\nwant    %s", got, want)
	}
}

func TestObjectsOnlyInProjectNamespaces(t *testing.T) {
	f := newObjectAPI(t)
	for _, ns := range []string{"default", "kube-system", "capybara-demo"} {
		code, body := f.do(t, http.MethodPost, objBase+"tasks/"+ns, ObjectRequest{Object: yamlObj(t, `{metadata: {name: hello}, spec: {steps: [{name: s, image: x}]}}`)})
		if code != http.StatusForbidden || !strings.Contains(fmt.Sprint(body["error"]), "not a Project namespace") {
			t.Errorf("%s: %d %v", ns, code, body)
		}
	}
	// Not declared: CustomRuns.
	if code, _ := f.do(t, http.MethodPost, objBase+"customruns/team", ObjectRequest{Object: yamlObj(t, `{metadata: {name: x}}`)}); code != http.StatusNotFound {
		t.Errorf("undeclared object: %d", code)
	}
}

func TestStartRun(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()
	start := func(y string) (int, map[string]any) {
		return f.do(t, http.MethodPost, objBase+"pipelineruns/team", ObjectRequest{Object: yamlObj(t, y)})
	}

	// A run with params and an emptyDir: started as the pipeline account.
	code, body := start(`
metadata: {generateName: build-}
spec: {pipelineRef: {name: build}, params: [{name: app, value: shop}], workspaces: [{name: tmp, emptyDir: {}}]}`)
	if code != 200 {
		t.Fatalf("start: %d %v", code, body)
	}
	name := body["object"].(map[string]any)["metadata"].(map[string]any)["name"].(string)
	run, _ := f.dyn.Resource(prGVR).Namespace("team").Get(ctx, name, metav1.GetOptions{})
	if sa, _, _ := unstructured.NestedString(run.Object, "spec", "taskRunTemplate", "serviceAccountName"); sa != "pipeline" {
		t.Errorf("service account = %q", sa)
	}

	// Refusals: another ServiceAccount, a Secret workspace, a claim beyond the quota.
	for _, c := range []struct{ name, y, paths string }{
		{"another service account", `{metadata: {generateName: b-}, spec: {pipelineRef: {name: build}, taskRunTemplate: {serviceAccountName: builder}}}`,
			"spec.taskRunTemplate.serviceAccountName"},
		{"secret workspace", `{metadata: {generateName: b-}, spec: {pipelineRef: {name: build}, workspaces: [{name: w, secret: {secretName: db}}]}}`,
			"spec.workspaces[0],spec.workspaces[0].secret"},
		{"quota", `{metadata: {generateName: b-}, spec: {pipelineRef: {name: build}, workspaces: [{name: w, volumeClaimTemplate: {spec: {resources: {requests: {storage: 5Gi}}}}}]}}`,
			"spec.workspaces[0].volumeClaimTemplate.spec.resources.requests.storage"},
	} {
		code, body := start(c.y)
		if code != http.StatusUnprocessableEntity || problemPaths(body) != c.paths {
			t.Errorf("%s: %d %v", c.name, code, body)
		}
	}

	// The Pipeline's Task changed outside Capybara: starting it is refused.
	say, _ := f.dyn.Resource(taskGVR).Namespace("team").Get(ctx, "say", metav1.GetOptions{})
	_ = unstructured.SetNestedSlice(say.Object, []any{map[string]any{"name": "s", "image": "busybox:1.36",
		"env": []any{map[string]any{"name": "P", "valueFrom": map[string]any{"secretKeyRef": map[string]any{"name": "db", "key": "p"}}}}}}, "spec", "steps")
	if _, err := f.dyn.Resource(taskGVR).Namespace("team").Update(ctx, say, metav1.UpdateOptions{}); err != nil {
		t.Fatal(err)
	}
	code, body = start(`{metadata: {generateName: b-}, spec: {pipelineRef: {name: build}}}`)
	if code != http.StatusUnprocessableEntity || !strings.Contains(fmt.Sprint(body["problems"]), "Task say: steps may not read Secrets") {
		t.Errorf("referenced task: %d %v", code, body)
	}
}

func TestPipelineServiceAccountMustBeCapybarasAndUnbound(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()
	run := `{metadata: {generateName: b-}, spec: {pipelineRef: {name: build}}}`
	start := func() (int, map[string]any) {
		return f.do(t, http.MethodPost, objBase+"pipelineruns/team", ObjectRequest{Object: yamlObj(t, run)})
	}
	if _, err := f.cs.RbacV1().RoleBindings("team").Create(ctx, &rbacv1.RoleBinding{ObjectMeta: metav1.ObjectMeta{Name: "too-much", Namespace: "team"},
		RoleRef:  rbacv1.RoleRef{Kind: "ClusterRole", Name: "edit"},
		Subjects: []rbacv1.Subject{{Kind: "ServiceAccount", Name: "pipeline"}}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	if code, body := start(); code != http.StatusUnprocessableEntity || !strings.Contains(fmt.Sprint(body["problems"]), "RoleBinding too-much") {
		t.Errorf("bound account: %d %v", code, body)
	}
	_ = f.cs.RbacV1().RoleBindings("team").Delete(ctx, "too-much", metav1.DeleteOptions{})
	sa, _ := f.cs.CoreV1().ServiceAccounts("team").Get(ctx, "pipeline", metav1.GetOptions{})
	sa.Labels = nil
	_, _ = f.cs.CoreV1().ServiceAccounts("team").Update(ctx, sa, metav1.UpdateOptions{})
	if code, body := start(); code != http.StatusUnprocessableEntity || !strings.Contains(fmt.Sprint(body["problems"]), "not created by Capybara") {
		t.Errorf("foreign account: %d %v", code, body)
	}
}

func TestRerunAndCancelOnlyInProjects(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()
	mk := func(ns, name, uid, sa, succeeded string) {
		u := unstr(t, fmt.Sprintf(`{apiVersion: tekton.dev/v1, kind: PipelineRun, metadata: {name: %s, namespace: %s, uid: %s},
spec: {pipelineRef: {name: build}, taskRunTemplate: {serviceAccountName: %s}},
status: {conditions: [{type: Succeeded, status: "%s"}]}}`, name, ns, uid, sa, succeeded))
		if _, err := f.dyn.Resource(prGVR).Namespace(ns).Create(ctx, u, metav1.CreateOptions{}); err != nil {
			t.Fatal(err)
		}
	}
	mk("team", "ok-1", "u1", "pipeline", "True")
	mk("team", "builder-1", "u2", "builder", "True")
	mk("demo", "demo-1", "u3", "default", "Unknown")
	act := func(ns, name, uid, action string) (int, map[string]any) {
		return f.do(t, http.MethodPost, "/api/clusters/dev-1/plugin-actions/tekton/"+action, ActionRequest{Namespace: ns, Name: name, UID: uid})
	}
	if code, body := act("team", "ok-1", "u1", "rerun"); code != 200 {
		t.Errorf("rerun: %d %v", code, body)
	}
	if code, body := act("team", "builder-1", "u2", "rerun"); code != http.StatusUnprocessableEntity || problemPaths(body) != "spec.taskRunTemplate.serviceAccountName" {
		t.Errorf("rerun as another account: %d %v", code, body)
	}
	if code, _ := act("demo", "demo-1", "u3", "rerun"); code != http.StatusForbidden {
		t.Errorf("rerun outside a Project: %d", code)
	}
	if code, _ := act("demo", "demo-1", "u3", "cancel"); code != http.StatusForbidden {
		t.Errorf("cancel outside a Project: %d", code)
	}
}

func TestCleanupKeepsTheNewestFinishedRuns(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()
	for i, st := range []string{"True", "False", "True", "Unknown"} {
		u := unstr(t, fmt.Sprintf(`{apiVersion: tekton.dev/v1, kind: PipelineRun, metadata: {name: run-%d, namespace: team, uid: r%d,
labels: {tekton.dev/pipeline: build}, creationTimestamp: "2026-10-0%dT00:00:00Z"}, status: {conditions: [{type: Succeeded, status: "%s"}]}}`, i, i, i+1, st))
		if _, err := f.dyn.Resource(prGVR).Namespace("team").Create(ctx, u, metav1.CreateOptions{}); err != nil {
			t.Fatal(err)
		}
	}
	code, body := f.do(t, http.MethodPost, objBase+"pipelineruns/team/_cleanup", CleanupRequest{Keep: 1, DryRun: true})
	if code != 200 || fmt.Sprint(body["deleted"]) != "[run-0 run-1]" {
		t.Fatalf("dry run: %d %v", code, body)
	}
	if code, body := f.do(t, http.MethodPost, objBase+"pipelineruns/team/_cleanup", CleanupRequest{Keep: 1}); code != 200 || fmt.Sprint(body["deleted"]) != "[run-0 run-1]" {
		t.Fatalf("cleanup: %d %v", code, body)
	}
	list, _ := f.dyn.Resource(prGVR).Namespace("team").List(ctx, metav1.ListOptions{})
	var left []string
	for _, i := range list.Items {
		left = append(left, i.GetName())
	}
	if strings.Join(left, ",") != "run-2,run-3" {
		t.Errorf("left = %v (the newest finished and the running one stay)", left)
	}
}

func TestGovernsAndImageNames(t *testing.T) {
	f := newObjectAPI(t)
	a := &ObjectAPI{Mgmt: f.c}
	if got := a.Governs(context.Background(), "tekton.dev", "tasks"); got != "Pipelines" {
		t.Errorf("tasks governed by %q", got)
	}
	if got := a.Governs(context.Background(), "tekton.dev", "customruns"); got != "" {
		t.Errorf("customruns governed by %q", got)
	}
	for in, want := range map[string]string{
		"busybox":                    "docker.io/library/busybox:latest",
		"busybox:1.36":               "docker.io/library/busybox:1.36",
		"grafana/grafana:13":         "docker.io/grafana/grafana:13",
		"ghcr.io/x/y:1@sha256:abc":   "ghcr.io/x/y:1@sha256:abc",
		"localhost:5000/app:dev":     "localhost:5000/app:dev",
		"cgr.dev/chainguard/busybox": "cgr.dev/chainguard/busybox:latest",
	} {
		if got := normalizeImage(in); got != want {
			t.Errorf("normalizeImage(%q) = %q, want %q", in, got, want)
		}
	}
}

var _ = yaml.Marshal
var _ client.Object = (*v1alpha1.Project)(nil)

func TestCreateTaskRun(t *testing.T) {
	f := newObjectAPI(t)
	code, body := f.do(t, http.MethodPost, objBase+"taskruns/team", ObjectRequest{Object: yamlObj(t, `
metadata: {generateName: say-}
spec: {taskRef: {name: say}, timeout: 10m}`)})
	if code != 200 {
		t.Fatalf("create task run: %d %v", code, body)
	}
	if sa, _, _ := unstructured.NestedString(body["object"].(map[string]any), "spec", "serviceAccountName"); sa != "pipeline" {
		t.Errorf("service account = %q", sa)
	}
	code, body = f.do(t, http.MethodPost, objBase+"taskruns/team", ObjectRequest{Object: yamlObj(t, `
metadata: {generateName: say-}
spec: {taskRef: {name: say}, serviceAccountName: builder, status: TaskRunCancelled}`)})
	if code != http.StatusUnprocessableEntity || problemPaths(body) != "spec.serviceAccountName,spec.status" {
		t.Errorf("refused task run: %d %v", code, body)
	}
	if got := strings.Join(f.actions(t), " "); got != "tekton.start=denied tekton.start=success" {
		t.Errorf("audit = %s", got)
	}
}

func TestStopOnlyWhileRunningInAProject(t *testing.T) {
	f := newObjectAPI(t)
	ctx := context.Background()
	for _, r := range []struct{ ns, name, uid, status string }{{"team", "busy", "b1", "Unknown"}, {"team", "done", "d1", "True"}, {"demo", "elsewhere", "e1", "Unknown"}} {
		u := unstr(t, fmt.Sprintf(`{apiVersion: tekton.dev/v1, kind: PipelineRun, metadata: {name: %s, namespace: %s, uid: %s}, spec: {pipelineRef: {name: build}}, status: {conditions: [{type: Succeeded, status: "%s"}]}}`, r.name, r.ns, r.uid, r.status))
		if _, err := f.dyn.Resource(prGVR).Namespace(r.ns).Create(ctx, u, metav1.CreateOptions{}); err != nil {
			t.Fatal(err)
		}
	}
	stop := func(ns, name, uid string) int {
		code, _ := f.do(t, http.MethodPost, "/api/clusters/dev-1/plugin-actions/tekton/stop", ActionRequest{Namespace: ns, Name: name, UID: uid})
		return code
	}
	if code := stop("team", "busy", "b1"); code != 200 {
		t.Errorf("stop a running run: %d", code)
	}
	got, _ := f.dyn.Resource(prGVR).Namespace("team").Get(ctx, "busy", metav1.GetOptions{})
	if st, _, _ := unstructured.NestedString(got.Object, "spec", "status"); st != "StoppedRunFinally" {
		t.Errorf("spec.status = %q", st)
	}
	if code := stop("team", "done", "d1"); code != http.StatusConflict {
		t.Errorf("stop a finished run: %d", code)
	}
	if code := stop("demo", "elsewhere", "e1"); code != http.StatusForbidden {
		t.Errorf("stop outside a Project: %d", code)
	}
}
