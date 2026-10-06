package plugin

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"path/filepath"
	"slices"
	"strings"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/equality"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
)

// Condition types on a PluginInstallation.
const (
	ConditionPreflight = "PreflightPassed"
	ConditionApplied   = "Applied"
	// ConditionInstalled: every step passed once for the applied version;
	// failing steps afterwards mean the installation is degraded (Error),
	// not still installing.
	ConditionInstalled = "Installed"
)

// TokenSecretName is the mgmt Secret holding a plugin's token for a cluster.
func TokenSecretName(plugin, clusterID string) string {
	return "plugin-" + plugin + "-" + clusterID + "-token"
}

// Token Secret keys.
const (
	TokenKey     = "token"
	ExpiresKey   = "expiresAt"
	ServicesKey  = "services"
	NamespaceKey = "namespace"
)

// Clusters is what the installer needs from the cluster registry.
type Clusters interface {
	Client(id string) (kubernetes.Interface, error)
	RESTConfig(id string) (*rest.Config, error)
}

// InstallationReconciler installs, connects, checks and uninstalls plugins.
type InstallationReconciler struct {
	Client client.Client // capybara-mgmt
	// Reader reads Secrets the manager's cache does not hold (plugin
	// tokens): the cache only has kubeconfig Secrets.
	Reader     client.Reader
	Clusters   Clusters
	Installers *cluster.Installers
	PluginsDir string
	Auditor    *audit.Auditor
	Logger     *slog.Logger

	HelmTimeout time.Duration // default 5m
	TokenTTL    time.Duration // default 24h
	Recheck     time.Duration // default 1m once Ready
	Now         func() time.Time
}

// SetupWithManager registers the controller; installer credential changes
// requeue that cluster's installations.
func (r *InstallationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	if r.HelmTimeout == 0 {
		r.HelmTimeout = 5 * time.Minute
	}
	if r.TokenTTL == 0 {
		r.TokenTTL = 24 * time.Hour
	}
	if r.Recheck == 0 {
		r.Recheck = time.Minute
	}
	if r.Now == nil {
		r.Now = time.Now
	}
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.PluginInstallation{}).
		Watches(&v1alpha1.Plugin{}, handler.EnqueueRequestsFromMapFunc(r.forPlugin)).
		WithOptions(controller.Options{MaxConcurrentReconciles: 2}).
		Named("plugin-installation").
		Complete(r)
}

func (r *InstallationReconciler) forPlugin(ctx context.Context, o client.Object) []reconcile.Request {
	var list v1alpha1.PluginInstallationList
	if err := r.Client.List(ctx, &list); err != nil {
		return nil
	}
	var out []reconcile.Request
	for _, in := range list.Items {
		if in.Spec.Plugin == o.GetName() {
			out = append(out, reconcile.Request{NamespacedName: types.NamespacedName{Name: in.Name}})
		}
	}
	return out
}

// AppliedHash identifies what an apply deploys.
func AppliedHash(in *v1alpha1.PluginInstallation) string {
	cfg := []byte("{}")
	if in.Spec.Config != nil && len(in.Spec.Config.Raw) > 0 {
		cfg = in.Spec.Config.Raw
	}
	sum := sha256.Sum256([]byte(in.Spec.Version + "\x00" + string(in.Spec.Mode) + "\x00" + string(cfg)))
	return hex.EncodeToString(sum[:8])
}

// ConfigOf decodes an installation's config.
func ConfigOf(in *v1alpha1.PluginInstallation) map[string]any {
	out := map[string]any{}
	if in.Spec.Config != nil && len(in.Spec.Config.Raw) > 0 {
		_ = json.Unmarshal(in.Spec.Config.Raw, &out)
	}
	return out
}

// userCtx runs controller work as the user who asked for it, linked to
// their audit entry.
func userCtx(ctx context.Context, in *v1alpha1.PluginInstallation) (context.Context, string) {
	user := in.Annotations[v1alpha1.AnnotationRequestedBy]
	if user == "" {
		user = "capybara-controller"
	}
	return auth.WithUser(ctx, auth.User{Name: user}), in.Annotations[v1alpha1.AnnotationRequestAuditID]
}

