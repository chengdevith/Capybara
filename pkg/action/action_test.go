package action

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	dynamicfake "k8s.io/client-go/dynamic/fake"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
	k8stesting "k8s.io/client-go/testing"

	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

const secretValue = "hunter2-super-secret"

type fixture struct {
	srv       *httptest.Server
	dyn       *dynamicfake.FakeDynamicClient
	auditPath string
	store     *audit.FileStore

	mu      sync.Mutex
	actions []k8stesting.Action
	// reply lets a test choose what the fake cluster answers to a patch.
	reply func(k8stesting.PatchActionImpl) (runtime.Object, error)
}

func newFixture(t *testing.T) *fixture {
	t.Helper()
	f := &fixture{}
	f.dyn = dynamicfake.NewSimpleDynamicClient(runtime.NewScheme())
	f.dyn.PrependReactor("*", "*", func(a k8stesting.Action) (bool, runtime.Object, error) {
		f.mu.Lock()
		f.actions = append(f.actions, a)
		f.mu.Unlock()
		switch act := a.(type) {
		case k8stesting.PatchActionImpl:
			if f.reply != nil {
				obj, err := f.reply(act)
				return true, obj, err
			}
			return true, &unstructured.Unstructured{Object: map[string]any{"kind": "Deployment", "metadata": map[string]any{"name": act.Name}}}, nil
		case k8stesting.GetActionImpl:
			if act.GetSubresource() == "scale" {
				return true, &unstructured.Unstructured{Object: map[string]any{"kind": "Scale", "spec": map[string]any{"replicas": int64(2)}}}, nil
			}
		case k8stesting.DeleteActionImpl:
			return true, nil, nil
		}
		return false, nil, nil
	})
	typed := fake.NewClientset(&corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{Namespace: "demo", Name: "db"},
		Data:       map[string][]byte{"password": []byte(secretValue)},
	})

	f.auditPath = filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewFileStore(f.auditPath)
	if err != nil {
		t.Fatal(err)
	}
	f.store = store
	h := &Handlers{
		Clusters: &clustertest.Provider{
			Infos:    []cluster.Info{{ID: "dev-1"}},
			Dynamics: map[string]dynamic.Interface{"dev-1": f.dyn},
			Clients:  map[string]kubernetes.Interface{"dev-1": typed},
		},
		Auditor:   audit.NewAuditor(store, slog.New(slog.DiscardHandler)),
		Protected: []string{"kube-system", "default", "openshift-*", "capybara-system"},
		Logger:    slog.New(slog.DiscardHandler),
	}
	mux := http.NewServeMux()
	h.Register(mux)
	f.srv = httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(f.srv.Close)
	return f
}

func (f *fixture) post(t *testing.T, path string, body any) (int, map[string]any) {
	t.Helper()
	raw, _ := json.Marshal(body)
	resp, err := http.Post(f.srv.URL+path, "application/json", bytes.NewReader(raw)) //nolint:noctx // test
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close() //nolint:errcheck
	var out map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}

func (f *fixture) records(t *testing.T) []audit.Record {
	t.Helper()
	recs, err := f.store.List(context.Background(), audit.Filter{})
	if err != nil {
		t.Fatal(err)
	}
	return recs
}

func (f *fixture) patches() []k8stesting.PatchActionImpl {
	f.mu.Lock()
	defer f.mu.Unlock()
	var out []k8stesting.PatchActionImpl
	for _, a := range f.actions {
		if p, ok := a.(k8stesting.PatchActionImpl); ok {
			out = append(out, p)
		}
	}
	return out
}

var deployment = Target{Group: "apps", Version: "v1", Resource: "deployments", Kind: "Deployment", Namespace: "demo", Name: "web"}

func deploymentObject() map[string]any {
	return map[string]any{
		"apiVersion": "apps/v1", "kind": "Deployment",
		"metadata": map[string]any{
			"name": "web", "resourceVersion": "42", "uid": "u1",
			"managedFields": []any{map[string]any{"manager": "kubectl"}}, "creationTimestamp": "2026-01-01T00:00:00Z",
		},
		"spec":   map[string]any{"replicas": 3},
		"status": map[string]any{"readyReplicas": 2},
	}
}

