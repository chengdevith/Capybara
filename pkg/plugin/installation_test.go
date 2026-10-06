package plugin

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
)

var quiet = slog.New(slog.NewTextHandler(io.Discard, nil))

type testClusters struct {
	cs  kubernetes.Interface
	cfg *rest.Config
}

func (t testClusters) Client(string) (kubernetes.Interface, error) { return t.cs, nil }
func (t testClusters) RESTConfig(string) (*rest.Config, error)     { return rest.CopyConfig(t.cfg), nil }

func kubeconfigBytes(t *testing.T, rc *rest.Config) []byte {
	t.Helper()
	server := rc.Host
	if !strings.HasPrefix(server, "https://") {
		server = "https://" + server
	}
	cfg := clientcmdapi.NewConfig()
	cfg.Clusters["c"] = &clientcmdapi.Cluster{Server: server, CertificateAuthorityData: rc.CAData}
	cfg.AuthInfos["u"] = &clientcmdapi.AuthInfo{ClientCertificateData: rc.CertData, ClientKeyData: rc.KeyData}
	cfg.Contexts["ctx"] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
	cfg.CurrentContext = "ctx"
	raw, err := clientcmd.Write(*cfg)
	if err != nil {
		t.Fatal(err)
	}
	return raw
}

type envFixture struct {
	ctx        context.Context
	c          client.Client
	cs         kubernetes.Interface
	r          *InstallationReconciler
	installers *cluster.Installers
	env        *envtest.Environment
	auditPath  string
}

func newEnv(t *testing.T) *envFixture {
	t.Helper()
	if os.Getenv("KUBEBUILDER_ASSETS") == "" {
		t.Skip("envtest not available (run `make test`)")
	}
	env := &envtest.Environment{CRDDirectoryPaths: []string{filepath.Join("..", "..", "deploy", "crds")}, ErrorIfCRDPathMissing: true}
	cfg, err := env.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = env.Stop() })
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	_ = apiextensionsv1.AddToScheme(scheme)
	c, err := client.New(cfg, client.Options{Scheme: scheme})
	if err != nil {
		t.Fatal(err)
	}
	cs := kubernetes.NewForConfigOrDie(cfg)
	ctx := context.Background()
	for _, ns := range []string{v1alpha1.SystemNamespace, "monitoring"} {
		_ = c.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: ns}})
	}
	// The plugin, as the catalog would store it.
	_, spec, _ := LoadDir("../../plugins/monitoring", "builtin")
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "monitoring"}, Spec: *spec}
	if err := c.Create(ctx, p); err != nil {
		t.Fatal(err)
	}
	p.Status = v1alpha1.PluginStatus{Available: true}
	if err := c.Status().Update(ctx, p); err != nil {
		t.Fatal(err)
	}
	auditPath := filepath.Join(t.TempDir(), "audit.jsonl")
	store, _ := audit.NewFileStore(auditPath)
	installers := cluster.NewInstallers(cluster.ValidateOptions{}, quiet)
	r := &InstallationReconciler{
		Client: c, Reader: c, Clusters: testClusters{cs: cs, cfg: cfg}, Installers: installers,
		PluginsDir: "../../plugins", Auditor: audit.NewAuditor(store, quiet), Logger: quiet,
		HelmTimeout: time.Minute, TokenTTL: time.Hour, Recheck: time.Minute, Now: time.Now,
	}
	return &envFixture{ctx: ctx, c: c, cs: cs, r: r, installers: installers, env: env, auditPath: auditPath}
}

// setInstaller gives cluster id an installer credential for user (nil: admin).
func (f *envFixture) setInstaller(t *testing.T, id string, user *envtest.AuthenticatedUser) {
	t.Helper()
	var rc *rest.Config
	if user == nil {
		u, err := f.env.AddUser(envtest.User{Name: "installer-admin", Groups: []string{"system:masters"}}, nil)
		if err != nil {
			t.Fatal(err)
		}
		rc = u.Config()
	} else {
		rc = user.Config()
	}
	f.installers.Set(id, &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{ResourceVersion: rc.Host + string(rc.CertData[:16])},
		Type:       v1alpha1.InstallerSecretType,
		Data:       map[string][]byte{v1alpha1.KubeconfigKey: kubeconfigBytes(t, rc)},
	})
}

