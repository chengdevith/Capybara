package plugin

import (
	"context"
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/cluster"
)

func TestCRDScanAnswersOnlyPendingRequests(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = v1alpha1.AddToScheme(scheme)
	in := &v1alpha1.PluginInstallation{
		ObjectMeta: metav1.ObjectMeta{Name: "monitoring.dev-2", Annotations: map[string]string{v1alpha1.AnnotationCRDScanRequest: "r1"}},
		Spec:       v1alpha1.PluginInstallationSpec{Plugin: "monitoring", Cluster: "dev-2", Mode: v1alpha1.ModeConnect},
	}
	c := fake.NewClientBuilder().WithScheme(scheme).WithObjects(in, testPlugin(t)).WithStatusSubresource(&v1alpha1.PluginInstallation{}).Build()
	r := &CRDScanReconciler{Installation: &InstallationReconciler{Client: c, Installers: cluster.NewInstallers(cluster.ValidateOptions{}, quiet), PluginsDir: "../../plugins", Logger: quiet}}
	ctx := context.Background()
	key := ctrl.Request{NamespacedName: types.NamespacedName{Name: in.Name}}

	if !scanPending(in) {
		t.Fatal("request without an answer must be pending")
	}
	if _, err := r.Reconcile(ctx, key); err != nil {
		t.Fatal(err)
	}
	_ = c.Get(ctx, key.NamespacedName, in)
	if in.Status.CRDScan == nil || in.Status.CRDScan.Request != "r1" || in.Status.CRDScan.Error == "" {
		t.Fatalf("scan = %+v (connect mode has no CRDs: answered with an error)", in.Status.CRDScan)
	}
	if scanPending(in) {
		t.Error("answered request still pending")
	}
	answered := in.Status.CRDScan.ScannedAt
	if _, err := r.Reconcile(ctx, key); err != nil {
		t.Fatal(err)
	}
	_ = c.Get(ctx, key.NamespacedName, in)
	if !in.Status.CRDScan.ScannedAt.Equal(&answered) {
		t.Error("an answered request was scanned again")
	}
}