// Reconcile drives one installation.
func (r *InstallationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var in v1alpha1.PluginInstallation
	if err := r.Client.Get(ctx, req.NamespacedName, &in); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	var p v1alpha1.Plugin
	pluginErr := r.Client.Get(ctx, types.NamespacedName{Name: in.Spec.Plugin}, &p)
	if pluginErr != nil && !apierrors.IsNotFound(pluginErr) {
		return ctrl.Result{}, pluginErr
	}

	if !in.DeletionTimestamp.IsZero() {
		return r.uninstall(ctx, &in, &p, pluginErr)
	}
	if controllerutil.AddFinalizer(&in, v1alpha1.FinalizerPluginUninstall) {
		if err := r.Client.Update(ctx, &in); err != nil {
			return ctrl.Result{}, err
		}
	}
	st := in.Status.DeepCopy()
	st.ObservedGeneration = in.Generation
	if res, err := r.handleCRDScan(ctx, &in, &p, pluginErr, st); err != nil || res != nil {
		return r.finish(ctx, &in, st, res, err)
	}

	fail := func(msg string) (ctrl.Result, error) {
		st.Phase, st.Message = v1alpha1.InstallError, msg
		return r.finish(ctx, &in, st, &ctrl.Result{RequeueAfter: r.Recheck}, nil)
	}
	switch {
	case apierrors.IsNotFound(pluginErr):
		return fail(fmt.Sprintf("plugin %q is not in the catalog", in.Spec.Plugin))
	case p.Spec.ExtensionAPI != ExtensionAPIVersion:
		return fail(fmt.Sprintf("plugin %s needs extension API %d; this Capybara provides %d", p.Name, p.Spec.ExtensionAPI, ExtensionAPIVersion))
	case in.Spec.Version != p.Spec.Version && st.InstalledVersion != in.Spec.Version:
		return fail(fmt.Sprintf("the catalog has %s %s, not %s", p.Name, p.Spec.Version, in.Spec.Version))
	}
	dir := filepath.Join(r.PluginsDir, p.Name)
	cfg := ConfigOf(&in)
	ns, err := Namespace(&p.Spec, in.Spec.Mode, cfg)
	if err != nil {
		return fail(err.Error())
	}
	services, err := ResolveServices(&p.Spec, in.Spec.Mode, cfg)
	if err != nil {
		return fail(err.Error())
	}
	inst, instSummary, instErr := r.Installers.Get(in.Spec.Cluster)

	// Apply when the version, mode or config changed (never just because
	// it was enabled or disabled).
	hash := AppliedHash(&in)
	if st.AppliedHash != hash {
		if !p.Status.Available {
			return fail(fmt.Sprintf("plugin %s cannot be installed: %s", p.Name, p.Status.Problem))
		}
		if instErr != nil {
			return fail(fmt.Sprintf("cannot apply: %v", instErr))
		}
		st.Phase, st.Message = v1alpha1.InstallInstalling, ""
		meta.RemoveStatusCondition(&st.Conditions, ConditionInstalled)
		r.initSteps(&p, &in, st, true)
		if err := r.writeStatus(ctx, &in, st); err != nil {
			return ctrl.Result{}, err
		}
		identity := ""
		if instSummary != nil {
			identity = instSummary.Identity
		}
		version := ""
		if cs, err := r.Clusters.Client(in.Spec.Cluster); err == nil {
			if v, err := cs.Discovery().ServerVersion(); err == nil {
				version = v.GitVersion
			}
		}
		deployed := false
		if in.Spec.Mode == v1alpha1.ModeInstall && p.Spec.Chart != nil {
			if h, err := NewHelm(inst, ns, r.Logger); err == nil {
				if rel, err := h.Deployed(p.Spec.Chart.ReleaseName); err == nil && rel != nil {
					deployed = true
				}
			}
		}
		pre, err := Preflight(ctx, PreflightInput{Spec: &p.Spec, PluginDir: dir, Cluster: in.Spec.Cluster, Mode: in.Spec.Mode,
			Config: cfg, Installer: inst, InstallerIdentity: identity, KubeVersion: version, ReleaseDeployed: deployed})
		if err != nil {
			return fail("pre-flight: " + err.Error())
		}
		if !pre.OK {
			setCond(st, ConditionPreflight, metav1.ConditionFalse, "Refused", strings.Join(pre.Problems, "; "))
			return fail("pre-flight refused: " + strings.Join(pre.Problems, "; "))
		}
		setCond(st, ConditionPreflight, metav1.ConditionTrue, "Passed", "")
		if err := r.apply(ctx, &in, &p, dir, inst, ns, services, st); err != nil {
			setCond(st, ConditionApplied, metav1.ConditionFalse, "Failed", err.Error())
			return fail(err.Error())
		}
		st.AppliedHash, st.InstalledVersion = hash, in.Spec.Version
		setCond(st, ConditionApplied, metav1.ConditionTrue, "Applied", "version "+in.Spec.Version)
	}

	// Keep the backend's token fresh (needs the installer credential).
	tokenWarn := ""
	if err := r.ensureToken(ctx, &in, inst, instErr, ns, services); err != nil {
		tokenWarn = err.Error()
	}
	return r.checkSteps(ctx, &in, &p, services, st, tokenWarn)
}

