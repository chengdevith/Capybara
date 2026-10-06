package cluster

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	authnv1 "k8s.io/api/authentication/v1"
	"k8s.io/apimachinery/pkg/api/equality"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	"sigs.k8s.io/controller-runtime/pkg/source"

	"github.com/capybara/capybara/api/v1alpha1"
)

// HealthReconciler checks each registered cluster on an interval and
// records the result in the Cluster's status: Unreachable vs AuthFailed,
// version, node count, identity and credential expiry.
type HealthReconciler struct {
	Client   client.Client // capybara-mgmt
	Registry *Registry
	// Interval between checks of one cluster.
	Interval time.Duration
	// ExpiryWarning flags credentials expiring within this time.
	ExpiryWarning time.Duration
	// Timeout bounds one check (never longer than Interval).
	Timeout time.Duration
	Now     func() time.Time
	// Installers, when set, adds the InstallerReady condition (plugin
	// installs enabled on this cluster) and the installer's identity.
	Installers *Installers
}

// SetupWithManager registers the controller. Status writes do not trigger
// checks (generation predicate); new credentials do, through registry events.
func (h *HealthReconciler) SetupWithManager(mgr ctrl.Manager) error {
	if h.Interval == 0 {
		h.Interval = 30 * time.Second
	}
	if h.ExpiryWarning == 0 {
		h.ExpiryWarning = 7 * 24 * time.Hour
	}
	if h.Timeout == 0 || h.Timeout > h.Interval {
		h.Timeout = min(10*time.Second, h.Interval)
	}
	if h.Now == nil {
		h.Now = time.Now
	}
	changes := make(chan event.GenericEvent, 256)
	h.Registry.Subscribe(func(ev Event) {
		if ev.Kind == Added || ev.Kind == CredentialsChanged {
			changes <- event.GenericEvent{Object: &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: ev.ID}}}
		}
	})
	if h.Installers != nil {
		h.Installers.Subscribe(func(id string) {
			changes <- event.GenericEvent{Object: &v1alpha1.Cluster{ObjectMeta: metav1.ObjectMeta{Name: id}}}
		})
	}
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Cluster{}, builder.WithPredicates(predicate.GenerationChangedPredicate{})).
		WatchesRawSource(source.Channel(changes, &handler.EnqueueRequestForObject{})).
		WithOptions(controller.Options{MaxConcurrentReconciles: 4}).
		Named("cluster-health").
		Complete(h)
}

// Reconcile checks one cluster and records the result.
func (h *HealthReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var cl v1alpha1.Cluster
	if err := h.Client.Get(ctx, req.NamespacedName, &cl); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if !cl.DeletionTimestamp.IsZero() {
		return ctrl.Result{}, nil
	}
	if _, err := h.Registry.Context(cl.Name); errors.Is(err, ErrNotFound) {
		// The registry has not caught up with this Cluster yet.
		return ctrl.Result{RequeueAfter: 2 * time.Second}, nil
	}
	st := h.check(ctx, cl.Name)
	h.checkInstaller(ctx, &cl, &st)
	st.ObservedGeneration = cl.Generation
	if !equality.Semantic.DeepEqual(cl.Status, st) {
		patch := client.MergeFrom(cl.DeepCopy())
		cl.Status = st
		if err := h.Client.Status().Patch(ctx, &cl, patch); err != nil {
			return ctrl.Result{}, client.IgnoreNotFound(err)
		}
	}
	return ctrl.Result{RequeueAfter: h.Interval}, nil
}

// check runs one health check. It never blocks longer than Timeout.
func (h *HealthReconciler) check(ctx context.Context, id string) v1alpha1.ClusterStatus {
	now := metav1.NewTime(h.Now().UTC())
	st := v1alpha1.ClusterStatus{LastChecked: &now}
	prev, _ := h.Registry.Status(id)
	st.Conditions = prev.Conditions

	cs, err := h.Registry.Client(id)
	if err != nil {
		reason := v1alpha1.ReasonInvalidKubeconfig
		if errors.Is(err, ErrSecretMissing) {
			reason = v1alpha1.ReasonSecretMissing
		}
		return h.fail(st, reason, err.Error(), metav1.ConditionUnknown, metav1.ConditionUnknown)
	}
	summary, _ := h.Registry.Summary(id)
	if summary != nil && summary.ExpiresAt != nil {
		exp := metav1.NewTime(*summary.ExpiresAt)
		st.CredentialsExpireAt = &exp
	}
	h.expiry(&st, summary)

	cctx, cancel := context.WithTimeout(ctx, h.Timeout)
	defer cancel()
	identity, err := whoAmI(cctx, cs)
	if err != nil {
		if apierrors.IsUnauthorized(err) {
			reason, msg := v1alpha1.ReasonAuthFailed, "the cluster rejected Capybara's credentials"
			if st.CredentialsExpireAt != nil && st.CredentialsExpireAt.Time.Before(h.Now()) {
				reason, msg = v1alpha1.ReasonCredentialsExpired, "the credentials expired on "+st.CredentialsExpireAt.Format(time.RFC3339)
			}
			return h.fail(st, reason, msg, metav1.ConditionTrue, metav1.ConditionFalse)
		}
		return h.fail(st, v1alpha1.ReasonUnreachable, unreachableMessage(err), metav1.ConditionFalse, metav1.ConditionUnknown)
	}
	st.Identity = identity

	if v, err := cs.Discovery().ServerVersion(); err == nil {
		st.KubernetesVersion = v.GitVersion
	}
	limited := ""
	if nodes, err := cs.CoreV1().Nodes().List(cctx, metav1.ListOptions{}); err == nil {
		n := int32(len(nodes.Items)) //nolint:gosec // node counts fit
		st.NodeCount = &n
	} else if apierrors.IsForbidden(err) {
		limited = "nodes cannot be listed with these credentials"
	}

	st.Phase, st.Reason = v1alpha1.ClusterConnected, v1alpha1.ReasonConnected
	st.Message = "connected as " + identity
	if limited != "" {
		st.Reason, st.Message = v1alpha1.ReasonPermissionsLimited, st.Message+"; "+limited
	}
	h.set(&st, v1alpha1.ConditionReachable, metav1.ConditionTrue, v1alpha1.ReasonConnected, "")
	h.set(&st, v1alpha1.ConditionAuthenticated, metav1.ConditionTrue, v1alpha1.ReasonConnected, "as "+identity)
	h.set(&st, v1alpha1.ConditionReady, metav1.ConditionTrue, st.Reason, st.Message)
	return st
}

