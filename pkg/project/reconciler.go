package project

import (
	"context"
	"errors"
	"fmt"
	"path"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/equality"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/source"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
)

// FieldManager is the server-side apply manager for everything the
// controller manages. User edits in the console use "capybara" instead,
// so the two never silently overwrite each other.
const FieldManager = "capybara-controller"

// RemoteClients gives the controller a client per managed cluster.
type RemoteClients interface {
	Client(id string) (kubernetes.Interface, error)
}

// Reconciler makes a Project's resources exist in its cluster, and removes
// them (only if they are this Project's) before the Project goes away.
type Reconciler struct {
	Client    client.Client // capybara-mgmt
	Clusters  RemoteClients
	Config    *Config
	Protected []string
	Auditor   *audit.Auditor
	// Timeout bounds the calls to a managed cluster in one reconcile.
	Timeout time.Duration
	// Resync re-applies a Ready Project this often, as a safety net for
	// drift the remote watches might miss.
	Resync time.Duration
	// Retry is used for conditions that only change outside our view
	// (a conflicting namespace, an unknown cluster).
	Retry time.Duration
	// Workers is how many Projects are reconciled in parallel.
	Workers int
}

// SetupWithManager registers the controller. remote delivers events from
// the managed clusters (see RemoteWatcher) for drift correction.
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager, remote <-chan event.GenericEvent) error {
	if r.Timeout == 0 {
		r.Timeout = 10 * time.Second
	}
	if r.Resync == 0 {
		r.Resync = 10 * time.Minute
	}
	if r.Retry == 0 {
		r.Retry = time.Minute
	}
	if r.Workers == 0 {
		r.Workers = 4
	}
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Project{}).
		WatchesRawSource(source.Channel(remote, &handler.EnqueueRequestForObject{})).
		WithOptions(controller.Options{MaxConcurrentReconciles: r.Workers}).
		Named("project").
		Complete(r)
}

// Reconcile implements reconcile.Reconciler.
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var p v1alpha1.Project
	if err := r.Client.Get(ctx, req.NamespacedName, &p); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if !p.DeletionTimestamp.IsZero() {
		return r.finalize(ctx, &p)
	}
	if !controllerutil.ContainsFinalizer(&p, v1alpha1.FinalizerRemoteCleanup) {
		// Before anything exists remotely, so nothing can be left behind.
		patch := client.MergeFrom(p.DeepCopy())
		controllerutil.AddFinalizer(&p, v1alpha1.FinalizerRemoteCleanup)
		if err := r.Client.Patch(ctx, &p, patch); err != nil {
			return ctrl.Result{}, err
		}
	}

	status := p.Status.DeepCopy()
	status.ObservedGeneration = p.Generation
	result, err := r.ensure(ctx, &p, status)
	if uerr := r.updateStatus(ctx, &p, status); uerr != nil && err == nil {
		err = uerr
	}
	return result, err
}