func (r *InstallationReconciler) apply(ctx context.Context, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, dir string,
	inst *rest.Config, ns string, services []Service, st *v1alpha1.PluginInstallationStatus) error {
	cs, err := kubernetes.NewForConfig(inst)
	if err != nil {
		return err
	}
	uctx, ref := userCtx(ctx, in)
	if in.Spec.Mode == v1alpha1.ModeInstall {
		ch, values, err := LoadInstallChart(dir, &p.Spec, in.Spec.Cluster)
		if err != nil {
			return err
		}
		setStep(st, "chart", v1alpha1.StepRunning, "")
		if err := r.writeStatus(ctx, in, st); err != nil {
			return err
		}
		if err := ensureNamespace(ctx, cs, ns); err != nil {
			return err
		}
		if err := ensureGeneratedSecrets(ctx, cs, ns, p.Name, p.Spec.Chart.GeneratedSecrets); err != nil {
			return err
		}
		helm, err := NewHelm(inst, ns, r.Logger)
		if err != nil {
			return err
		}
		action := "helm-install"
		if st.InstalledVersion != "" {
			action = "helm-upgrade"
		}
		op := audit.Op{Cluster: in.Spec.Cluster, Namespace: ns, Kind: "HelmRelease", Name: p.Spec.Chart.ReleaseName, Action: action, Ref: ref}
		err = r.Auditor.Do(uctx, op, func(ctx context.Context) (string, error) {
			if _, err := helm.Apply(ctx, p.Spec.Chart.ReleaseName, ch, values, r.HelmTimeout); err != nil {
				return "", err
			}
			return fmt.Sprintf("plugin %s %s, chart %s", p.Name, in.Spec.Version, p.Spec.Chart.Version), nil
		})
		if err != nil {
			setStep(st, "chart", v1alpha1.StepFailed, err.Error())
			return err
		}
		setStep(st, "chart", v1alpha1.StepDone, "")
	}
	return ensureBackendAccount(ctx, cs, ns, p.Name, in.Spec.Cluster, BackendRole(services, ns))
}

// ensureToken refreshes the backend's token when it expires within a
// quarter of its lifetime, storing it (with the resolved services) in mgmt.
func (r *InstallationReconciler) ensureToken(ctx context.Context, in *v1alpha1.PluginInstallation, inst *rest.Config, instErr error, ns string, services []Service) error {
	name := TokenSecretName(in.Spec.Plugin, in.Spec.Cluster)
	var secret corev1.Secret
	err := r.Reader.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: name}, &secret)
	if err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	exists := err == nil
	svcJSON, _ := json.Marshal(services)
	exp, _ := time.Parse(time.RFC3339, string(secret.Data[ExpiresKey]))
	fresh := exists && exp.Sub(r.Now()) > r.TokenTTL/4 && string(secret.Data[ServicesKey]) == string(svcJSON) && string(secret.Data[NamespaceKey]) == ns
	if fresh {
		return nil
	}
	if instErr != nil {
		return fmt.Errorf("backend token cannot be refreshed: %w", instErr)
	}
	cs, err := kubernetes.NewForConfig(inst)
	if err != nil {
		return err
	}
	token, expires, err := mintToken(ctx, cs, ns, in.Spec.Plugin, r.TokenTTL)
	if err != nil {
		return err
	}
	data := map[string][]byte{TokenKey: []byte(token), ExpiresKey: []byte(expires.UTC().Format(time.RFC3339)),
		ServicesKey: svcJSON, NamespaceKey: []byte(ns)}
	if !exists {
		secret = corev1.Secret{
			ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: name, Labels: pluginLabels(in.Spec.Plugin, in.Spec.Cluster)},
			Type:       v1alpha1.PluginTokenSecretType, Data: data,
		}
		if err := controllerutil.SetOwnerReference(in, &secret, r.Client.Scheme()); err != nil {
			return err
		}
		return r.Client.Create(ctx, &secret)
	}
	secret.Data = data
	return r.Client.Update(ctx, &secret)
}

