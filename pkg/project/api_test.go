package project

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	k8sfake "k8s.io/client-go/kubernetes/fake"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
)

type apiFixture struct {
	srv   *httptest.Server
	mgmt  client.WithWatch
	store *audit.FileStore
}

func newAPIFixture(t *testing.T, objs ...client.Object) *apiFixture {
	t.Helper()
	scheme := runtime.NewScheme()
	if err := v1alpha1.AddToScheme(scheme); err != nil {
		t.Fatal(err)
	}
	mgmt := fake.NewClientBuilder().WithScheme(scheme).WithObjects(objs...).WithStatusSubresource(&v1alpha1.Project{}).Build()
	store, err := audit.NewFileStore(filepath.Join(t.TempDir(), "audit.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	devCluster := k8sfake.NewClientset(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: "existing"}})
	a := &API{
		Mgmt:      mgmt,
		Clusters:  testClusters{"dev-1": devCluster},
		Config:    repoConfig(t),
		Protected: []string{"kube-system", "default", "openshift-*", "capybara-system"},
		Auditor:   audit.NewAuditor(store, slog.New(slog.DiscardHandler)),
		Logger:    slog.New(slog.DiscardHandler),
	}
	mux := http.NewServeMux()
	a.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(srv.Close)
	return &apiFixture{srv: srv, mgmt: mgmt, store: store}
}

func (f *apiFixture) do(t *testing.T, method, path string, body any) (int, map[string]any) {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req, _ := http.NewRequestWithContext(context.Background(), method, f.srv.URL+path, &buf)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close() //nolint:errcheck
	var out map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}

func (f *apiFixture) records(t *testing.T) []audit.Record {
	t.Helper()
	recs, err := f.store.List(context.Background(), audit.Filter{})
	if err != nil {
		t.Fatal(err)
	}
	return recs
}

var _ kubernetes.Interface = (*k8sfake.Clientset)(nil)

func TestAPICreate(t *testing.T) {
	f := newAPIFixture(t)
	code, body := f.do(t, http.MethodPost, "/api/projects", CreateRequest{Name: "shop", Cluster: "dev-1", Owner: "team-shop", Size: "S"})
	if code != http.StatusCreated {
		t.Fatalf("status %d: %v", code, body)
	}
	var p v1alpha1.Project
	if err := f.mgmt.Get(context.Background(), types.NamespacedName{Name: "shop"}, &p); err != nil {
		t.Fatal(err)
	}
	if p.Spec.Namespace != "shop" || p.Spec.Owner != "team-shop" {
		t.Errorf("spec = %+v (namespace should default to the name)", p.Spec)
	}
	recs := f.records(t)
	if len(recs) != 1 || recs[0].Action != "create" || recs[0].Result != audit.ResultSuccess || recs[0].User != "dev" {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestAPICreateRefusals(t *testing.T) {
	taken := &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: "first"},
		Spec: v1alpha1.ProjectSpec{Cluster: "dev-1", Namespace: "claimed", Owner: "a", Size: "S"}}
	cases := []struct {
		name   string
		req    CreateRequest
		code   int
		result audit.Result // "" = refused before auditing (unusable name)
	}{
		{"protected", CreateRequest{Name: "p1", Namespace: "kube-system", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusForbidden, audit.ResultDenied},
		{"openshift glob", CreateRequest{Name: "p2", Namespace: "openshift-monitoring", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusForbidden, audit.ResultDenied},
		{"existing namespace", CreateRequest{Name: "p3", Namespace: "existing", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusConflict, audit.ResultFailure},
		{"claimed by a Project", CreateRequest{Name: "p4", Namespace: "claimed", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusConflict, audit.ResultFailure},
		{"unknown cluster", CreateRequest{Name: "p5", Cluster: "prod", Owner: "a", Size: "S"}, http.StatusBadRequest, audit.ResultFailure},
		{"bad size", CreateRequest{Name: "p6", Cluster: "dev-1", Owner: "a", Size: "XL"}, http.StatusBadRequest, audit.ResultFailure},
		{"bad owner", CreateRequest{Name: "p7", Cluster: "dev-1", Owner: "has space", Size: "S"}, http.StatusBadRequest, audit.ResultFailure},
		{"name taken", CreateRequest{Name: "first", Namespace: "other", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusConflict, audit.ResultFailure},
		{"bad name", CreateRequest{Name: "Bad_Name", Cluster: "dev-1", Owner: "a", Size: "S"}, http.StatusBadRequest, ""},
	}
	for _, tc := range cases {
		f := newAPIFixture(t, taken.DeepCopy())
		code, body := f.do(t, http.MethodPost, "/api/projects", tc.req)
		if code != tc.code {
			t.Errorf("%s: status %d (%v), want %d", tc.name, code, body, tc.code)
		}
		recs := f.records(t)
		if tc.result == "" {
			if len(recs) != 0 {
				t.Errorf("%s: unexpected audit %+v", tc.name, recs)
			}
			continue
		}
		if len(recs) != 1 || recs[0].Result != tc.result {
			t.Errorf("%s: audit = %+v, want result %s", tc.name, recs, tc.result)
		}
		var l v1alpha1.ProjectList
		_ = f.mgmt.List(context.Background(), &l)
		if len(l.Items) != 1 {
			t.Errorf("%s: a Project was created anyway", tc.name)
		}
	}
}

func TestAPIUpdate(t *testing.T) {
	f := newAPIFixture(t, &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: "shop"},
		Spec: v1alpha1.ProjectSpec{Cluster: "dev-1", Namespace: "shop", Owner: "team-a", Size: "S"}})
	size, owner := v1alpha1.SizeM, "team-b"
	code, body := f.do(t, http.MethodPatch, "/api/projects/shop", UpdateRequest{Size: &size, Owner: &owner})
	if code != http.StatusOK {
		t.Fatalf("status %d: %v", code, body)
	}
	if recs := f.records(t); recs[0].Action != "update" || recs[0].Detail != "size S → M; owner team-a → team-b" {
		t.Fatalf("audit = %+v", recs)
	}
	if code, _ := f.do(t, http.MethodPatch, "/api/projects/shop", map[string]any{"namespace": "x"}); code != http.StatusBadRequest {
		t.Fatalf("namespace change: status %d", code)
	}
}

func TestAPIDeleteLinksTheAuditEntry(t *testing.T) {
	p := &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: "shop", UID: "uid-1",
		Finalizers: []string{v1alpha1.FinalizerRemoteCleanup}}, // keeps it visible after delete
		Spec: v1alpha1.ProjectSpec{Cluster: "dev-1", Namespace: "shop", Owner: "a", Size: "S"}}
	f := newAPIFixture(t, p)

	if code, _ := f.do(t, http.MethodDelete, "/api/projects/shop", nil); code != http.StatusConflict {
		t.Fatalf("delete without uid: status %d", code)
	}
	code, body := f.do(t, http.MethodDelete, "/api/projects/shop?uid=uid-1", nil)
	if code != http.StatusAccepted {
		t.Fatalf("status %d: %v", code, body)
	}
	var got v1alpha1.Project
	if err := f.mgmt.Get(context.Background(), types.NamespacedName{Name: "shop"}, &got); err != nil {
		t.Fatal(err)
	}
	if got.DeletionTimestamp.IsZero() {
		t.Error("not deleted")
	}
	recs := f.records(t) // newest first: the successful delete
	if got.Annotations[v1alpha1.AnnotationDeleteAuditID] != recs[0].ID || got.Annotations[v1alpha1.AnnotationDeletedBy] != "dev" {
		t.Errorf("annotations %v, want delete-audit-id %s and deleted-by dev", got.Annotations, recs[0].ID)
	}
	if recs[1].Result != audit.ResultFailure {
		t.Errorf("the refused delete (no uid) must be audited: %+v", recs[1])
	}
}

func TestAPIWithoutMgmt(t *testing.T) {
	a := &API{MgmtErr: errors.New("kubeconfig not found"), Clusters: testClusters{}, Config: &Config{}, Logger: slog.New(slog.DiscardHandler)}
	mux := http.NewServeMux()
	a.Register(mux)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/projects", nil))
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestAPIConfig(t *testing.T) {
	f := newAPIFixture(t)
	code, body := f.do(t, http.MethodGet, "/api/projects/_config", nil)
	if code != http.StatusOK || len(body["sizes"].(map[string]any)) != 3 || body["clusters"].([]any)[0] != "dev-1" {
		t.Fatalf("status %d: %v", code, body)
	}
}