// ensure applies the Project's resources and fills status.
func (r *Reconciler) ensure(ctx context.Context, p *v1alpha1.Project, st *v1alpha1.ProjectStatus) (ctrl.Result, error) {
	if IsProtected(p.Spec.Namespace, r.Protected) {
		fail(st, v1alpha1.ReasonProtectedNamespace, fmt.Sprintf("namespace %q is protected and cannot belong to a Project", p.Spec.Namespace))
		return ctrl.Result{}, nil // namespace is immutable: nothing will change
	}
	size, ok := r.Config.Sizes[p.Spec.Size]
	if !ok {
		fail(st, v1alpha1.ReasonUnknownSize, fmt.Sprintf("size %q is not configured", p.Spec.Size))
		return ctrl.Result{RequeueAfter: r.Retry}, nil
	}
	cs, err := r.Clusters.Client(p.Spec.Cluster)
	if errors.Is(err, cluster.ErrNotFound) {
		fail(st, v1alpha1.ReasonUnknownCluster, fmt.Sprintf("cluster %q is not registered", p.Spec.Cluster))
		return ctrl.Result{RequeueAfter: r.Retry}, nil
	}
	if err != nil {
		return r.unreachable(st, err)
	}

	rctx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()
	ns, err := getNamespace(rctx, cs, p.Spec.Namespace)
	if err != nil {
		return r.classify(st, err)
	}
	reachable(st)

	switch NamespaceOwnership(ns, p) {
	case Foreign:
		fail(st, v1alpha1.ReasonNamespaceConflict, fmt.Sprintf(
			"namespace %q already exists in %s and does not belong to this Project; it is never adopted", p.Spec.Namespace, p.Spec.Cluster))
		return ctrl.Result{RequeueAfter: r.Retry}, nil
	case Stale:
		fail(st, v1alpha1.ReasonStaleOwner, fmt.Sprintf(
			"namespace %q carries this Project's name but was created for a different Project (uid mismatch); it is never adopted", p.Spec.Namespace))
		return ctrl.Result{RequeueAfter: r.Retry}, nil
	}

	d := Build(p, size, r.Config.IngressSources)
	if err := apply(rctx, cs, d, ns == nil); err != nil {
		if apierrors.IsAlreadyExists(err) {
			// Created by someone else between our check and our create.
			fail(st, v1alpha1.ReasonNamespaceConflict, fmt.Sprintf("namespace %q appeared in %s while the Project was being created", p.Spec.Namespace, p.Spec.Cluster))
			return ctrl.Result{RequeueAfter: r.Retry}, nil
		}
		return r.classify(st, err)
	}

	st.Phase = v1alpha1.PhaseReady
	st.Resources = Resources(p)
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{
		Type: v1alpha1.ConditionReady, Status: metav1.ConditionTrue, Reason: v1alpha1.ReasonReconciled,
		Message:            fmt.Sprintf("namespace %s and its resources are in place in %s", p.Spec.Namespace, p.Spec.Cluster),
		ObservedGeneration: p.Generation,
	})
	return ctrl.Result{RequeueAfter: r.Resync}, nil
}

// apply writes every resource with server-side apply, forcing ownership of
// the fields the controller manages (drift is restored, other fields kept).
// A missing namespace is created, not applied, so an existing one is never
// adopted even if it appears in the meantime.
func apply(ctx context.Context, cs kubernetes.Interface, d Desired, createNamespace bool) error {
	opts := metav1.ApplyOptions{FieldManager: FieldManager, Force: true}
	if createNamespace {
		ns := &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{
			Name: *d.Namespace.Name, Labels: d.Namespace.Labels, Annotations: d.Namespace.Annotations,
		}}
		if _, err := cs.CoreV1().Namespaces().Create(ctx, ns, metav1.CreateOptions{FieldManager: FieldManager}); err != nil {
			return err
		}
	}
	if _, err := cs.CoreV1().Namespaces().Apply(ctx, d.Namespace, opts); err != nil {
		return fmt.Errorf("namespace: %w", err)
	}
	ns := *d.Namespace.Name
	if _, err := cs.CoreV1().ResourceQuotas(ns).Apply(ctx, d.Quota, opts); err != nil {
		return fmt.Errorf("resource quota: %w", err)
	}
	if _, err := cs.CoreV1().LimitRanges(ns).Apply(ctx, d.LimitRange, opts); err != nil {
		return fmt.Errorf("limit range: %w", err)
	}
	for _, np := range d.NetworkPolicys {
		if _, err := cs.NetworkingV1().NetworkPolicies(ns).Apply(ctx, np, opts); err != nil {
			return fmt.Errorf("network policy %s: %w", *np.Name, err)
		}
	}
	if _, err := cs.RbacV1().RoleBindings(ns).Apply(ctx, d.OwnerBinding, opts); err != nil {
		return fmt.Errorf("role binding: %w", err)
	}
	return nil
}

