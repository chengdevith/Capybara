package plugin

import (
	"context"
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
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	k8sfake "k8s.io/client-go/kubernetes/fake"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
	"sigs.k8s.io/controller-runtime/pkg/event"

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
		{1, "1.2", true},
		{1, "1.3", true},
		{1, "1.4", false},
		{2, "", false},
		{1, "2.0", false},
		{1, "x", false},
	} {
		why := CheckExtensionAPI(c.major, c.min)
		if (why == "") != c.ok {
			t.Errorf("%d %q: %q", c.major, c.min, why)
		}
	}
	if why := CheckExtensionAPI(1, "1.9"); !strings.Contains(why, "needs extension API 1.9; this Capybara provides 1.3") {
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
		Chart: &v1alpha1.ChartRef{Archive: "chart/" + filepath.Base(path), SHA256: hex.EncodeToString(sum[:]), ReleaseName: "widgets", Namespace: "widgets", Version: version,
			NamespaceLabels: map[string]string{"pod-security.kubernetes.io/enforce": "restricted"}},
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
	if ns, err := f.cs.CoreV1().Namespaces().Get(ctx, "widgets", metav1.GetOptions{}); err != nil || ns.Labels["pod-security.kubernetes.io/enforce"] != "restricted" {
		t.Errorf("release namespace labels = %v, %v", ns.GetLabels(), err)
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

	// A cache that lags behind the last status write (as the manager's does
	// right after a long apply) must not cause another apply.
	helmRevisions := func() int {
		list, _ := f.cs.CoreV1().Secrets("widgets").List(ctx, metav1.ListOptions{LabelSelector: "owner=helm,name=widgets"})
		return len(list.Items)
	}
	revisions := helmRevisions()
	stale := in.DeepCopy()
	stale.Status = v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallInstalling}
	cached := f.r.Client
	f.r.Client = staleClient{Client: cached, stale: stale}
	f.r.Reader = cached
	in = f.reconcile(t, "widgets.dev-1")
	f.r.Client = cached
	if helmRevisions() != revisions || in.Status.Phase != v1alpha1.InstallReady {
		t.Errorf("re-applied from a stale cache: %d → %d Helm revisions, phase %s", revisions, helmRevisions(), in.Status.Phase)
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

// staleClient returns an old copy of one installation, like a lagging cache.
type staleClient struct {
	client.Client
	stale *v1alpha1.PluginInstallation
}

func (c staleClient) Get(ctx context.Context, key client.ObjectKey, obj client.Object, opts ...client.GetOption) error {
	if in, ok := obj.(*v1alpha1.PluginInstallation); ok && key.Name == c.stale.Name {
		c.stale.DeepCopyInto(in)
		return nil
	}
	return c.Client.Get(ctx, key, obj, opts...)
}

// Status writes (the controller's own) must not start another reconcile:
// a refused install would re-run its pre-flight forever and its Error would
// never be seen.
func TestInstallationEventsIgnoreStatusWrites(t *testing.T) {
	base := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "x.dev-1", Generation: 1, Finalizers: []string{v1alpha1.FinalizerPluginUninstall}}}
	changed := func(mut func(*v1alpha1.PluginInstallation)) bool {
		n := base.DeepCopy()
		mut(n)
		return installationChanged.Update(event.UpdateEvent{ObjectOld: base, ObjectNew: n})
	}
	if changed(func(n *v1alpha1.PluginInstallation) {
		n.Status.Phase, n.Status.Message = v1alpha1.InstallError, "pre-flight refused"
		n.ResourceVersion = "2"
	}) {
		t.Error("a status write starts a reconcile")
	}
	for name, mut := range map[string]func(*v1alpha1.PluginInstallation){
		"spec":       func(n *v1alpha1.PluginInstallation) { n.Generation = 2 },
		"annotation": func(n *v1alpha1.PluginInstallation) { n.Annotations = map[string]string{"a": "b"} },
		"deletion":   func(n *v1alpha1.PluginInstallation) { now := metav1.Now(); n.DeletionTimestamp = &now },
		"finalizer":  func(n *v1alpha1.PluginInstallation) { n.Finalizers = nil },
	} {
		if !changed(mut) {
			t.Errorf("%s change ignored", name)
		}
	}
}

