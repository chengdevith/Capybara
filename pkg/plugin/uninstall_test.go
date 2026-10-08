package plugin

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/hex"
	"encoding/pem"
	"errors"
	"math/big"
	"net/http"
	"net/url"
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
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	dynfake "k8s.io/client-go/dynamic/fake"
	k8sfake "k8s.io/client-go/kubernetes/fake"
	k8stesting "k8s.io/client-go/testing"
	"sigs.k8s.io/controller-runtime/pkg/envtest"

	"github.com/capybara/capybara/api/v1alpha1"
)

var gadgetGVR = schema.GroupVersionResource{Group: "example.com", Version: "v1", Resource: "gadgets"}

const gadgetFinalizer = "example.com/cascade"

var gadgetBlocker = v1alpha1.UninstallBlocker{Group: "example.com", Version: "v1", Resource: "gadgets", Kind: "Gadget",
	Message: "Delete them first.", FlagFinalizer: gadgetFinalizer}

// writeGadgetsPlugin writes a plugin whose chart renders its CRD from
// templates/ (as Argo CD's does), with Helm's keep policy when keep is set,
// and declares Gadgets as uninstall blockers.
func writeGadgetsPlugin(t *testing.T, root string, keep bool) *v1alpha1.PluginSpec {
	t.Helper()
	dir := filepath.Join(root, "gadgets")
	_ = os.MkdirAll(filepath.Join(dir, "chart"), 0o755)
	policy := ""
	if keep {
		policy = "\n    helm.sh/resource-policy: keep"
	}
	crd := `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: gadgets.example.com
  annotations:
    example.com/marker: "x"` + policy + `
spec:
  group: example.com
  scope: Namespaced
  names: {plural: gadgets, singular: gadget, kind: Gadget, listKind: GadgetList}
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema: {type: object, x-kubernetes-preserve-unknown-fields: true}
`
	ch := &chart.Chart{
		Metadata: &chart.Metadata{APIVersion: "v2", Name: "gadgets", Version: "1.0.0"},
		Templates: []*chartcommon.File{
			{Name: "templates/crd.yaml", Data: []byte(crd)},
			{Name: "templates/cm.yaml", Data: []byte("apiVersion: v1\nkind: ConfigMap\nmetadata: {name: gadgets-config}\ndata: {proxy: {{ .Values.proxy | quote }}}\n")},
		},
	}
	path, err := chartutil.Save(ch, filepath.Join(dir, "chart"))
	if err != nil {
		t.Fatal(err)
	}
	archive, _ := os.ReadFile(path)
	sum := sha256.Sum256(archive)
	return &v1alpha1.PluginSpec{
		Name: "gadgets", Repository: "builtin", DisplayName: "Gadgets", Version: "1.0.0", ExtensionAPI: 1,
		Scope: "per-cluster", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall},
		Chart: &v1alpha1.ChartRef{Archive: "chart/" + filepath.Base(path), SHA256: hex.EncodeToString(sum[:]), ReleaseName: "gadgets", Namespace: "gadgets", Version: "1.0.0",
			InstallValues: &runtime.RawExtension{Raw: []byte(`{"proxy": "{{config.httpProxy}}"}`)}},
		Permissions: v1alpha1.PluginPermissions{
			Install: v1alpha1.RuleSet{ClusterRules: []v1alpha1.PolicyRule{{APIGroups: []string{"*"}, Resources: []string{"*"}, Verbs: []string{"*"}}}},
		},
		ConfigSchema:      &runtime.RawExtension{Raw: []byte(`{"type": "object", "properties": {"httpProxy": {"type": "string"}}}`)},
		UninstallBlockers: []v1alpha1.UninstallBlocker{gadgetBlocker},
		Steps:             []v1alpha1.InstallStep{{Name: "chart", Title: "Chart", Modes: []v1alpha1.InstallMode{v1alpha1.ModeInstall}, Check: v1alpha1.StepCheck{Type: "helm"}}},
	}
}

func gadget(name string, finalizers ...string) *unstructured.Unstructured {
	u := &unstructured.Unstructured{}
	u.SetAPIVersion("example.com/v1")
	u.SetKind("Gadget")
	u.SetNamespace("default")
	u.SetName(name)
	u.SetFinalizers(finalizers)
	return u
}

