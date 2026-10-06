package cluster

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
)

type apiFixture struct {
	srv       *httptest.Server
	mgmt      client.Client
	store     *audit.FileStore
	auditPath string
}

func newAPIFixture(t *testing.T, objs ...client.Object) *apiFixture {
	t.Helper()
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	mgmt := fake.NewClientBuilder().WithScheme(scheme).WithObjects(objs...).Build()
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewFileStore(path)
	if err != nil {
		t.Fatal(err)
	}
	a := &API{
		Mgmt: mgmt, Registry: NewRegistry(ValidateOptions{}, discard),
		Auditor: audit.NewAuditor(store, slog.New(slog.DiscardHandler)),
		Logger:  discard,
	}
	mux := http.NewServeMux()
	a.Register(mux)
	srv := httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(srv.Close)
	return &apiFixture{srv: srv, mgmt: mgmt, store: store, auditPath: path}
}

func (f *apiFixture) do(t *testing.T, method, path string, body any) (int, string) {
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
	raw, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, string(raw)
}

func (f *apiFixture) records(t *testing.T) []audit.Record {
	t.Helper()
	recs, err := f.store.List(context.Background(), audit.Filter{})
	if err != nil {
		t.Fatal(err)
	}
	return recs
}

// noLeak fails if the token or kubeconfig text reached a response or the audit log.
func (f *apiFixture) noLeak(t *testing.T, bodies ...string) {
	t.Helper()
	raw, _ := os.ReadFile(f.auditPath)
	for _, s := range append(bodies, string(raw)) {
		if strings.Contains(s, secretToken) || strings.Contains(s, "certificate-authority-data") {
			t.Fatalf("kubeconfig content leaked: %s", s)
		}
	}
}

func TestAPIValidate(t *testing.T) {
	f := newAPIFixture(t)
	code, body := f.do(t, http.MethodPost, "/api/clusters/_validate", map[string]string{"kubeconfig": string(good(t, nil))})
	if code != http.StatusOK || !strings.Contains(body, `"authMethod"`) {
		t.Fatalf("status %d: %s", code, body)
	}
	bad := good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"].Exec = &clientcmdapi.ExecConfig{Command: "/bin/sh"}
	})
	code, body2 := f.do(t, http.MethodPost, "/api/clusters/_validate", map[string]string{"kubeconfig": string(bad)})
	if code != http.StatusBadRequest || !strings.Contains(body2, "problems") {
		t.Fatalf("exec plugin: status %d: %s", code, body2)
	}
	code, body3 := f.do(t, http.MethodPost, "/api/clusters/_validate", map[string]string{"kubeconfig": string(good(t, nil)), "extra": "x"})
	if code != http.StatusBadRequest {
		t.Fatalf("unknown field: status %d", code)
	}
	f.noLeak(t, body, body2, body3)
	if len(f.records(t)) != 0 {
		t.Fatal("validation must not be audited (nothing changes)")
	}
}

func TestAPIRegisterUpdateRotate(t *testing.T) {
	f := newAPIFixture(t)
	ctx := context.Background()
	reg := RegisterBody{ID: "dev-9", Environment: v1alpha1.EnvUAT, Kubeconfig: string(good(t, nil))}
	code, body := f.do(t, http.MethodPost, "/api/clusters", reg)
	if code != http.StatusCreated {
		t.Fatalf("register: status %d: %s", code, body)
	}
	var secret corev1.Secret
	if err := f.mgmt.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: "dev-9-kubeconfig"}, &secret); err != nil {
		t.Fatal(err)
	}
	if secret.Type != v1alpha1.KubeconfigSecretType || len(secret.OwnerReferences) != 1 {
		t.Errorf("secret = %s %+v", secret.Type, secret.OwnerReferences)
	}
	if code, _ := f.do(t, http.MethodPost, "/api/clusters", reg); code != http.StatusConflict {
		t.Errorf("second register: status %d", code)
	}

	prod := v1alpha1.EnvProd
	if code, b := f.do(t, http.MethodPatch, "/api/clusters/dev-9", UpdateBody{Environment: &prod}); code != http.StatusOK {
		t.Fatalf("update: %d %s", code, b)
	}
	bogus := v1alpha1.Environment("staging")
	if code, _ := f.do(t, http.MethodPatch, "/api/clusters/dev-9", UpdateBody{Environment: &bogus}); code != http.StatusBadRequest {
		t.Errorf("bad environment: status %d", code)
	}
	var cl v1alpha1.Cluster
	_ = f.mgmt.Get(ctx, types.NamespacedName{Name: "dev-9"}, &cl)
	if cl.Spec.Environment != v1alpha1.EnvProd {
		t.Errorf("environment = %s", cl.Spec.Environment)
	}

	rotated := good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"].Token = jwt("rotated", cl.CreationTimestamp.AddDate(1, 0, 0))
	})
	code, body2 := f.do(t, http.MethodPut, "/api/clusters/dev-9/kubeconfig", map[string]string{"kubeconfig": string(rotated)})
	if code != http.StatusOK {
		t.Fatalf("rotate: %d %s", code, body2)
	}
	_ = f.mgmt.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: "dev-9-kubeconfig"}, &secret)
	if !bytes.Equal(secret.Data[v1alpha1.KubeconfigKey], rotated) {
		t.Error("kubeconfig not replaced")
	}
	if code, _ := f.do(t, http.MethodPut, "/api/clusters/nope/kubeconfig", map[string]string{"kubeconfig": string(rotated)}); code != http.StatusNotFound {
		t.Errorf("rotate unknown: status %d", code)
	}

	var actions []string
	for _, r := range f.records(t) {
		actions = append(actions, r.Action+"="+string(r.Result))
		if r.User != "dev" || r.Kind != "Cluster" {
			t.Errorf("record = %+v", r)
		}
	}
	want := "rotate-credentials=failure rotate-credentials=success update=failure update=success register=failure register=success"
	if strings.Join(actions, " ") != want {
		t.Errorf("audit = %v, want %s", actions, want)
	}
	f.noLeak(t, body, body2)
}