// checkInstaller records whether plugin installs are possible here. It
// only proves the installer credential authenticates; each install checks
// the permissions its plugin and mode need (pre-flight).
func (h *HealthReconciler) checkInstaller(ctx context.Context, cl *v1alpha1.Cluster, st *v1alpha1.ClusterStatus) {
	if h.Installers == nil {
		return
	}
	if cl.Spec.InstallerSecret == nil {
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionFalse, "NotConfigured", "no installer credential: plugin installs are disabled")
		return
	}
	cfg, _, err := h.Installers.Get(cl.Name)
	if err != nil {
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionFalse, "Invalid", err.Error())
		return
	}
	cfg.Timeout = h.Timeout
	cs, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionFalse, "Invalid", "installer kubeconfig cannot be used")
		return
	}
	cctx, cancel := context.WithTimeout(ctx, h.Timeout)
	defer cancel()
	identity, err := whoAmI(cctx, cs)
	switch {
	case apierrors.IsUnauthorized(err):
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionFalse, v1alpha1.ReasonAuthFailed, "the cluster rejected the installer credential")
	case err != nil:
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionFalse, v1alpha1.ReasonUnreachable, unreachableMessage(err))
	default:
		st.InstallerIdentity = identity
		h.set(st, v1alpha1.ConditionInstallerReady, metav1.ConditionTrue, "Ready", "plugin installs enabled, as "+identity)
	}
}

func (h *HealthReconciler) expiry(st *v1alpha1.ClusterStatus, s *Summary) {
	if s == nil || s.ExpiresAt == nil {
		h.set(st, v1alpha1.ConditionCredentialsExpiring, metav1.ConditionFalse, v1alpha1.ReasonNotExpiring, "the credentials do not expire")
		return
	}
	left := s.ExpiresAt.Sub(h.Now())
	switch {
	case left <= 0:
		h.set(st, v1alpha1.ConditionCredentialsExpiring, metav1.ConditionTrue, v1alpha1.ReasonCredentialsExpired, "expired on "+s.ExpiresAt.Format(time.RFC3339))
	case left < h.ExpiryWarning:
		h.set(st, v1alpha1.ConditionCredentialsExpiring, metav1.ConditionTrue, v1alpha1.ReasonExpiresSoon,
			fmt.Sprintf("expire in %s (%s); replace the kubeconfig", humanDuration(left), s.ExpiresAt.Format(time.RFC3339)))
	default:
		h.set(st, v1alpha1.ConditionCredentialsExpiring, metav1.ConditionFalse, v1alpha1.ReasonNotExpiring,
			"expire on "+s.ExpiresAt.Format(time.RFC3339))
	}
}

func (h *HealthReconciler) fail(st v1alpha1.ClusterStatus, reason, msg string, reachable, authenticated metav1.ConditionStatus) v1alpha1.ClusterStatus {
	st.Phase, st.Reason, st.Message = v1alpha1.ClusterError, reason, msg
	h.set(&st, v1alpha1.ConditionReachable, reachable, reason, "")
	h.set(&st, v1alpha1.ConditionAuthenticated, authenticated, reason, "")
	h.set(&st, v1alpha1.ConditionReady, metav1.ConditionFalse, reason, msg)
	return st
}

func (h *HealthReconciler) set(st *v1alpha1.ClusterStatus, typ string, status metav1.ConditionStatus, reason, msg string) {
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{Type: typ, Status: status, Reason: reason, Message: msg})
}

// whoAmI proves the credentials work (unlike /version, which is often
// readable anonymously) and returns the authenticated user.
func whoAmI(ctx context.Context, cs kubernetes.Interface) (string, error) {
	r, err := cs.AuthenticationV1().SelfSubjectReviews().Create(ctx, &authnv1.SelfSubjectReview{}, metav1.CreateOptions{})
	if err != nil {
		return "", err
	}
	return r.Status.UserInfo.Username, nil
}

func unreachableMessage(err error) string {
	switch {
	case errors.Is(err, context.DeadlineExceeded):
		return "the cluster did not answer in time"
	case strings.Contains(err.Error(), "connection refused"):
		return "connection refused: the cluster's API server is not running or not listening"
	case strings.Contains(err.Error(), "certificate"):
		return "TLS failed: " + err.Error()
	default:
		return "cannot reach the cluster: " + err.Error()
	}
}

func humanDuration(d time.Duration) string {
	if d >= 48*time.Hour {
		return fmt.Sprintf("%d days", int(d.Hours()/24))
	}
	return d.Round(time.Minute).String()
}
