package plugin

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	chartcommon "helm.sh/helm/v4/pkg/chart/common"
	chart "helm.sh/helm/v4/pkg/chart/v2"
	chartutil "helm.sh/helm/v4/pkg/chart/v2/util"
	corev1 "k8s.io/api/core/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"

	"github.com/capybara/capybara/api/v1alpha1"
)

func TestCheckExtensionAPI(t *testing.T) {
	for _, c := range []struct {
		major int
		min   string
		ok    bool
	}{
		{1, "", true},
		{1, "1.0", true},
		{1, "1.1", true},
		{1, "1.2", false},
		{2, "", false},
		{1, "2.0", false},
		{1, "x", false},
	} {
		why := CheckExtensionAPI(c.major, c.min)
		if (why == "") != c.ok {
			t.Errorf("%d %q: %q", c.major, c.min, why)
		}
	}
	if why := CheckExtensionAPI(1, "1.9"); !strings.Contains(why, "needs extension API 1.9; this Capybara provides 1.1") {
		t.Errorf("message = %q", why)
	}
}

func TestActionsMustBeAllowedByConsolePermissions(t *testing.T) {
	base := "name: x\ndisplayName: X\nversion: 1.0.0\nextensionApi: 1\nscope: per-cluster\nmodes: [connect]\n"
	action := "actions:\n  - {name: rerun, title: Rerun, group: tekton.dev, version: v1, resource: pipelineruns, kind: PipelineRun, type: copy, copyFields: [spec.params]}\n"
	if _, err := ParseManifest([]byte(base + action)); err == nil || !strings.Contains(err.Error(), "permissions.console must allow create") {
		t.Fatalf("action without console permission accepted: %v", err)
	}
	perms := "permissions:\n  console:\n    clusterRules:\n      - {apiGroups: [tekton.dev], resources: [pipelineruns], verbs: [get, create]}\n"
	if _, err := ParseManifest([]byte(base + action + perms)); err != nil {
		t.Fatal(err)
	}
	bad := "actions:\n  - {name: x, title: X, group: tekton.dev, version: v1, resource: pipelineruns, kind: PipelineRun, type: copy, copyFields: [metadata.labels]}\n"
	if _, err := ParseManifest([]byte(base + bad + perms)); err == nil {
		t.Error("copying outside spec accepted")
	}
}

func widgetCRD(marker string) string {
	return `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: widgets.example.com
  annotations:
    example.com/marker: "` + marker + `"
spec:
  group: example.com
  scope: Namespaced
  names: {plural: widgets, singular: widget, kind: Widget, listKind: WidgetList}
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema: {type: object, x-kubernetes-preserve-unknown-fields: true}
`
}

// writeWidgetsPlugin writes a minimal plugin with a chart (one CRD in
// crds/, one ConfigMap) and console permissions, and returns its spec.
func writeWidgetsPlugin(t *testing.T, root, version, marker string) *v1alpha1.PluginSpec {
	t.Helper()
	dir := filepath.Join(root, "widgets")
	_ = os.MkdirAll(filepath.Join(dir, "chart"), 0o755)
	ch := &chart.Chart{
		Metadata:  &chart.Metadata{APIVersion: "v2", Name: "widgets", Version: version},
		Templates: []*chartcommon.File{{Name: "templates/cm.yaml", Data: []byte("apiVersion: v1\nkind: ConfigMap\nmetadata: {name: widgets-config}\ndata: {v: \"" + version + "\"}\n")}},
		Files:     []*chartcommon.File{{Name: "crds/widgets.yaml", Data: []byte(widgetCRD(marker))}},
	}
	path, err := chartutil.Save(ch, filepath.Join(dir, "chart"))
	if err != nil {
		t.Fatal(err)
	}
	archive, _ := os.ReadFile(path)
	sum := sha256.Sum256(archive)
	return &v1alpha1.PluginSpec{
		Name: "widgets", Repository: "builtin", DisplayName: "Widgets", Version: version, ExtensionAPI: 1,
		Scope: "per-cluster", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall, v1alpha1.ModeConnect},
		Chart: &v1alpha1.ChartRef{Archive: "chart/" + filepath.Base(path), SHA256: hex.EncodeToString(sum[:]), ReleaseName: "widgets", Namespace: "widgets", Version: version},
		Permissions: v1alpha1.PluginPermissions{
			Install: v1alpha1.RuleSet{ClusterRules: []v1alpha1.PolicyRule{{APIGroups: []string{"*"}, Resources: []string{"*"}, Verbs: []string{"*"}}}},
			Console: v1alpha1.RuleSet{ClusterRules: []v1alpha1.PolicyRule{{APIGroups: []string{"example.com"}, Resources: []string{"widgets"}, Verbs: []string{"get", "list", "watch", "create"}}}},
		},
		Detect: &v1alpha1.Detect{APIResources: []string{"example.com/widgets"}},
		Steps: []v1alpha1.InstallStep{
			{Name: "chart", Title: "Chart", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall}, Check: v1alpha1.StepCheck{Type: "helm"}},
			{Name: "served", Title: "Widgets served", Check: v1alpha1.StepCheck{Type: "apiResource", Name: "example.com/widgets"}},
		},
	}
}