func (f *envFixture) reconcile(t *testing.T, name string) v1alpha1.PluginInstallation {
	t.Helper()
	if _, err := f.r.Reconcile(f.ctx, ctrl.Request{NamespacedName: types.NamespacedName{Name: name}}); err != nil {
		t.Fatal(err)
	}
	var in v1alpha1.PluginInstallation
	_ = f.c.Get(f.ctx, types.NamespacedName{Name: name}, &in)
	return in
}

func connectInstallation(cluster string) *v1alpha1.PluginInstallation {
	cfg, _ := json.Marshal(map[string]any{"namespace": "monitoring", "service": "prometheus", "port": "9090"})
	return &v1alpha1.PluginInstallation{
		ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.InstallationName("monitoring", cluster),
			Annotations: map[string]string{v1alpha1.AnnotationRequestedBy: "dev"}},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: cluster, Mode: v1alpha1.ModeConnect,
			Enabled: true, Version: "0.1.0", Config: &runtime.RawExtension{Raw: cfg}},
	}
}

func TestConnectModeLifecycle(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx

	// No installer credential: refused, nothing created.
	if err := f.c.Create(ctx, connectInstallation("dev-x")); err != nil {
		t.Fatal(err)
	}
	in := f.reconcile(t, "monitoring.dev-x")
	if in.Status.Phase != v1alpha1.InstallError || !strings.Contains(in.Status.Message, "installer credential") {
		t.Fatalf("without installer: %s %q", in.Status.Phase, in.Status.Message)
	}

	// A credential without the declared permissions: pre-flight lists them.
	weak, err := f.env.AddUser(envtest.User{Name: "weak-installer"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	f.setInstaller(t, "dev-x", weak)
	in = f.reconcile(t, "monitoring.dev-x")
	if in.Status.Phase != v1alpha1.InstallError || !strings.Contains(in.Status.Message, "lacks") ||
		!strings.Contains(in.Status.Message, "hack/capybara-sa.sh dev-x --installer monitoring --connect --set namespace=monitoring --set port=9090 --set service=prometheus") {
		t.Fatalf("weak installer: %q", in.Status.Message)
	}
	if _, err := f.cs.CoreV1().ServiceAccounts("monitoring").Get(ctx, "capybara-plugin-monitoring", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Fatal("refused pre-flight must not create anything")
	}

	// A refused installation that never applied anything goes away at once.
	refused := in
	if err := f.c.Delete(ctx, &refused); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "monitoring.dev-x")
	if err := f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-x"}, &refused); !apierrors.IsNotFound(err) {
		t.Fatalf("refused installation kept: %v", err)
	}

	// With a working installer: the backend's account, its exact Role and
	// a token Secret in mgmt.
	f.setInstaller(t, "dev-1", nil)
	if err := f.c.Create(ctx, connectInstallation("dev-1")); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "monitoring.dev-1") // adds the finalizer
	in = f.reconcile(t, "monitoring.dev-1")
	if in.Status.Phase != v1alpha1.InstallInstalling || in.Status.CurrentStep != "connected" || in.Status.AppliedHash == "" {
		t.Fatalf("connect: phase %s step %s msg %q", in.Status.Phase, in.Status.CurrentStep, in.Status.Message)
	}
	role, err := f.cs.RbacV1().Roles("monitoring").Get(ctx, "capybara-plugin-monitoring", metav1.GetOptions{})
	if err != nil {
		t.Fatal(err)
	}
	want := rbacv1.PolicyRule{APIGroups: []string{""}, Resources: []string{"services/proxy"}, ResourceNames: []string{"prometheus:9090"}, Verbs: []string{"get"}}
	if len(role.Rules) != 1 || role.Rules[0].ResourceNames[0] != want.ResourceNames[0] || role.Rules[0].Verbs[0] != "get" {
		t.Errorf("backend role = %+v", role.Rules)
	}
	var tok corev1.Secret
	if err := f.c.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName("monitoring", "dev-1")}, &tok); err != nil {
		t.Fatal(err)
	}
	if tok.Type != v1alpha1.PluginTokenSecretType || len(tok.Data[TokenKey]) == 0 || !strings.Contains(string(tok.Data[ServicesKey]), `"prometheus"`) {
		t.Errorf("token secret = %s %v", tok.Type, tok.Data[ServicesKey])
	}
	// The token works as the backend's account, and only for that service.
	tc := TokenConfig(rest.CopyConfig(f.r.Clusters.(testClusters).cfg), string(tok.Data[TokenKey]))
	tcs := kubernetes.NewForConfigOrDie(tc)
	if _, err := tcs.CoreV1().Secrets("monitoring").List(ctx, metav1.ListOptions{}); !apierrors.IsForbidden(err) {
		t.Errorf("backend token can list secrets: %v", err)
	}

	// A step failing after everything passed once is an error, not "installing".
	setCond(&in.Status, ConditionInstalled, metav1.ConditionTrue, "AllStepsPassed", "")
	if err := f.c.Status().Update(ctx, &in); err != nil {
		t.Fatal(err)
	}
	for range 2 {
		in = f.reconcile(t, "monitoring.dev-1")
		if in.Status.Phase != v1alpha1.InstallError || !strings.Contains(in.Status.Message, "step connected is failing") {
			t.Fatalf("degraded: %s %q", in.Status.Phase, in.Status.Message)
		}
	}

	// Disabling does not re-apply.
	hash := in.Status.AppliedHash
	in.Spec.Enabled = false
	if err := f.c.Update(ctx, &in); err != nil {
		t.Fatal(err)
	}
	if in = f.reconcile(t, "monitoring.dev-1"); in.Status.AppliedHash != hash {
		t.Error("disable re-applied")
	}

	// Uninstall removes the account and the token, then releases the object.
	if err := f.c.Delete(ctx, &in); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "monitoring.dev-1")
	if err := f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-1"}, &in); !apierrors.IsNotFound(err) {
		t.Fatalf("installation kept: %v (status %+v)", err, in.Status)
	}
	if _, err := f.cs.CoreV1().ServiceAccounts("monitoring").Get(ctx, "capybara-plugin-monitoring", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("backend account kept")
	}
	if err := f.c.Get(ctx, client.ObjectKeyFromObject(&tok), &corev1.Secret{}); !apierrors.IsNotFound(err) {
		t.Error("token secret kept")
	}
	raw, _ := os.ReadFile(f.auditPath)
	if strings.Contains(string(raw), string(tok.Data[TokenKey])) {
		t.Fatal("token reached the audit log")
	}
}