func TestAPIInstallerCredential(t *testing.T) {
	cl := &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: "dev-9", UID: "u9"},
		Spec: v1alpha1.ClusterSpec{Environment: v1alpha1.EnvDev, KubeconfigSecret: v1alpha1.SecretRef{Name: "dev-9-kubeconfig"}}}
	f := newAPIFixture(t, cl)
	ctx := context.Background()
	raw := good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"].Token = jwt("system:serviceaccount:capybara-system:capybara-installer", time.Now().Add(time.Hour))
	})

	code, body := f.do(t, http.MethodPut, "/api/clusters/dev-9/installer", map[string]string{"kubeconfig": string(raw)})
	if code != http.StatusOK || !strings.Contains(body, "capybara-installer") {
		t.Fatalf("set: %d %s", code, body)
	}
	var secret corev1.Secret
	if err := f.mgmt.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: "dev-9-installer"}, &secret); err != nil {
		t.Fatal(err)
	}
	if secret.Type != v1alpha1.InstallerSecretType || !bytes.Equal(secret.Data[v1alpha1.KubeconfigKey], raw) || len(secret.OwnerReferences) != 1 {
		t.Errorf("secret = %s %v", secret.Type, secret.OwnerReferences)
	}
	_ = f.mgmt.Get(ctx, types.NamespacedName{Name: "dev-9"}, cl)
	if cl.Spec.InstallerSecret == nil || cl.Spec.InstallerSecret.Name != "dev-9-installer" {
		t.Fatalf("cluster ref = %+v", cl.Spec.InstallerSecret)
	}
	// Replacing keeps one Secret.
	if code, _ := f.do(t, http.MethodPut, "/api/clusters/dev-9/installer", map[string]string{"kubeconfig": string(raw)}); code != http.StatusOK {
		t.Fatalf("replace: %d", code)
	}
	bad := good(t, func(c *clientcmdapi.Config) { c.AuthInfos["u"].Exec = &clientcmdapi.ExecConfig{Command: "sh"} })
	if code, _ := f.do(t, http.MethodPut, "/api/clusters/dev-9/installer", map[string]string{"kubeconfig": string(bad)}); code != http.StatusBadRequest {
		t.Errorf("exec plugin accepted: %d", code)
	}

	if code, _ := f.do(t, http.MethodDelete, "/api/clusters/dev-9/installer", nil); code != http.StatusOK {
		t.Fatalf("remove: %d", code)
	}
	_ = f.mgmt.Get(ctx, types.NamespacedName{Name: "dev-9"}, cl)
	if cl.Spec.InstallerSecret != nil {
		t.Error("reference kept")
	}
	if err := f.mgmt.Get(ctx, client.ObjectKeyFromObject(&secret), &corev1.Secret{}); !apierrors.IsNotFound(err) {
		t.Errorf("secret kept: %v", err)
	}
	var actions []string
	for _, r := range f.records(t) {
		actions = append(actions, r.Action+"="+string(r.Result))
	}
	if strings.Join(actions, " ") != "remove-installer=success set-installer=failure set-installer=success set-installer=success" {
		t.Errorf("audit = %v", actions)
	}
	f.noLeak(t, body)
}

func TestViewPluginInstalls(t *testing.T) {
	cond := func(status metav1.ConditionStatus, reason string) v1alpha1.ClusterStatus {
		return v1alpha1.ClusterStatus{InstallerIdentity: "inst", Conditions: []metav1.Condition{{Type: v1alpha1.ConditionInstallerReady, Status: status, Reason: reason, Message: "m"}}}
	}
	for _, c := range []struct {
		st   v1alpha1.ClusterStatus
		want string
	}{
		{v1alpha1.ClusterStatus{}, "Disabled"},
		{cond(metav1.ConditionFalse, "NotConfigured"), "Disabled"},
		{cond(metav1.ConditionFalse, "AuthFailed"), "Error"},
		{cond(metav1.ConditionTrue, "Ready"), "Enabled"},
	} {
		if got := ToView(Info{ID: "x"}, c.st).Status.PluginInstalls; got != c.want {
			t.Errorf("%+v: %s, want %s", c.st.Conditions, got, c.want)
		}
	}
}