// A refused request deployed nothing: cancelling it needs no installer
// credential (the user may not have a working one; that is why it failed).
func TestCancelRefusedRequestNeedsNoInstaller(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-2", Finalizers: []string{v1alpha1.FinalizerPluginUninstall}},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-2", Mode: v1alpha1.ModeInstall, Enabled: true, Version: "0.1.0"}}
	if err := f.c.Create(ctx, in); err != nil {
		t.Fatal(err)
	}
	in.Status.Phase, in.Status.Message = v1alpha1.InstallError, "pre-flight refused"
	_ = f.c.Status().Update(ctx, in)
	if err := f.c.Delete(ctx, in); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "monitoring.dev-2")
	if err := f.c.Get(ctx, types.NamespacedName{Name: "monitoring.dev-2"}, &v1alpha1.PluginInstallation{}); !apierrors.IsNotFound(err) {
		t.Errorf("refused request not removed without an installer: %v", err)
	}
}

func readyProject(t *testing.T, f *envFixture, name, clusterID string) *v1alpha1.Project {
	t.Helper()
	ctx := f.ctx
	_ = f.c.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: name}})
	pr := &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: name},
		Spec: v1alpha1.ProjectSpec{Cluster: clusterID, Namespace: name, Owner: "team", Size: "S"}}
	if err := f.c.Create(ctx, pr); err != nil {
		t.Fatal(err)
	}
	pr.Status.Phase = v1alpha1.PhaseReady
	if err := f.c.Status().Update(ctx, pr); err != nil {
		t.Fatal(err)
	}
	return pr
}