// finalize removes the remote namespace, but only if it is this Project's
// (label AND uid), then lets the Project go. The namespace deletion is
// audited (fail-closed) and linked to the user's delete request.
func (r *Reconciler) finalize(ctx context.Context, p *v1alpha1.Project) (ctrl.Result, error) {
	if !controllerutil.ContainsFinalizer(p, v1alpha1.FinalizerRemoteCleanup) {
		return ctrl.Result{}, nil
	}
	st := p.Status.DeepCopy()
	st.Phase = v1alpha1.PhaseTerminating
	result, err := r.cleanup(ctx, p, st)
	if errors.Is(err, errCleanupDone) {
		patch := client.MergeFrom(p.DeepCopy())
		controllerutil.RemoveFinalizer(p, v1alpha1.FinalizerRemoteCleanup)
		return ctrl.Result{}, client.IgnoreNotFound(r.Client.Patch(ctx, p, patch))
	}
	if uerr := r.updateStatus(ctx, p, st); uerr != nil && err == nil {
		err = uerr
	}
	return result, err
}

var errCleanupDone = errors.New("cleanup done")

func (r *Reconciler) cleanup(ctx context.Context, p *v1alpha1.Project, st *v1alpha1.ProjectStatus) (ctrl.Result, error) {
	terminating := func(msg string) {
		meta.SetStatusCondition(&st.Conditions, metav1.Condition{
			Type: v1alpha1.ConditionReady, Status: metav1.ConditionFalse, Reason: v1alpha1.ReasonTerminating,
			Message: msg, ObservedGeneration: p.Generation,
		})
	}
	cs, err := r.Clusters.Client(p.Spec.Cluster)
	if errors.Is(err, cluster.ErrNotFound) {
		terminating(fmt.Sprintf("cluster %q is not registered; waiting to remove namespace %s", p.Spec.Cluster, p.Spec.Namespace))
		return ctrl.Result{RequeueAfter: r.Retry}, nil
	}
	if err != nil {
		return r.unreachable(st, err)
	}
	rctx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()
	ns, err := getNamespace(rctx, cs, p.Spec.Namespace)
	if err != nil {
		return r.classify(st, err)
	}
	reachable(st)

	actx := auth.WithUser(ctx, auth.User{Name: deletedBy(p)})
	op := audit.Op{
		Cluster: p.Spec.Cluster, Kind: "Namespace", Name: p.Spec.Namespace,
		Ref: p.Annotations[v1alpha1.AnnotationDeleteAuditID],
	}

	ownership := NamespaceOwnership(ns, p)
	if ownership == Owned && IsProtected(p.Spec.Namespace, r.Protected) {
		// Defense in depth: a protected namespace is never deleted, even
		// if someone put this Project's label and uid on it.
		ownership = Foreign
	}
	switch ownership {
	case Absent:
		if p.Annotations[v1alpha1.AnnotationDeleteAuditID] != "" {
			op.Action = "namespace-removed"
			if err := r.Auditor.Event(actx, op, audit.ResultSuccess,
				fmt.Sprintf("namespace %s is gone from %s; Project %s removed", p.Spec.Namespace, p.Spec.Cluster, p.Name)); err != nil {
				return ctrl.Result{}, err // record first, then let go
			}
		}
		return ctrl.Result{}, errCleanupDone
	case Foreign, Stale:
		// Never delete what is not provably ours; let the Project go.
		op.Action = "delete-namespace"
		why := "it does not belong to this Project"
		if IsProtected(p.Spec.Namespace, r.Protected) {
			why = "it is a protected namespace"
		} else if ownership == Stale {
			why = "it was created for a different Project with the same name"
		}
		if err := r.Auditor.Event(actx, op, audit.ResultDenied,
			fmt.Sprintf("namespace %s in %s kept: %s", p.Spec.Namespace, p.Spec.Cluster, why)); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, errCleanupDone
	}

	// Owned.
	if ns.DeletionTimestamp == nil {
		op.Action = "delete-namespace"
		err := r.Auditor.Do(actx, op, func(ctx context.Context) (string, error) {
			uid := ns.UID
			if err := cs.CoreV1().Namespaces().Delete(ctx, ns.Name, metav1.DeleteOptions{
				Preconditions: &metav1.Preconditions{UID: &uid},
			}); err != nil {
				return "", err
			}
			return fmt.Sprintf("namespace %s deleted in %s by %s for Project %s", ns.Name, p.Spec.Cluster, FieldManager, p.Name), nil
		})
		if err != nil {
			terminating(fmt.Sprintf("could not delete namespace %s: %v", ns.Name, err))
			return ctrl.Result{}, err
		}
	}
	terminating(fmt.Sprintf("waiting for namespace %s to be removed from %s", ns.Name, p.Spec.Cluster))
	return ctrl.Result{RequeueAfter: 2 * time.Second}, nil
}