func TestAPIRemove(t *testing.T) {
	cl := &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: "dev-9"},
		Spec: v1alpha1.ClusterSpec{Environment: v1alpha1.EnvDev, KubeconfigSecret: v1alpha1.SecretRef{Name: "dev-9-kubeconfig"}}}
	secret := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "dev-9-kubeconfig"}, Type: v1alpha1.KubeconfigSecretType}
	project := func(name, clusterID string) *v1alpha1.Project {
		return &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: name, Finalizers: []string{"platform.capybara.io/cleanup"}},
			Spec: v1alpha1.ProjectSpec{Cluster: clusterID, Namespace: name, Owner: "o", Size: "S"}}
	}
	inst := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-9", Finalizers: []string{v1alpha1.FinalizerPluginUninstall}},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-9", Mode: v1alpha1.ModeInstall, Version: "0.1.0"}}
	f := newAPIFixture(t, cl, secret, project("shop", "dev-9"), project("blog", "dev-9"), project("other", "dev-1"), inst)
	ctx := context.Background()

	if code, _ := f.do(t, http.MethodDelete, "/api/clusters/dev-9?confirm=dev-1", nil); code != http.StatusBadRequest {
		t.Fatalf("confirm mismatch: status %d", code)
	}
	code, body := f.do(t, http.MethodDelete, "/api/clusters/dev-9?confirm=dev-9", nil)
	if code != http.StatusConflict || !strings.Contains(body, `"projects":["blog","shop"]`) || !strings.Contains(body, `"plugins":["monitoring"]`) {
		t.Fatalf("refusal: status %d: %s", code, body)
	}
	if err := f.mgmt.Get(ctx, types.NamespacedName{Name: "dev-9"}, &v1alpha1.Cluster{}); err != nil {
		t.Fatalf("refused removal deleted the cluster: %v", err)
	}

	if code, b := f.do(t, http.MethodDelete, "/api/clusters/dev-9?confirm=dev-9&abandon=true", nil); code != http.StatusOK {
		t.Fatalf("abandon: status %d: %s", code, b)
	}
	recs := f.records(t)
	removed := recs[0]
	if removed.Action != "remove" || removed.Result != audit.ResultSuccess || !strings.Contains(removed.Detail, "blog, shop") || !strings.Contains(removed.Detail, "plugins monitoring") {
		t.Fatalf("audit = %+v", removed)
	}
	for _, name := range []string{"shop", "blog"} {
		var p v1alpha1.Project
		if err := f.mgmt.Get(ctx, types.NamespacedName{Name: name}, &p); err != nil {
			t.Fatal(err)
		}
		if p.DeletionTimestamp == nil || p.Annotations[v1alpha1.AnnotationAbandonRemote] != "true" ||
			p.Annotations[v1alpha1.AnnotationDeleteAuditID] != removed.ID || p.Annotations[v1alpha1.AnnotationDeletedBy] != "dev" {
			t.Errorf("project %s = %+v (deleting %v)", name, p.Annotations, p.DeletionTimestamp)
		}
	}
	var pi v1alpha1.PluginInstallation
	_ = f.mgmt.Get(ctx, types.NamespacedName{Name: "monitoring.dev-9"}, &pi)
	if pi.DeletionTimestamp == nil || pi.Annotations[v1alpha1.AnnotationAbandonRemote] != "true" || pi.Annotations[v1alpha1.AnnotationRequestAuditID] != removed.ID {
		t.Errorf("plugin installation = %+v", pi.Annotations)
	}
	var other v1alpha1.Project
	_ = f.mgmt.Get(ctx, types.NamespacedName{Name: "other"}, &other)
	if other.DeletionTimestamp != nil || other.Annotations[v1alpha1.AnnotationAbandonRemote] != "" {
		t.Error("a Project on another cluster was touched")
	}
	if err := f.mgmt.Get(ctx, types.NamespacedName{Name: "dev-9"}, &v1alpha1.Cluster{}); !apierrors.IsNotFound(err) {
		t.Errorf("cluster still there: %v", err)
	}
	if err := f.mgmt.Get(ctx, client.ObjectKeyFromObject(secret), &corev1.Secret{}); !apierrors.IsNotFound(err) {
		t.Errorf("secret still there: %v", err)
	}
	if code, _ := f.do(t, http.MethodDelete, "/api/clusters/dev-9?confirm=dev-9", nil); code != http.StatusNotFound {
		t.Errorf("second removal: status %d", code)
	}
}

func TestAPIWithoutMgmt(t *testing.T) {
	a := &API{MgmtErr: errors.New("connection refused"), Registry: NewRegistry(ValidateOptions{}, discard)}
	mux := http.NewServeMux()
	a.Register(mux)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/clusters", strings.NewReader("{}")))
	if rec.Code != http.StatusServiceUnavailable || !strings.Contains(rec.Body.String(), "connection refused") {
		t.Fatalf("status %d: %s", rec.Code, rec.Body)
	}
}