func (r *InstallationReconciler) initSteps(p *v1alpha1.Plugin, in *v1alpha1.PluginInstallation, st *v1alpha1.PluginInstallationStatus, reset bool) {
	var steps []v1alpha1.StepStatus
	for _, s := range p.Spec.Steps {
		if !applies(s.Modes, in.Spec.Mode) {
			continue
		}
		state := v1alpha1.StepPending
		if !reset {
			if old := findStep(st, s.Name); old != nil {
				state = old.State
			}
		}
		steps = append(steps, v1alpha1.StepStatus{Name: s.Name, Title: s.Title, State: state})
	}
	st.Steps = steps
}

func findStep(st *v1alpha1.PluginInstallationStatus, name string) *v1alpha1.StepStatus {
	for i := range st.Steps {
		if st.Steps[i].Name == name {
			return &st.Steps[i]
		}
	}
	return nil
}

func setStep(st *v1alpha1.PluginInstallationStatus, name string, state v1alpha1.StepState, msg string) {
	if s := findStep(st, name); s != nil {
		s.State, s.Message = state, msg
	}
}

func setCond(st *v1alpha1.PluginInstallationStatus, typ string, status metav1.ConditionStatus, reason, msg string) {
	meta.SetStatusCondition(&st.Conditions, metav1.Condition{Type: typ, Status: status, Reason: reason, Message: msg})
}

// checkSteps evaluates every step and derives the phase.
func (r *InstallationReconciler) checkSteps(ctx context.Context, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, services []Service,
	st *v1alpha1.PluginInstallationStatus, tokenWarn string) (ctrl.Result, error) {
	if len(st.Steps) == 0 || len(st.Steps) != countSteps(p, in.Spec.Mode) {
		r.initSteps(p, in, st, false)
	}
	cs, csErr := r.Clusters.Client(in.Spec.Cluster)
	base, _ := r.Clusters.RESTConfig(in.Spec.Cluster)
	var tokenCfg *rest.Config
	var tok corev1.Secret
	if err := r.Reader.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName(in.Spec.Plugin, in.Spec.Cluster)}, &tok); err == nil && base != nil {
		tokenCfg = TokenConfig(base, string(tok.Data[TokenKey]))
		tokenCfg.Timeout = 10 * time.Second
	}
	ns, _ := Namespace(&p.Spec, in.Spec.Mode, ConfigOf(in))

	allDone := true
	wasReady := meta.IsStatusConditionTrue(st.Conditions, ConditionInstalled)
	st.CurrentStep = ""
	for _, def := range p.Spec.Steps {
		if !applies(def.Modes, in.Spec.Mode) {
			continue
		}
		s := findStep(st, def.Name)
		if s == nil {
			continue
		}
		var err error
		switch def.Check.Type {
		case "helm":
			if s.State != v1alpha1.StepDone {
				err = errors.New("waiting for the chart")
			}
		case "workload":
			if csErr != nil {
				err = csErr
			} else {
				err = workloadReady(ctx, cs, ns, def.Check.Kind, def.Check.Name)
			}
		case "service":
			err = r.serviceCheck(ctx, tokenCfg, services, def.Check)
		}
		if err != nil {
			s.State, s.Message = v1alpha1.StepRunning, err.Error()
			if allDone {
				st.CurrentStep = s.Name
			}
			allDone = false
			continue
		}
		s.State, s.Message = v1alpha1.StepDone, ""
	}
	if allDone {
		setCond(st, ConditionInstalled, metav1.ConditionTrue, "AllStepsPassed", "version "+st.InstalledVersion)
	}
	switch {
	case allDone && !in.Spec.Enabled:
		st.Phase, st.Message = v1alpha1.InstallDisabled, "installed; the UI is hidden on this cluster"
	case allDone:
		st.Phase, st.Message = v1alpha1.InstallReady, ""
	case wasReady:
		st.Phase, st.Message = v1alpha1.InstallError, "step "+st.CurrentStep+" is failing: "+findStep(st, st.CurrentStep).Message
	default:
		st.Phase, st.Message = v1alpha1.InstallInstalling, ""
	}
	if tokenWarn != "" {
		st.Message = strings.TrimPrefix(st.Message+"; "+tokenWarn, "; ")
	}
	next := r.Recheck
	if !allDone {
		next = 5 * time.Second
	}
	return r.finish(ctx, in, st, &ctrl.Result{RequeueAfter: next}, nil)
}