func TestApplyUsesServerSideApplyAndIsAudited(t *testing.T) {
	f := newFixture(t)
	code, body := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": deployment, "object": deploymentObject()})
	if code != http.StatusOK {
		t.Fatalf("status %d: %v", code, body)
	}

	p := f.patches()
	if len(p) != 1 || p[0].PatchType != types.ApplyPatchType || p[0].PatchOptions.FieldManager != "capybara" || p[0].PatchOptions.Force != nil && *p[0].PatchOptions.Force {
		t.Fatalf("patch = %+v", p)
	}
	var sent map[string]any
	_ = json.Unmarshal(p[0].Patch, &sent)
	meta := sent["metadata"].(map[string]any)
	if _, ok := sent["status"]; ok {
		t.Error("status must not be applied")
	}
	for _, field := range []string{"managedFields", "creationTimestamp"} {
		if _, ok := meta[field]; ok {
			t.Errorf("metadata.%s must not be applied", field)
		}
	}
	if meta["namespace"] != "demo" || meta["resourceVersion"] != "42" {
		t.Errorf("metadata = %v (namespace filled in, resourceVersion kept for optimistic locking)", meta)
	}

	recs := f.records(t)
	if len(recs) != 1 || recs[0].Action != "apply" || recs[0].Result != audit.ResultSuccess || recs[0].User != "dev" {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestDryRunIsNotAudited(t *testing.T) {
	f := newFixture(t)
	code, body := f.post(t, "/api/clusters/dev-1/apply?dryRun=true", map[string]any{"target": deployment, "object": deploymentObject()})
	if code != http.StatusOK || body["dryRun"] != true {
		t.Fatalf("status %d: %v", code, body)
	}
	if dr := f.patches()[0].PatchOptions.DryRun; len(dr) != 1 || dr[0] != metav1.DryRunAll {
		t.Fatalf("dryRun option = %v", dr)
	}
	if recs := f.records(t); len(recs) != 0 {
		t.Fatalf("dry run was audited: %+v", recs)
	}
}

func TestApplyRefusesToCreateRenameOrMove(t *testing.T) {
	cases := map[string]func(o map[string]any){
		"rename":     func(o map[string]any) { o["metadata"].(map[string]any)["name"] = "web-2" },
		"move":       func(o map[string]any) { o["metadata"].(map[string]any)["namespace"] = "other" },
		"kind":       func(o map[string]any) { o["kind"] = "StatefulSet" },
		"apiVersion": func(o map[string]any) { o["apiVersion"] = "apps/v1beta1" },
	}
	for name, mutate := range cases {
		f := newFixture(t)
		obj := deploymentObject()
		mutate(obj)
		code, _ := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": deployment, "object": obj})
		if code != http.StatusBadRequest {
			t.Errorf("%s: status %d, want 400", name, code)
		}
		if len(f.patches()) != 0 {
			t.Errorf("%s: reached the cluster", name)
		}
		if recs := f.records(t); len(recs) != 1 || recs[0].Result != audit.ResultFailure {
			t.Errorf("%s: refused edit not audited as a failure: %+v", name, recs)
		}
	}
}

func TestApplyConflictsAndForce(t *testing.T) {
	f := newFixture(t)
	f.reply = func(p k8stesting.PatchActionImpl) (runtime.Object, error) {
		if p.PatchOptions.Force != nil && *p.PatchOptions.Force {
			return &unstructured.Unstructured{Object: map[string]any{"kind": "Deployment"}}, nil
		}
		return nil, apierrors.NewApplyConflict([]metav1.StatusCause{{
			Type:    metav1.CauseTypeFieldManagerConflict,
			Message: `conflict with "kubectl-client-side-apply" with subresource "scale" using apps/v1`,
			Field:   ".spec.replicas",
		}}, `Apply failed with 1 conflict: conflict with "kubectl-client-side-apply" using apps/v1: .spec.replicas`)
	}

	code, body := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": deployment, "object": deploymentObject()})
	if code != http.StatusConflict {
		t.Fatalf("status %d: %v", code, body)
	}
	conflicts := body["conflicts"].([]any)
	c := conflicts[0].(map[string]any)
	if c["field"] != ".spec.replicas" || c["manager"] != "kubectl-client-side-apply" || c["subresource"] != "scale" || body["stale"] == true {
		t.Fatalf("conflicts = %v", body)
	}

	code, _ = f.post(t, "/api/clusters/dev-1/apply?force=true", map[string]any{"target": deployment, "object": deploymentObject()})
	if code != http.StatusOK {
		t.Fatalf("force apply status %d", code)
	}
	recs := f.records(t) // newest first
	if recs[0].Action != "apply-force" || recs[0].Result != audit.ResultSuccess || recs[1].Result != audit.ResultConflict {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestApplyStaleObject(t *testing.T) {
	f := newFixture(t)
	f.reply = func(k8stesting.PatchActionImpl) (runtime.Object, error) {
		return nil, apierrors.NewConflict(schema.GroupResource{Group: "apps", Resource: "deployments"}, "web", errors.New("the object has been modified"))
	}
	code, body := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": deployment, "object": deploymentObject()})
	if code != http.StatusConflict || body["stale"] != true {
		t.Fatalf("status %d: %v", code, body)
	}
}

func TestScaleUsesScaleSubresource(t *testing.T) {
	f := newFixture(t)
	code, body := f.post(t, "/api/clusters/dev-1/actions/scale", map[string]any{"target": deployment, "replicas": 3})
	if code != http.StatusOK {
		t.Fatalf("status %d: %v", code, body)
	}
	p := f.patches()
	if len(p) != 1 || p[0].GetSubresource() != "scale" || p[0].PatchType != types.MergePatchType || string(p[0].Patch) != `{"spec":{"replicas":3}}` {
		t.Fatalf("patch = %+v (%s)", p, p[0].Patch)
	}
	if recs := f.records(t); recs[0].Detail != "replicas 2 → 3" {
		t.Fatalf("detail = %q", recs[0].Detail)
	}

	code, _ = f.post(t, "/api/clusters/dev-1/actions/scale", map[string]any{"target": deployment, "replicas": -1})
	if code != http.StatusBadRequest || f.records(t)[0].Result != audit.ResultFailure {
		t.Fatalf("negative replicas: status %d, audit %+v", code, f.records(t)[0])
	}
}

func TestRestartSetsRestartedAtLikeKubectl(t *testing.T) {
	f := newFixture(t)
	code, body := f.post(t, "/api/clusters/dev-1/actions/restart", map[string]any{"target": deployment})
	if code != http.StatusOK {
		t.Fatalf("status %d: %v", code, body)
	}
	p := f.patches()[0]
	if p.PatchType != types.StrategicMergePatchType || !strings.Contains(string(p.Patch), `"kubectl.kubernetes.io/restartedAt":"`+body["restartedAt"].(string)+`"`) {
		t.Fatalf("patch = %s", p.Patch)
	}

	svc := Target{Version: "v1", Resource: "services", Kind: "Service", Namespace: "demo", Name: "web"}
	if code, _ := f.post(t, "/api/clusters/dev-1/actions/restart", map[string]any{"target": svc}); code != http.StatusBadRequest {
		t.Fatalf("restart of a Service: status %d", code)
	}
}

func TestDeleteUsesUIDPrecondition(t *testing.T) {
	f := newFixture(t)
	pod := Target{Version: "v1", Resource: "pods", Kind: "Pod", Namespace: "demo", Name: "web-0"}
	code, _ := f.post(t, "/api/clusters/dev-1/actions/delete", map[string]any{"target": pod, "uid": "abc"})
	if code != http.StatusOK {
		t.Fatalf("status %d", code)
	}
	var del *k8stesting.DeleteActionImpl
	for _, a := range f.actions {
		if d, ok := a.(k8stesting.DeleteActionImpl); ok {
			del = &d
		}
	}
	if del == nil || del.DeleteOptions.Preconditions == nil || *del.DeleteOptions.Preconditions.UID != "abc" ||
		*del.DeleteOptions.PropagationPolicy != metav1.DeletePropagationBackground {
		t.Fatalf("delete = %+v", del)
	}
	if code, _ := f.post(t, "/api/clusters/dev-1/actions/delete", map[string]any{"target": pod}); code != http.StatusBadRequest {
		t.Fatalf("missing uid: status %d", code)
	}
}

func TestProtectedNamespacesCannotBeDeleted(t *testing.T) {
	for _, ns := range []string{"kube-system", "default", "openshift-monitoring", "capybara-system"} {
		f := newFixture(t)
		target := Target{Version: "v1", Resource: "namespaces", Kind: "Namespace", Name: ns}
		code, body := f.post(t, "/api/clusters/dev-1/actions/delete", map[string]any{"target": target, "uid": "u"})
		if code != http.StatusForbidden {
			t.Errorf("%s: status %d (%v), want 403", ns, code, body)
		}
		for _, a := range f.actions {
			if a.GetVerb() == "delete" {
				t.Errorf("%s: delete reached the cluster", ns)
			}
		}
		if recs := f.records(t); len(recs) != 1 || recs[0].Result != audit.ResultDenied {
			t.Errorf("%s: refusal not audited as denied: %+v", ns, recs)
		}
	}

	f := newFixture(t)
	ok := Target{Version: "v1", Resource: "namespaces", Kind: "Namespace", Name: "capybara-demo"}
	if code, _ := f.post(t, "/api/clusters/dev-1/actions/delete", map[string]any{"target": ok, "uid": "u"}); code != http.StatusOK {
		t.Fatalf("ordinary namespace: status %d", code)
	}
}

func TestNothingRunsWhenAuditIsUnavailable(t *testing.T) {
	if os.Getuid() == 0 {
		t.Skip("root ignores file permissions")
	}
	f := newFixture(t)
	if err := os.Chmod(f.auditPath, 0o400); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(f.auditPath, 0o600) })

	code, body := f.post(t, "/api/clusters/dev-1/actions/scale", map[string]any{"target": deployment, "replicas": 3})
	if code != http.StatusServiceUnavailable {
		t.Fatalf("status %d: %v", code, body)
	}
	if len(f.actions) != 0 {
		t.Fatalf("the cluster was called while the audit log was unavailable: %v", f.actions)
	}
}

func TestRevealSecretIsAuditedWithoutValues(t *testing.T) {
	f := newFixture(t)
	resp, err := http.Get(f.srv.URL + "/api/clusters/dev-1/secrets/demo/db") //nolint:noctx // test
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close() //nolint:errcheck
	var s corev1.Secret
	_ = json.NewDecoder(resp.Body).Decode(&s)
	if resp.StatusCode != http.StatusOK || string(s.Data["password"]) != secretValue {
		t.Fatalf("status %d, secret %+v", resp.StatusCode, s)
	}
	if resp.Header.Get("Cache-Control") != "no-store" {
		t.Error("revealed secrets must not be cached")
	}
	recs := f.records(t)
	if len(recs) != 1 || recs[0].Action != "reveal" || recs[0].Kind != "Secret" {
		t.Fatalf("audit = %+v", recs)
	}
	raw, _ := os.ReadFile(f.auditPath)
	if strings.Contains(string(raw), secretValue) {
		t.Fatal("secret value reached the audit log")
	}
}

func TestSecretApplyRefusesMaskedValues(t *testing.T) {
	f := newFixture(t)
	secret := Target{Version: "v1", Resource: "secrets", Kind: "Secret", Namespace: "demo", Name: "db"}
	obj := map[string]any{
		"apiVersion": "v1", "kind": "Secret",
		"metadata": map[string]any{"name": "db"},
		"data":     map[string]any{"password": MaskPlaceholder},
	}
	if code, _ := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": secret, "object": obj}); code != http.StatusBadRequest {
		t.Fatalf("status %d", code)
	}
	if len(f.patches()) != 0 {
		t.Fatal("masked secret reached the cluster")
	}
}

func TestSecretErrorsAreRedactedInAudit(t *testing.T) {
	f := newFixture(t)
	// Kubernetes validation errors can echo the submitted value back.
	f.reply = func(k8stesting.PatchActionImpl) (runtime.Object, error) {
		return nil, apierrors.NewBadRequest(`Secret "db" is invalid: data[password]: Invalid value: "` + secretValue + `"`)
	}
	secret := Target{Version: "v1", Resource: "secrets", Kind: "Secret", Namespace: "demo", Name: "db"}
	obj := map[string]any{
		"apiVersion": "v1", "kind": "Secret",
		"metadata":   map[string]any{"name": "db"},
		"stringData": map[string]any{"password": secretValue},
	}
	if code, _ := f.post(t, "/api/clusters/dev-1/apply", map[string]any{"target": secret, "object": obj}); code != http.StatusBadRequest {
		t.Fatalf("status %d", code)
	}
	raw, _ := os.ReadFile(f.auditPath)
	if strings.Contains(string(raw), secretValue) {
		t.Fatalf("secret value reached the audit log: %s", raw)
	}
	if recs := f.records(t); len(recs) != 1 || recs[0].Result != audit.ResultFailure {
		t.Fatalf("audit = %+v", recs)
	}
}