func TestUninstallBlockersAndKeptTemplatedCRDs(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	root := t.TempDir()
	f.r.PluginsDir = root
	f.setInstaller(t, "dev-1", nil)
	f.setInstaller(t, "dev-2", nil)
	createPlugin := func(spec *v1alpha1.PluginSpec) {
		t.Helper()
		p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "gadgets"}}
		if err := f.c.Get(ctx, types.NamespacedName{Name: "gadgets"}, p); err == nil {
			p.Spec = *spec
			if err := f.c.Update(ctx, p); err != nil {
				t.Fatal(err)
			}
		} else {
			p.Spec = *spec
			if err := f.c.Create(ctx, p); err != nil {
				t.Fatal(err)
			}
		}
		p.Status.Available = true
		_ = f.c.Status().Update(ctx, p)
	}
	installation := func(cluster string) *v1alpha1.PluginInstallation {
		return &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "gadgets." + cluster},
			Spec: v1alpha1.PluginInstallationSpec{Plugin: "gadgets", Cluster: cluster, Mode: v1alpha1.ModeInstall, Enabled: true, Version: "1.0.0",
				Config: &runtime.RawExtension{Raw: []byte(`{"httpProxy": "http://proxy.example:3128"}`)}}}
	}

	// A templated CRD without the keep policy is refused before anything is
	// applied: uninstalling would delete it, and every Gadget with it.
	createPlugin(writeGadgetsPlugin(t, root, false))
	if err := f.c.Create(ctx, installation("dev-2")); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "gadgets.dev-2")
	in := f.reconcile(t, "gadgets.dev-2")
	if !strings.Contains(in.Status.Message, "helm.sh/resource-policy: keep") {
		t.Fatalf("templated CRD without keep: %s %q", in.Status.Phase, in.Status.Message)
	}
	if _, err := f.cs.CoreV1().ConfigMaps("gadgets").Get(ctx, "gadgets-config", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Fatal("a refused chart was applied")
	}

	// With it, the chart installs; {{config.*}} reaches the values.
	createPlugin(writeGadgetsPlugin(t, root, true))
	if err := f.c.Create(ctx, installation("dev-1")); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "gadgets.dev-1")
	deadline := time.Now().Add(30 * time.Second)
	for in = f.reconcile(t, "gadgets.dev-1"); in.Status.Phase != v1alpha1.InstallReady && time.Now().Before(deadline); in = f.reconcile(t, "gadgets.dev-1") {
		time.Sleep(300 * time.Millisecond)
	}
	if in.Status.Phase != v1alpha1.InstallReady {
		t.Fatalf("install: %s %q", in.Status.Phase, in.Status.Message)
	}
	if cm, err := f.cs.CoreV1().ConfigMaps("gadgets").Get(ctx, "gadgets-config", metav1.GetOptions{}); err != nil || cm.Data["proxy"] != "http://proxy.example:3128" {
		t.Errorf("config value = %v, %v", cm.Data, err)
	}

	// A Gadget (with the cascade finalizer) blocks the uninstall.
	dyn := dynamic.NewForConfigOrDie(f.env.Config)
	deadline = time.Now().Add(10 * time.Second)
	var err error
	for _, err = dyn.Resource(gadgetGVR).Namespace("default").Create(ctx, gadget("g1", gadgetFinalizer), metav1.CreateOptions{}); err != nil && time.Now().Before(deadline); _, err = dyn.Resource(gadgetGVR).Namespace("default").Create(ctx, gadget("g1", gadgetFinalizer), metav1.CreateOptions{}) {
		time.Sleep(200 * time.Millisecond) // the CRD becomes served
	}
	if err != nil {
		t.Fatal(err)
	}
	if err := f.c.Delete(ctx, &in); err != nil {
		t.Fatal(err)
	}
	in = f.reconcile(t, "gadgets.dev-1")
	if in.Status.Phase != v1alpha1.InstallUninstalling || !strings.Contains(in.Status.Message, "Gadget default/g1 (deletes its resources when deleted)") ||
		!strings.Contains(in.Status.Message, "Delete them first.") {
		t.Fatalf("uninstall with a Gadget: %s %q", in.Status.Phase, in.Status.Message)
	}
	if _, err := f.cs.CoreV1().ConfigMaps("gadgets").Get(ctx, "gadgets-config", metav1.GetOptions{}); err != nil {
		t.Fatalf("blocked uninstall removed the release: %v", err)
	}

	// Once the Gadgets are gone, the uninstall runs and the CRD stays.
	_, _ = dyn.Resource(gadgetGVR).Namespace("default").Patch(ctx, "g1", types.MergePatchType, []byte(`{"metadata":{"finalizers":null}}`), metav1.PatchOptions{})
	_ = dyn.Resource(gadgetGVR).Namespace("default").Delete(ctx, "g1", metav1.DeleteOptions{})
	f.reconcile(t, "gadgets.dev-1")
	if err := f.c.Get(ctx, types.NamespacedName{Name: "gadgets.dev-1"}, &in); !apierrors.IsNotFound(err) {
		t.Fatalf("uninstall did not finish: %q", in.Status.Message)
	}
	if _, err := f.cs.CoreV1().ConfigMaps("gadgets").Get(ctx, "gadgets-config", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("release objects kept after uninstall")
	}
	var crd apiextensionsv1.CustomResourceDefinition
	if err := f.c.Get(ctx, types.NamespacedName{Name: "gadgets.example.com"}, &crd); err != nil || crd.DeletionTimestamp != nil {
		t.Errorf("templated CRD with keep removed by uninstall: %v", err)
	}
}