func countSteps(p *v1alpha1.Plugin, mode v1alpha1.InstallMode) int {
	n := 0
	for _, s := range p.Spec.Steps {
		if applies(s.Modes, mode) {
			n++
		}
	}
	return n
}

func (r *InstallationReconciler) serviceCheck(ctx context.Context, cfg *rest.Config, services []Service, c v1alpha1.StepCheck) error {
	if cfg == nil {
		return errors.New("the backend has no token yet")
	}
	i := slices.IndexFunc(services, func(s Service) bool { return s.Name == c.Service })
	if i < 0 {
		return fmt.Errorf("service %s is not declared for this mode", c.Service)
	}
	code, body, err := ServiceGet(ctx, cfg, services[i], c.Path)
	switch {
	case err != nil:
		return err
	case code == 403:
		return fmt.Errorf("%s: the backend's account may not reach it (403)", c.Service)
	case code != 200:
		return fmt.Errorf("%s answered %d", c.Service, code)
	case c.Contains != "" && !strings.Contains(string(body), c.Contains):
		return fmt.Errorf("%s: not yet (%s)", c.Service, c.Path)
	}
	return nil
}

func workloadReady(ctx context.Context, cs kubernetes.Interface, ns, kind, name string) error {
	var want, ready int32
	switch kind {
	case "Deployment":
		d, err := cs.AppsV1().Deployments(ns).Get(ctx, name, metav1.GetOptions{})
		if err != nil {
			return notYet(kind, name, err)
		}
		want, ready = ptrOr(d.Spec.Replicas, 1), d.Status.ReadyReplicas
	case "StatefulSet":
		s, err := cs.AppsV1().StatefulSets(ns).Get(ctx, name, metav1.GetOptions{})
		if err != nil {
			return notYet(kind, name, err)
		}
		want, ready = ptrOr(s.Spec.Replicas, 1), s.Status.ReadyReplicas
	case "DaemonSet":
		d, err := cs.AppsV1().DaemonSets(ns).Get(ctx, name, metav1.GetOptions{})
		if err != nil {
			return notYet(kind, name, err)
		}
		want, ready = d.Status.DesiredNumberScheduled, d.Status.NumberReady
	default:
		return fmt.Errorf("unknown kind %s", kind)
	}
	if want == 0 || ready < want {
		return fmt.Errorf("%s %s: %d/%d ready", kind, name, ready, want)
	}
	return nil
}

func notYet(kind, name string, err error) error {
	if apierrors.IsNotFound(err) {
		return fmt.Errorf("%s %s does not exist yet", kind, name)
	}
	return err
}

func ptrOr(p *int32, d int32) int32 {
	if p == nil {
		return d
	}
	return *p
}

// handleCRDScan answers a CRD scan request (for uninstall with CRD cleanup).
func (r *InstallationReconciler) handleCRDScan(ctx context.Context, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, pluginErr error,
	st *v1alpha1.PluginInstallationStatus) (*ctrl.Result, error) {
	reqID := in.Annotations[v1alpha1.AnnotationCRDScanRequest]
	if reqID == "" || (st.CRDScan != nil && st.CRDScan.Request == reqID) {
		return nil, nil
	}
	scan := &v1alpha1.CRDScan{Request: reqID, ScannedAt: metav1.NewTime(r.Now())}
	st.CRDScan = scan
	crds, foreign, err := r.scanCRDs(ctx, in, p, pluginErr)
	if err != nil {
		scan.Error = err.Error()
	}
	scan.CRDs, scan.Foreign, scan.Hash = crds, foreign, HashList(foreign)
	return nil, nil
}