func deletedBy(p *v1alpha1.Project) string {
	if u := p.Annotations[v1alpha1.AnnotationDeletedBy]; u != "" {
		return u
	}
	return "unknown"
}

func getNamespace(ctx context.Context, cs kubernetes.Interface, name string) (*corev1.Namespace, error) {
	ns, err := cs.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
	if apierrors.IsNotFound(err) {
		return nil, nil
	}
	return ns, err
}

// classify tells "the cluster answered no" from "we could not reach it".
func (r *Reconciler) classify(st *v1alpha1.ProjectStatus, err error) (ctrl.Result, error) {
	var status apierrors.APIStatus
	if errors.As(err, &status) && !apierrors.IsServiceUnavailable(err) && !apierrors.IsTimeout(err) && !apierrors.IsServerTimeout(err) {
		reachable(st)
		fail(st, v1alpha1.ReasonApplyFailed, err.Error())
		return ctrl.Result{}, err // retried with backoff
	}
	return r.unreachable(st, err)
}

// unreachable records the condition and returns the error, so the
// workqueue retries this Project with exponential backoff while other
// Projects keep going.
func (r *Reconciler) unreachable(st *v1alpha1.ProjectStatus, err error) (ctrl.Result, error) {
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{
		Type: v1alpha1.ConditionClusterReachable, Status: metav1.ConditionFalse,
		Reason: v1alpha1.ReasonClusterUnreachable, Message: err.Error(), ObservedGeneration: st.ObservedGeneration,
	})
	if st.Phase != v1alpha1.PhaseTerminating {
		fail(st, v1alpha1.ReasonClusterUnreachable, "the cluster cannot be reached; retrying")
	}
	return ctrl.Result{}, err
}

func reachable(st *v1alpha1.ProjectStatus) {
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{
		Type: v1alpha1.ConditionClusterReachable, Status: metav1.ConditionTrue,
		Reason: v1alpha1.ReasonReachable, ObservedGeneration: st.ObservedGeneration,
	})
}

func fail(st *v1alpha1.ProjectStatus, reason, msg string) {
	if st.Phase != v1alpha1.PhaseTerminating {
		st.Phase = v1alpha1.PhaseError
	}
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{
		Type: v1alpha1.ConditionReady, Status: metav1.ConditionFalse, Reason: reason, Message: msg,
		ObservedGeneration: st.ObservedGeneration,
	})
}

// updateStatus writes status only when it changed (no self-triggered loops).
func (r *Reconciler) updateStatus(ctx context.Context, p *v1alpha1.Project, st *v1alpha1.ProjectStatus) error {
	if equality.Semantic.DeepEqual(&p.Status, st) {
		return nil
	}
	patch := client.MergeFrom(p.DeepCopy())
	p.Status = *st
	if err := r.Client.Status().Patch(ctx, p, patch); err != nil && !apierrors.IsNotFound(err) {
		log.FromContext(ctx).Error(err, "status update failed")
		return err
	}
	return nil
}

// IsProtected reports whether namespace matches one of the patterns.
func IsProtected(namespace string, patterns []string) bool {
	for _, pat := range patterns {
		if ok, _ := path.Match(pat, namespace); ok {
			return true
		}
	}
	return false
}