func TestAPIRefusesUninstallWhileBlockersExist(t *testing.T) {
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "gadgets"}, Spec: *writeGadgetsPlugin(t, t.TempDir(), true), Status: v1alpha1.PluginStatus{Available: true}}
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "gadgets.dev-1", UID: "u1"},
		Spec:   v1alpha1.PluginInstallationSpec{Plugin: "gadgets", Cluster: "dev-1", Mode: v1alpha1.ModeInstall, Enabled: true, Version: "1.0.0"},
		Status: v1alpha1.PluginInstallationStatus{Phase: v1alpha1.InstallReady, InstalledVersion: "1.0.0"}}
	f := newAPI(t, p, in)
	dyn := dynfake.NewSimpleDynamicClientWithCustomListKinds(runtime.NewScheme(), map[schema.GroupVersionResource]string{gadgetGVR: "GadgetList"},
		gadget("g1", gadgetFinalizer), gadget("g2"))
	// Discovery serves gadgets.
	cs := k8sfake.NewClientset()
	cs.Resources = []*metav1.APIResourceList{{GroupVersion: "example.com/v1", APIResources: []metav1.APIResource{{Name: "gadgets", Kind: "Gadget", Namespaced: true}}}}
	f.api.Dynamic = fakeObjectClusters{dyn: dyn, cs: cs}
	q := url.Values{"confirm": {"gadgets.dev-1"}, "uid": {"u1"}}
	code, body := f.do(t, http.MethodDelete, "/api/plugins/installations/gadgets.dev-1?"+q.Encode(), nil)
	blockers, _ := body["blockers"].([]any)
	if code != http.StatusConflict || len(blockers) != 2 || blockers[0] != "Gadget default/g1 (deletes its resources when deleted)" || blockers[1] != "Gadget default/g2" {
		t.Fatalf("uninstall with Gadgets: %d %v", code, body)
	}
	if got := strings.Join(f.actions(t), " "); got != "uninstall=failure" {
		t.Errorf("audit = %s", got)
	}

	// The kind not served on the cluster (e.g. the tool never got there):
	// nothing can block, although listing it is refused as forbidden.
	served := cs.Resources
	cs.Resources = nil
	dyn.PrependReactor("list", "gadgets", func(k8stesting.Action) (bool, runtime.Object, error) {
		return true, nil, apierrors.NewForbidden(schema.GroupResource{Group: "example.com", Resource: "gadgets"}, "", errors.New("no access"))
	})
	found, err := UninstallBlockers(context.Background(), dyn, cs, p.Spec.UninstallBlockers)
	if err != nil || len(found) != 0 {
		t.Fatalf("unserved kind: %v %v", found, err)
	}
	// Served but forbidden: an error, not "nothing blocks".
	cs.Resources = served
	if _, err := UninstallBlockers(context.Background(), dyn, cs, p.Spec.UninstallBlockers); !apierrors.IsForbidden(errors.Unwrap(err)) {
		t.Errorf("served but forbidden: %v", err)
	}
	dyn.ReactionChain = dyn.ReactionChain[1:]

	// None left: accepted.
	_ = dyn.Resource(gadgetGVR).Namespace("default").Delete(context.Background(), "g1", metav1.DeleteOptions{})
	_ = dyn.Resource(gadgetGVR).Namespace("default").Delete(context.Background(), "g2", metav1.DeleteOptions{})
	if code, body := f.do(t, http.MethodDelete, "/api/plugins/installations/gadgets.dev-1?"+q.Encode(), nil); code != http.StatusOK {
		t.Fatalf("uninstall without Gadgets: %d %v", code, body)
	}
}