// A plugin's per-Project access: a RoleBinding to Capybara's account and
// the declared ServiceAccount (no API token) in each Ready Project
// namespace of the installation's cluster only; a ServiceAccount of that
// name that is not Capybara's is never adopted; gone with the Project and
// on uninstall.
func TestProjectAccessFollowsProjects(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	root := t.TempDir()
	f.r.PluginsDir = root
	f.setInstaller(t, "dev-1", nil)
	cl := &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: "dev-1"},
		Spec: v1alpha1.ClusterSpec{Environment: v1alpha1.EnvDev, KubeconfigSecret: v1alpha1.SecretRef{Name: "dev-1-kubeconfig"}}}
	if err := f.c.Create(ctx, cl); err != nil {
		t.Fatal(err)
	}
	cl.Status.Identity = "system:serviceaccount:capybara-system:capybara"
	_ = f.c.Status().Update(ctx, cl)

	spec := writeWidgetsPlugin(t, root, "1.0.0", "one")
	spec.Permissions.Project = &v1alpha1.ProjectAccess{
		Rules:           []v1alpha1.PolicyRule{{APIGroups: []string{"example.com"}, Resources: []string{"widgets"}, Verbs: []string{"create", "update", "delete"}}},
		ServiceAccounts: []v1alpha1.ProjectServiceAccount{{Name: "pipeline"}},
		// One generated object per Project, in the plugin's namespace (as
		// Argo CD's AppProject is).
		Objects: []v1alpha1.ProjectObject{{InPluginNamespace: true, Resource: "configmaps", Template: runtime.RawExtension{Raw: []byte(
			`{"apiVersion": "v1", "kind": "ConfigMap", "metadata": {"name": "project-{{project}}"}, "data": {"ns": "{{namespace}}", "cluster": "{{cluster}}", "home": "{{pluginNamespace}}"}}`)}}},
	}
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "widgets"}, Spec: *spec}
	if err := f.c.Create(ctx, p); err != nil {
		t.Fatal(err)
	}
	p.Status.Available = true
	_ = f.c.Status().Update(ctx, p)

	readyProject(t, f, "team-a", "dev-1")
	readyProject(t, f, "team-b", "dev-1")
	readyProject(t, f, "elsewhere", "dev-2")
	// team-b already has its own "pipeline" ServiceAccount.
	if _, err := f.cs.CoreV1().ServiceAccounts("team-b").Create(ctx, &corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: "pipeline"}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}

	install := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "widgets.dev-1"},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "widgets", Cluster: "dev-1", Mode: v1alpha1.ModeInstall, Enabled: true, Version: "1.0.0"}}
	if err := f.c.Create(ctx, install); err != nil {
		t.Fatal(err)
	}
	var in v1alpha1.PluginInstallation
	deadline := time.Now().Add(30 * time.Second)
	for in = f.reconcile(t, "widgets.dev-1"); in.Status.Phase != v1alpha1.InstallReady && time.Now().Before(deadline); in = f.reconcile(t, "widgets.dev-1") {
		time.Sleep(300 * time.Millisecond)
	}
	// A same-named object someone else made for team-c is never adopted.
	readyProject(t, f, "team-c", "dev-1")
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Create(ctx, &corev1.ConfigMap{ObjectMeta: metav1.ObjectMeta{Name: "project-team-c"}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	in = f.reconcile(t, "widgets.dev-1")
	generated, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-a", metav1.GetOptions{})
	if err != nil || generated.Data["ns"] != "team-a" || generated.Data["cluster"] != "dev-1" || generated.Data["home"] != "widgets" ||
		generated.Labels[LabelProjectObject] != "team-a" {
		t.Fatalf("team-a generated object = %+v, %v", generated, err)
	}
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-b", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("team-b (no access) got a generated object")
	}
	if foreign, _ := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-c", metav1.GetOptions{}); foreign.Labels[LabelProjectObject] != "" {
		t.Error("someone else's object was adopted")
	}
	if c := meta.FindStatusCondition(in.Status.Conditions, ConditionProjectAccess); c == nil || !strings.Contains(c.Message, "ConfigMap widgets/project-team-c exists") {
		t.Errorf("ProjectAccess = %+v", c)
	}
	_ = f.cs.CoreV1().ConfigMaps("widgets").Delete(ctx, "project-team-c", metav1.DeleteOptions{})
	role := ProjectRole("widgets")
	if _, err := f.cs.RbacV1().ClusterRoles().Get(ctx, role, metav1.GetOptions{}); err != nil {
		t.Fatalf("project role: %v", err)
	}
	rb, err := f.cs.RbacV1().RoleBindings("team-a").Get(ctx, role, metav1.GetOptions{})
	if err != nil || rb.RoleRef.Name != role || rb.Subjects[0].Name != "capybara" {
		t.Fatalf("team-a binding = %+v, %v", rb, err)
	}
	sa, err := f.cs.CoreV1().ServiceAccounts("team-a").Get(ctx, "pipeline", metav1.GetOptions{})
	if err != nil || sa.AutomountServiceAccountToken == nil || *sa.AutomountServiceAccountToken {
		t.Fatalf("team-a pipeline account = %+v, %v", sa, err)
	}
	if _, err := f.cs.RbacV1().RoleBindings("team-b").Get(ctx, role, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("team-b got access although its pipeline ServiceAccount is not Capybara's")
	}
	if _, err := f.cs.RbacV1().RoleBindings("elsewhere").Get(ctx, role, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("a Project on another cluster got access")
	}
	c := meta.FindStatusCondition(in.Status.Conditions, ConditionProjectAccess)
	if c == nil || c.Status != metav1.ConditionFalse || !strings.Contains(c.Message, "team-b") {
		t.Errorf("ProjectAccess = %+v", c)
	}

	// team-a's Project goes: so does its access.
	var pa v1alpha1.Project
	_ = f.c.Get(ctx, types.NamespacedName{Name: "team-a"}, &pa)
	_ = f.c.Delete(ctx, &pa)
	f.reconcile(t, "widgets.dev-1")
	if _, err := f.cs.RbacV1().RoleBindings("team-a").Get(ctx, role, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("binding kept after the Project went")
	}
	if _, err := f.cs.CoreV1().ServiceAccounts("team-a").Get(ctx, "pipeline", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("pipeline account kept after the Project went")
	}
	if _, err := f.cs.CoreV1().ServiceAccounts("team-b").Get(ctx, "pipeline", metav1.GetOptions{}); err != nil {
		t.Error("someone else's pipeline account was removed")
	}
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-a", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("generated object kept after the Project went")
	}

	// Uninstall removes the rest.
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-c", metav1.GetOptions{}); err != nil {
		t.Fatalf("team-c generated object: %v", err)
	}
	if _, err := f.cs.RbacV1().RoleBindings("team-c").Get(ctx, role, metav1.GetOptions{}); err != nil {
		t.Fatalf("team-c binding: %v", err)
	}
	_ = f.c.Get(ctx, types.NamespacedName{Name: "widgets.dev-1"}, &in)
	_ = f.c.Delete(ctx, &in)
	f.reconcile(t, "widgets.dev-1")
	if _, err := f.cs.RbacV1().RoleBindings("team-c").Get(ctx, role, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("binding kept after uninstall")
	}
	if _, err := f.cs.RbacV1().ClusterRoles().Get(ctx, role, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("project role kept after uninstall")
	}
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "project-team-c", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("generated object kept after uninstall")
	}
}