func TestForeignObjects(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	crd := &apiextensionsv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{Name: "widgets.example.com"},
		Spec: apiextensionsv1.CustomResourceDefinitionSpec{
			Group: "example.com", Scope: apiextensionsv1.NamespaceScoped,
			Names: apiextensionsv1.CustomResourceDefinitionNames{Plural: "widgets", Singular: "widget", Kind: "Widget", ListKind: "WidgetList"},
			Versions: []apiextensionsv1.CustomResourceDefinitionVersion{{Name: "v1", Served: true, Storage: true,
				Schema: &apiextensionsv1.CustomResourceValidation{OpenAPIV3Schema: &apiextensionsv1.JSONSchemaProps{Type: "object", XPreserveUnknownFields: ptrTrue()}}}},
		},
	}
	if err := f.c.Create(ctx, crd); err != nil {
		t.Fatal(err)
	}
	time.Sleep(time.Second) // CRD established
	dyn := dynamic.NewForConfigOrDie(f.r.Clusters.(testClusters).cfg)
	widgets := dyn.Resource(schema.GroupVersionResource{Group: "example.com", Version: "v1", Resource: "widgets"})
	mk := func(ns, name string, ours bool) {
		o := &unstructured.Unstructured{Object: map[string]any{"apiVersion": "example.com/v1", "kind": "Widget",
			"metadata": map[string]any{"name": name, "namespace": ns}}}
		if ours {
			o.SetAnnotations(map[string]string{"meta.helm.sh/release-name": "rel", "meta.helm.sh/release-namespace": "monitoring"})
		}
		var err error
		for i := 0; i < 20; i++ {
			if _, err = widgets.Namespace(ns).Create(ctx, o, metav1.CreateOptions{}); err == nil {
				return
			}
			time.Sleep(200 * time.Millisecond)
		}
		t.Fatal(err)
	}
	mk("monitoring", "mine", true)
	mk("default", "theirs", false)
	got, err := ForeignObjects(ctx, dyn, []string{"widgets.example.com", "missing.example.com"}, "rel", "monitoring")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0] != "Widget default/theirs" {
		t.Fatalf("foreign = %v", got)
	}
	if HashList(got) == HashList(nil) || HashList(got) != HashList([]string{"Widget default/theirs"}) {
		t.Error("hash must identify the exact list")
	}
}

func ptrTrue() *bool { b := true; return &b }
