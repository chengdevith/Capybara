package plugin

import (
	"context"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/predicate"

	"github.com/capybara/capybara/api/v1alpha1"
)

// CRDScanReconciler answers CRD scan requests (uninstall with CRD cleanup)
// in its own controller, so an answer never waits behind a long install or
// upgrade of the same installation. It only writes status.crdScan.
type CRDScanReconciler struct {
	Installation *InstallationReconciler
}

// scanPending is true when the request annotation has no answer yet.
func scanPending(o client.Object) bool {
	in, ok := o.(*v1alpha1.PluginInstallation)
	if !ok {
		return false
	}
	req := in.Annotations[v1alpha1.AnnotationCRDScanRequest]
	return req != "" && (in.Status.CRDScan == nil || in.Status.CRDScan.Request != req)
}

// SetupWithManager registers the controller.
func (r *CRDScanReconciler) SetupWithManager(mgr ctrl.Manager) error {
	pending := predicate.Funcs{
		CreateFunc:  func(e event.CreateEvent) bool { return scanPending(e.Object) },
		UpdateFunc:  func(e event.UpdateEvent) bool { return scanPending(e.ObjectNew) },
		DeleteFunc:  func(event.DeleteEvent) bool { return false },
		GenericFunc: func(e event.GenericEvent) bool { return scanPending(e.Object) },
	}
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.PluginInstallation{}, builder.WithPredicates(pending)).
		Named("plugin-crd-scan").
		Complete(r)
}

// Reconcile scans and records the answer.
func (r *CRDScanReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	ir := r.Installation
	var in v1alpha1.PluginInstallation
	if err := ir.Client.Get(ctx, req.NamespacedName, &in); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if !scanPending(&in) {
		return ctrl.Result{}, nil
	}
	var p v1alpha1.Plugin
	pluginErr := ir.Client.Get(ctx, types.NamespacedName{Name: in.Spec.Plugin}, &p)
	if pluginErr != nil && !apierrors.IsNotFound(pluginErr) {
		return ctrl.Result{}, pluginErr
	}
	now := time.Now
	if ir.Now != nil {
		now = ir.Now
	}
	scan := &v1alpha1.CRDScan{Request: in.Annotations[v1alpha1.AnnotationCRDScanRequest], ScannedAt: metav1.NewTime(now())}
	crds, foreign, err := ir.scanCRDs(ctx, &in, &p, pluginErr)
	if err != nil {
		scan.Error = err.Error()
	}
	scan.CRDs, scan.Foreign, scan.Hash = crds, foreign, HashList(foreign)
	patch := client.MergeFrom(in.DeepCopy())
	in.Status.CRDScan = scan
	if err := ir.Client.Status().Patch(ctx, &in, patch); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if ir.Logger != nil {
		ir.Logger.Info("crd scan answered", "installation", in.Name, "crds", len(crds), "foreign", len(foreign),
			"took", time.Since(scan.ScannedAt.Time).Round(time.Millisecond), "err", scan.Error)
	}
	return ctrl.Result{}, nil
}