func (r *InstallationReconciler) scanCRDs(ctx context.Context, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, pluginErr error) ([]string, []string, error) {
	if pluginErr != nil || in.Spec.Mode != v1alpha1.ModeInstall || p.Spec.Chart == nil {
		return nil, nil, errors.New("only installed charts have CRDs to remove")
	}
	inst, _, err := r.Installers.Get(in.Spec.Cluster)
	if err != nil {
		return nil, nil, err
	}
	crds, err := r.chartCRDs(p)
	if err != nil {
		return nil, nil, err
	}
	dyn, err := dynamic.NewForConfig(inst)
	if err != nil {
		return nil, nil, err
	}
	foreign, err := ForeignObjects(ctx, dyn, crds, p.Spec.Chart.ReleaseName, p.Spec.Chart.Namespace)
	return crds, foreign, err
}

func (r *InstallationReconciler) chartCRDs(p *v1alpha1.Plugin) ([]string, error) {
	ch, _, err := LoadInstallChart(filepath.Join(r.PluginsDir, p.Name), &p.Spec, "x")
	if err != nil {
		return nil, err
	}
	var names []string
	for _, crd := range ch.CRDObjects() {
		objs, err := decodeObjects(string(crd.File.Data))
		if err != nil {
			return nil, err
		}
		for _, o := range objs {
			names = append(names, o.GetName())
		}
	}
	slices.Sort(names)
	return names, nil
}

// uninstall removes what the installation created, then lets it go.
func (r *InstallationReconciler) uninstall(ctx context.Context, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, pluginErr error) (ctrl.Result, error) {
	if !controllerutil.ContainsFinalizer(in, v1alpha1.FinalizerPluginUninstall) {
		return ctrl.Result{}, nil
	}
	st := in.Status.DeepCopy()
	uctx, ref := userCtx(ctx, in)
	done := func() (ctrl.Result, error) {
		_ = r.Client.Delete(ctx, &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName(in.Spec.Plugin, in.Spec.Cluster)}})
		controllerutil.RemoveFinalizer(in, v1alpha1.FinalizerPluginUninstall)
		return ctrl.Result{}, client.IgnoreNotFound(r.Client.Update(ctx, in))
	}
	if in.Annotations[v1alpha1.AnnotationAbandonRemote] == "true" {
		op := audit.Op{Cluster: in.Spec.Cluster, Kind: "PluginInstallation", Name: in.Name, Action: "abandon-remote", Ref: ref}
		if err := r.Auditor.Event(uctx, op, audit.ResultSuccess, "plugin "+in.Spec.Plugin+" left running in "+in.Spec.Cluster+" (cluster removed from Capybara)"); err != nil {
			return ctrl.Result{}, err
		}
		return done()
	}
	if st.AppliedHash == "" && st.InstalledVersion == "" {
		// Never applied (e.g. refused by pre-flight): nothing to remove.
		return done()
	}
	if pluginErr != nil {
		return r.blocked(ctx, in, st, "plugin "+in.Spec.Plugin+" is no longer in the catalog; cannot uninstall cleanly")
	}
	inst, _, err := r.Installers.Get(in.Spec.Cluster)
	if err != nil {
		return r.blocked(ctx, in, st, "cannot uninstall: "+err.Error())
	}
	cs, err := kubernetes.NewForConfig(inst)
	if err != nil {
		return ctrl.Result{}, err
	}
	if st.Phase != v1alpha1.InstallUninstalling {
		st.Phase, st.Message = v1alpha1.InstallUninstalling, ""
		if err := r.writeStatus(ctx, in, st); err != nil {
			return ctrl.Result{}, err
		}
	}
	cfg := ConfigOf(in)
	ns, err := Namespace(&p.Spec, in.Spec.Mode, cfg)
	if err != nil {
		return r.blocked(ctx, in, st, err.Error())
	}

	if in.Spec.Mode == v1alpha1.ModeInstall && p.Spec.Chart != nil {
		keep := in.Annotations[v1alpha1.AnnotationUninstallKeepData] == "true"
		helm, err := NewHelm(inst, ns, r.Logger)
		if err != nil {
			return ctrl.Result{}, err
		}
		op := audit.Op{Cluster: in.Spec.Cluster, Namespace: ns, Kind: "HelmRelease", Name: p.Spec.Chart.ReleaseName, Action: "helm-uninstall", Ref: ref}
		err = r.Auditor.Do(uctx, op, func(ctx context.Context) (string, error) {
			if err := helm.Uninstall(p.Spec.Chart.ReleaseName, r.HelmTimeout); err != nil {
				return "", err
			}
			for _, g := range p.Spec.Chart.GeneratedSecrets {
				if err := cs.CoreV1().Secrets(ns).Delete(ctx, g.Name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
					return "", err
				}
			}
			if keep {
				return "release removed; data (PersistentVolumeClaims in " + ns + ") kept", nil
			}
			if err := cs.CoreV1().PersistentVolumeClaims(ns).DeleteCollection(ctx, metav1.DeleteOptions{}, metav1.ListOptions{}); err != nil && !apierrors.IsNotFound(err) {
				return "", err
			}
			return "release and its data (PersistentVolumeClaims in " + ns + ") removed", nil
		})
		if err != nil {
			return r.blocked(ctx, in, st, err.Error())
		}
		if confirmed, ok := in.Annotations[v1alpha1.AnnotationUninstallRemoveCRDs]; ok {
			if err := r.removeCRDs(uctx, ref, in, p, inst, confirmed); err != nil {
				return ctrl.Result{}, err
			}
		}
	}
	if err := deleteBackendAccount(ctx, cs, ns, in.Spec.Plugin); err != nil && !apierrors.IsForbidden(err) {
		return r.blocked(ctx, in, st, "remove the backend's account: "+err.Error())
	}
	return done()
}