// The installer's declared rules (not cluster-admin) are enough to create
// the per-Project access, thanks to escalate/bind on that one ClusterRole.
func TestInstallerRulesSufficeForProjectAccess(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	spec := &v1alpha1.PluginSpec{Name: "widgets", Permissions: v1alpha1.PluginPermissions{Project: &v1alpha1.ProjectAccess{
		Rules:           []v1alpha1.PolicyRule{{APIGroups: []string{"example.com"}, Resources: []string{"widgets"}, Verbs: []string{"create", "update", "delete"}}},
		ServiceAccounts: []v1alpha1.ProjectServiceAccount{{Name: "pipeline"}},
		Objects: []v1alpha1.ProjectObject{{InPluginNamespace: true, Resource: "configmaps", Template: runtime.RawExtension{Raw: []byte(
			`{"apiVersion": "v1", "kind": "ConfigMap", "metadata": {"name": "project-{{project}}"}}`)}}},
	}}}
	rules, nsRules := InstallerRules(spec, v1alpha1.ModeConnect, nil, "widgets-home")
	role := &rbacv1.ClusterRole{ObjectMeta: metav1.ObjectMeta{Name: "test-installer"}, Rules: rules}
	if _, err := f.cs.RbacV1().ClusterRoles().Create(ctx, role, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	if _, err := f.cs.RbacV1().ClusterRoleBindings().Create(ctx, &rbacv1.ClusterRoleBinding{ObjectMeta: metav1.ObjectMeta{Name: "test-installer"},
		RoleRef:  rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: "test-installer"},
		Subjects: []rbacv1.Subject{{Kind: "User", APIGroup: rbacv1.GroupName, Name: "least-installer"}}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	// Namespace rules: a Role in the plugin's namespace.
	_ = f.c.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: "widgets-home"}})
	if _, err := f.cs.RbacV1().Roles("widgets-home").Create(ctx, &rbacv1.Role{ObjectMeta: metav1.ObjectMeta{Name: "test-installer"}, Rules: nsRules}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	if _, err := f.cs.RbacV1().RoleBindings("widgets-home").Create(ctx, &rbacv1.RoleBinding{ObjectMeta: metav1.ObjectMeta{Name: "test-installer"},
		RoleRef:  rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "Role", Name: "test-installer"},
		Subjects: []rbacv1.Subject{{Kind: "User", APIGroup: rbacv1.GroupName, Name: "least-installer"}}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	u, err := f.env.AddUser(envtest.User{Name: "least-installer"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	cs := kubernetes.NewForConfigOrDie(u.Config())
	_ = f.c.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: "team-z"}})
	res, err := syncProjectAccess(ctx, cs, "widgets", "dev-1", "system:serviceaccount:capybara-system:capybara", spec.Permissions.Project, []string{"team-z"})
	if err != nil || len(res.Granted) != 1 {
		t.Fatalf("grant as the installer: %+v %v", res, err)
	}
	dyn := dynamic.NewForConfigOrDie(u.Config())
	if problems, err := syncProjectObjects(ctx, dyn, "widgets", "dev-1", "widgets-home", spec.Permissions.Project.Objects, []ProjectRef{{Name: "team-z", Namespace: "team-z"}}); err != nil || len(problems) > 0 {
		t.Fatalf("generated objects as the installer: %v %v", problems, err)
	}
	if _, err := syncProjectObjects(ctx, dyn, "widgets", "dev-1", "widgets-home", spec.Permissions.Project.Objects, nil); err != nil {
		t.Fatalf("remove generated objects as the installer: %v", err)
	}
	if _, err := syncProjectAccess(ctx, cs, "widgets", "dev-1", "", spec.Permissions.Project, nil); err != nil {
		t.Fatalf("revoke as the installer: %v", err)
	}
	// Without declared ServiceAccounts the installer gets no rights on
	// them, and needs none.
	noAccounts := &v1alpha1.ProjectAccess{Rules: spec.Permissions.Project.Rules}
	gadgets := &v1alpha1.PluginSpec{Name: "gadgets", Permissions: v1alpha1.PluginPermissions{Project: noAccounts}}
	gRules, _ := InstallerRules(gadgets, v1alpha1.ModeConnect, nil, "")
	if allows(gRules, "", "serviceaccounts", "list") {
		t.Fatal("rules for a plugin without ServiceAccounts grant listing them")
	}
	if _, err := f.cs.RbacV1().ClusterRoles().Create(ctx, &rbacv1.ClusterRole{ObjectMeta: metav1.ObjectMeta{Name: "gadgets-installer"}, Rules: gRules}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	if _, err := f.cs.RbacV1().ClusterRoleBindings().Create(ctx, &rbacv1.ClusterRoleBinding{ObjectMeta: metav1.ObjectMeta{Name: "gadgets-installer"},
		RoleRef:  rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: "gadgets-installer"},
		Subjects: []rbacv1.Subject{{Kind: "User", APIGroup: rbacv1.GroupName, Name: "gadgets-installer"}}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	gu, err := f.env.AddUser(envtest.User{Name: "gadgets-installer"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	gcs := kubernetes.NewForConfigOrDie(gu.Config())
	if _, err := syncProjectAccess(ctx, gcs, "gadgets", "dev-1", "system:serviceaccount:capybara-system:capybara", noAccounts, []string{"team-z"}); err != nil {
		t.Fatalf("grant without ServiceAccounts: %v", err)
	}
	if _, err := syncProjectAccess(ctx, gcs, "gadgets", "dev-1", "", noAccounts, nil); err != nil {
		t.Fatalf("revoke without ServiceAccounts: %v", err)
	}
	// It may not bind any other role.
	_, err = cs.RbacV1().RoleBindings("team-z").Create(ctx, &rbacv1.RoleBinding{ObjectMeta: metav1.ObjectMeta{Name: ProjectRole("widgets")},
		RoleRef:  rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: "cluster-admin"},
		Subjects: []rbacv1.Subject{{Kind: "User", APIGroup: rbacv1.GroupName, Name: "x"}}}, metav1.CreateOptions{})
	if !apierrors.IsForbidden(err) {
		t.Errorf("binding cluster-admin: %v", err)
	}
}

func TestUsableAndWorkloadReadiness(t *testing.T) {
	installed := []metav1.Condition{{Type: ConditionInstalled, Status: metav1.ConditionTrue}}
	in := func(phase v1alpha1.InstallationPhase, version string, conds []metav1.Condition, enabled bool) *v1alpha1.PluginInstallation {
		return &v1alpha1.PluginInstallation{Spec: v1alpha1.PluginInstallationSpec{Enabled: enabled},
			Status: v1alpha1.PluginInstallationStatus{Phase: phase, InstalledVersion: version, Conditions: conds}}
	}
	for name, c := range map[string]struct {
		in   *v1alpha1.PluginInstallation
		want bool
	}{
		"ready":                    {in(v1alpha1.InstallReady, "0.2.0", installed, true), true},
		"a step failing later":     {in(v1alpha1.InstallError, "0.2.0", installed, true), true},
		"refused, never installed": {in(v1alpha1.InstallError, "", nil, true), false},
		"installing":               {in(v1alpha1.InstallInstalling, "", nil, true), false},
		"disabled":                 {in(v1alpha1.InstallReady, "0.2.0", installed, false), false},
	} {
		if got := Usable(c.in); got != c.want {
			t.Errorf("%s: Usable = %v", name, got)
		}
	}

	dep := func(name string, replicas, ready int32) *appsv1.Deployment {
		return &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: "t"},
			Spec: appsv1.DeploymentSpec{Replicas: &replicas}, Status: appsv1.DeploymentStatus{ReadyReplicas: ready}}
	}
	cs := k8sfake.NewClientset(dep("scaling", 2, 1), dep("down", 1, 0), dep("zero", 0, 0))
	ctx := context.Background()
	if err := workloadReady(ctx, cs, "t", "Deployment", "scaling"); err != nil {
		t.Errorf("an autoscaler adding a replica made it not ready: %v", err)
	}
	for _, n := range []string{"down", "zero", "missing"} {
		if err := workloadReady(ctx, cs, "t", "Deployment", n); err == nil {
			t.Errorf("%s counted as ready", n)
		}
	}
}