// A patch's null (merge patch: remove the field, e.g. turning auto-sync
// off) survives storage in the Plugin CRD.
func TestActionPatchKeepsNull(t *testing.T) {
	f := newEnv(t)
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "nulls"}, Spec: v1alpha1.PluginSpec{Name: "nulls", DisplayName: "Nulls", Version: "1.0.0",
		ExtensionAPI: 1, Scope: "per-cluster", Modes: []v1alpha1.InstallMode{v1alpha1.ModeConnect},
		Actions: []v1alpha1.PluginAction{{Name: "off", Title: "Off", Group: "argoproj.io", Version: "v1alpha1", Resource: "applications", Kind: "Application",
			Type: v1alpha1.ActionPatch, Patch: &runtime.RawExtension{Raw: []byte(`{"spec":{"syncPolicy":{"automated":null}}}`)}}}}}
	if err := f.c.Create(f.ctx, p); err != nil {
		t.Fatal(err)
	}
	var got v1alpha1.Plugin
	if err := f.c.Get(f.ctx, types.NamespacedName{Name: "nulls"}, &got); err != nil {
		t.Fatal(err)
	}
	if raw := string(got.Spec.Actions[0].Patch.Raw); raw != `{"spec":{"syncPolicy":{"automated":null}}}` {
		t.Errorf("stored patch = %s", raw)
	}
}

// otherCA is a certificate authority no test cluster uses.
func otherCA(t *testing.T) []byte {
	t.Helper()
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	tpl := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: "other-ca"}, NotBefore: time.Now(), NotAfter: time.Now().Add(time.Hour),
		IsCA: true, BasicConstraintsValid: true, KeyUsage: x509.KeyUsageCertSign}
	der, err := x509.CreateCertificate(rand.Reader, tpl, tpl, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	return pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der})
}

// An installer credential stored for one cluster that reaches another (its
// certificate authority is not this cluster's) is refused like a failed
// pre-flight, with the command that fixes it; nothing is applied, and an
// uninstall says why it cannot proceed instead of acting on that cluster.
func TestInstallerForAnotherClusterIsRefused(t *testing.T) {
	f := newEnv(t)
	ctx := f.ctx
	root := t.TempDir()
	f.r.PluginsDir = root
	spec := writeWidgetsPlugin(t, root, "1.0.0", "one")
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: "widgets"}, Spec: *spec}
	if err := f.c.Create(ctx, p); err != nil {
		t.Fatal(err)
	}
	p.Status.Available = true
	_ = f.c.Status().Update(ctx, p)

	u, err := f.env.AddUser(envtest.User{Name: "installer-admin", Groups: []string{"system:masters"}}, nil)
	if err != nil {
		t.Fatal(err)
	}
	rc := u.Config()
	rc.CAData = otherCA(t)
	f.installers.Set("dev-2", &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{ResourceVersion: "other"},
		Type:       v1alpha1.InstallerSecretType,
		Data:       map[string][]byte{v1alpha1.KubeconfigKey: kubeconfigBytes(t, rc)},
	})
	in := &v1alpha1.PluginInstallation{ObjectMeta: metav1.ObjectMeta{Name: "widgets.dev-2"},
		Spec: v1alpha1.PluginInstallationSpec{Plugin: "widgets", Cluster: "dev-2", Mode: v1alpha1.ModeInstall, Enabled: true, Version: "1.0.0"}}
	if err := f.c.Create(ctx, in); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-2")
	got := f.reconcile(t, "widgets.dev-2")
	c := meta.FindStatusCondition(got.Status.Conditions, ConditionPreflight)
	if got.Status.Phase != v1alpha1.InstallError || c == nil || c.Status != metav1.ConditionFalse ||
		!strings.Contains(got.Status.Message, "pre-flight refused: the installer credential stored for dev-2 is for a different cluster") ||
		!strings.HasSuffix(got.Status.Message, "hack/capybara-sa.sh dev-2 --installer widgets") {
		t.Fatalf("status: %s %q %+v", got.Status.Phase, got.Status.Message, c)
	}
	if got.Status.InstalledVersion != "" {
		t.Error("marked installed")
	}
	if _, err := f.cs.CoreV1().ConfigMaps("widgets").Get(ctx, "widgets-config", metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Error("the chart was applied")
	}
	// Uninstall: removing the request needs no credential (nothing was
	// installed), so it goes.
	if err := f.c.Delete(ctx, &got); err != nil {
		t.Fatal(err)
	}
	f.reconcile(t, "widgets.dev-2")
	if err := f.c.Get(ctx, types.NamespacedName{Name: "widgets.dev-2"}, &got); !apierrors.IsNotFound(err) {
		t.Errorf("refused request not removed: %q", got.Status.Message)
	}
}