// removeCRDs deletes the chart's CRDs only if the objects they would take
// with them are exactly the ones the user confirmed.
func (r *InstallationReconciler) removeCRDs(ctx context.Context, ref string, in *v1alpha1.PluginInstallation, p *v1alpha1.Plugin, inst *rest.Config, confirmed string) error {
	crds, err := r.chartCRDs(p)
	if err != nil {
		return err
	}
	dyn, err := dynamic.NewForConfig(inst)
	if err != nil {
		return err
	}
	op := audit.Op{Cluster: in.Spec.Cluster, Kind: "CustomResourceDefinition", Name: strings.Join(crds, ","), Action: "remove-crds", Ref: ref}
	foreign, err := ForeignObjects(ctx, dyn, crds, p.Spec.Chart.ReleaseName, p.Spec.Chart.Namespace)
	if err != nil {
		return err
	}
	if HashList(foreign) != confirmed {
		return r.Auditor.Event(ctx, op, audit.ResultDenied, fmt.Sprintf(
			"CRDs kept: %d object(s) of these kinds that are not from this plugin changed since the uninstall was confirmed", len(foreign)))
	}
	crdGVR := schema.GroupVersionResource{Group: "apiextensions.k8s.io", Version: "v1", Resource: "customresourcedefinitions"}
	return r.Auditor.Do(ctx, op, func(ctx context.Context) (string, error) {
		for _, name := range crds {
			if err := dyn.Resource(crdGVR).Delete(ctx, name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
				return "", err
			}
		}
		return fmt.Sprintf("%d CRDs removed, with %d confirmed object(s) not from this plugin", len(crds), len(foreign)), nil
	})
}

func (r *InstallationReconciler) blocked(ctx context.Context, in *v1alpha1.PluginInstallation, st *v1alpha1.PluginInstallationStatus, msg string) (ctrl.Result, error) {
	st.Phase, st.Message = v1alpha1.InstallError, "uninstall waiting: "+msg
	return r.finish(ctx, in, st, &ctrl.Result{RequeueAfter: 30 * time.Second}, nil)
}

func (r *InstallationReconciler) writeStatus(ctx context.Context, in *v1alpha1.PluginInstallation, st *v1alpha1.PluginInstallationStatus) error {
	if equality.Semantic.DeepEqual(in.Status, *st) {
		return nil
	}
	patch := client.MergeFrom(in.DeepCopy())
	in.Status = *st.DeepCopy()
	return client.IgnoreNotFound(r.Client.Status().Patch(ctx, in, patch))
}

func (r *InstallationReconciler) finish(ctx context.Context, in *v1alpha1.PluginInstallation, st *v1alpha1.PluginInstallationStatus, res *ctrl.Result, err error) (ctrl.Result, error) {
	if werr := r.writeStatus(ctx, in, st); werr != nil && err == nil {
		err = werr
	}
	if res == nil {
		res = &ctrl.Result{}
	}
	return *res, err
}