func TestBackendlessPluginWithConsolePermissionsAndCRDUpgrade(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	root := t.TempDir()
	f.r.PluginsDir = root
	f.setInstaller(t, "dev-1", nil)
	// Capybara's identity on the cluster, as the health check records it.
	cl := &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: "dev-1"},
		Spec: v1alpha1.ClusterSpec{Environment: v1alpha1.EnvDev, KubeconfigSecret: v1alpha1.SecretRef{Name: "dev-1-kubeconfig"}}}
	if err := f.c.Create(ctx, cl); err != nil {
		t.Fatal(err)
	}
	cl.Status.Identity = "system:serviceaccount:capybara-system:capybara"
	if err := f.c.Status().Update(ctx, cl); err != nil {
		t.Fatal(err)
	}

	spec := writeWidgetsPlugin(t, root, "1.0.0", "one")
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "widgets"}, Spec: *spec}
	if err := f.c.Create(ctx, p); err != nil {
		t.Fatal(err)
	}
	p.Status.Available = true
	_ = f.c.Status().Update(ctx, p)

	// Connect is refused while nothing serves widgets.
	connect := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "widgets.dev-1"},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "widgets", Cluster: "dev-1", Mode: v1alpha1.ModeConnect, Enabled: true, Version: "1.0.0"}}
	if err := f.c.Create(ctx, connect); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-1")
	in := f.reconcile(t, "widgets.dev-1")
	if in.Status.Phase != v1alpha1.InstallError || !strings.Contains(in.Status.Message, "nothing to connect to") {
		t.Fatalf("connect without widgets: %s %q", in.Status.Phase, in.Status.Message)
	}
	_ = f.c.Delete(ctx, &in)
	f.reconcile(t, "widgets.dev-1")

	// Install: chart, CRD, console permissions; no backend account.
	install := connect.DeepCopy()
	install.ResourceVersion, install.Spec.Mode = "", v1alpha1.ModeInstall
	if err := f.c.Create(ctx, install); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-1")
	deadline := time.Now().Add(30 * time.Second)
	for in = f.reconcile(t, "widgets.dev-1"); in.Status.Phase != v1alpha1.InstallReady && time.Now().Before(deadline); in = f.reconcile(t, "widgets.dev-1") {
		time.Sleep(300 * time.Millisecond)
	}
	if in.Status.Phase != v1alpha1.InstallReady {
		t.Fatalf("install: %s %q %+v", in.Status.Phase, in.Status.Message, in.Status.Steps)
	}
	binding, err := f.cs.RbacV1().ClusterRoleBindings().Get(ctx, "capybara-plugin-widgets-console", metav1.GetOptions{})
	if err != nil || binding.Subjects[0].Kind != "ServiceAccount" || binding.Subjects[0].Name != "capybara" || binding.Subjects[0].Namespace != "capybara-system" {
		t.Fatalf("console binding = %+v, %v", binding, err)
	}
	if err := f.c.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName("widgets", "dev-1")}, &corev1.Secret{}); !apierrors.IsNotFound(err) {
		t.Error("a plugin without services must get no backend token")
	}
	if _, err := f.cs.CoreV1().ServiceAccounts("widgets").Get(ctx, BackendAccount("widgets"), metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("a plugin without services must get no backend account")
	}

	// Upgrade: the new chart's CRD is applied (Helm alone would skip it).
	spec2 := writeWidgetsPlugin(t, root, "1.1.0", "two")
	_ = f.c.Get(ctx, types.NamespacedName{Name: "widgets"}, p)
	p.Spec = *spec2
	if err := f.c.Update(ctx, p); err != nil {
		t.Fatal(err)
	}
	in.Spec.Version = "1.1.0"
	if err := f.c.Update(ctx, &in); err != nil {
		t.Fatal(err)
	}
	in = f.reconcile(t, "widgets.dev-1")
	var crd apiextensionsv1.CustomResourceDefinition
	if err := f.c.Get(ctx, types.NamespacedName{Name: "widgets.example.com"}, &crd); err != nil {
		t.Fatal(err)
	}
	if crd.Annotations["example.com/marker"] != "two" || in.Status.InstalledVersion != "1.1.0" {
		t.Errorf("CRD not upgraded: marker %q, installed %q (%s)", crd.Annotations["example.com/marker"], in.Status.InstalledVersion, in.Status.Message)
	}

	// Uninstall revokes the console permissions.
	if err := f.c.Delete(ctx, &in); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-1")
	if _, err := f.cs.RbacV1().ClusterRoleBindings().Get(ctx, "capybara-plugin-widgets-console", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("console binding kept after uninstall")
	}

	// A foreign widgets CRD (not labelled ours) refuses install mode.
	_ = f.c.Get(ctx, types.NamespacedName{Name: "widgets.example.com"}, &crd)
	delete(crd.Labels, v1alpha1.LabelPlugin)
	_ = f.c.Update(ctx, &crd)
	again := install.DeepCopy()
	again.ResourceVersion, again.Spec.Version = "", "1.1.0"
	if err := f.c.Create(ctx, again); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-1")
	in = f.reconcile(t, "widgets.dev-1")
	if !strings.Contains(in.Status.Message, "already served by another installation") {
		t.Errorf("install over a foreign CRD: %q", in.Status.Message)
	}
}
