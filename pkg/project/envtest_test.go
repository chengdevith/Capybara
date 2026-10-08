package project

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	corev1ac "k8s.io/client-go/applyconfigurations/core/v1"
	"k8s.io/client-go/kubernetes"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
	"sigs.k8s.io/controller-runtime/pkg/event"
	metricsserver "sigs.k8s.io/controller-runtime/pkg/metrics/server"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
)

// Two real API servers: "mgmt" holds Projects, "dev-1" is the managed
// cluster. "dead" is a cluster nobody answers for.
var env struct {
	mgmt      client.Client
	mgmtCfg   *rest.Config
	managed   kubernetes.Interface
	auditFile string
	store     *audit.FileStore
}

type testClusters map[string]kubernetes.Interface

func (c testClusters) List() []cluster.Info {
	var out []cluster.Info
	for id := range c {
		out = append(out, cluster.Info{ID: id})
	}
	return out
}

func (c testClusters) Context(id string) (context.Context, error) {
	if _, ok := c[id]; ok {
		return context.Background(), nil
	}
	return nil, cluster.ErrNotFound
}

func (c testClusters) Client(id string) (kubernetes.Interface, error) {
	if cs, ok := c[id]; ok {
		return cs, nil
	}
	return nil, cluster.ErrNotFound
}

func TestMain(m *testing.M) {
	if os.Getenv("KUBEBUILDER_ASSETS") == "" {
		fmt.Println("skipping envtest suite: KUBEBUILDER_ASSETS not set (run `make test`)")
		os.Exit(m.Run())
	}
	os.Exit(runWithEnvtest(m))
}

func runWithEnvtest(m *testing.M) int {
	ctrl.SetLogger(logrDiscard())
	mgmtEnv := &envtest.Environment{CRDDirectoryPaths: []string{filepath.Join("..", "..", "deploy", "crds")}, ErrorIfCRDPathMissing: true}
	managedEnv := &envtest.Environment{}
	mgmtCfg, err := mgmtEnv.Start()
	must(err)
	defer mgmtEnv.Stop() //nolint:errcheck
	managedCfg, err := managedEnv.Start()
	must(err)
	defer managedEnv.Stop() //nolint:errcheck

	scheme := runtime.NewScheme()
	must(clientgoscheme.AddToScheme(scheme))
	must(v1alpha1.AddToScheme(scheme))

	env.managed = kubernetes.NewForConfigOrDie(managedCfg)
	dead := rest.CopyConfig(managedCfg)
	dead.Host = "https://127.0.0.1:1" // closed port
	dead.Timeout = time.Second

	dir, err := os.MkdirTemp("", "capybara-envtest-audit")
	must(err)
	defer os.RemoveAll(dir) //nolint:errcheck
	env.auditFile = filepath.Join(dir, "audit.jsonl")
	env.store, err = audit.NewFileStore(env.auditFile)
	must(err)
	cfg, err := LoadConfig(filepath.Join("..", "..", "deploy", "project-sizes.yaml"))
	must(err)

	mgr, err := ctrl.NewManager(mgmtCfg, ctrl.Options{Scheme: scheme, Metrics: metricsserver.Options{BindAddress: "0"}})
	must(err)
	clusters := testClusters{"dev-1": env.managed, "dead": kubernetes.NewForConfigOrDie(dead)}
	remote := make(chan event.GenericEvent, 1024)
	r := &Reconciler{
		Client: mgr.GetClient(), Clusters: clusters, Config: StaticConfig(cfg),
		Protected: []string{"kube-system", "default", "openshift-*", "capybara-system"},
		Auditor:   audit.NewAuditor(env.store, slog.New(slog.DiscardHandler)),
		Timeout:   2 * time.Second, Retry: time.Second,
		Resync: time.Hour, // drift must be fixed by the watches, not the resync
	}
	must(r.SetupWithManager(mgr, remote))
	quiet := slog.New(slog.NewTextHandler(io.Discard, nil))
	must(mgr.Add(&RemoteWatcher{Clusters: testClusters{"dev-1": env.managed}, Events: remote, Logger: quiet}))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go func() { must(mgr.Start(ctx)) }()
	env.mgmtCfg = mgmtCfg
	env.mgmt, err = client.New(mgmtCfg, client.Options{Scheme: scheme})
	must(err)
	return m.Run()
}

var runSeq int

// uniq makes a name unique per test run, so the suite can be repeated
// (-count=N) against the same API servers.
func uniq(base string) string {
	runSeq++
	return fmt.Sprintf("%s-%d-%d", base, os.Getpid()%1000, runSeq)
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func requireEnv(t *testing.T) {
	t.Helper()
	if env.mgmt == nil {
		t.Skip("envtest not available (run `make test`)")
	}
}

// eventually polls fn until it returns "" (success) or times out.
func eventually(t *testing.T, timeout time.Duration, fn func() string) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	last := ""
	for time.Now().Before(deadline) {
		if last = fn(); last == "" {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("timed out: %s", last)
}

func newProject(t *testing.T, name, ns, clusterID string) *v1alpha1.Project {
	t.Helper()
	p := &v1alpha1.Project{
		ObjectMeta: metav1.ObjectMeta{Name: name},
		Spec:       v1alpha1.ProjectSpec{Cluster: clusterID, Namespace: ns, Owner: "team-" + name, Size: v1alpha1.SizeS},
	}
	if err := env.mgmt.Create(context.Background(), p); err != nil {
		t.Fatal(err)
	}
	return p
}

func project(t *testing.T, name string) *v1alpha1.Project {
	t.Helper()
	var p v1alpha1.Project
	if err := env.mgmt.Get(context.Background(), types.NamespacedName{Name: name}, &p); err != nil {
		t.Fatal(err)
	}
	return &p
}

func readyReason(p *v1alpha1.Project) string {
	if c := meta.FindStatusCondition(p.Status.Conditions, v1alpha1.ConditionReady); c != nil {
		return c.Reason
	}
	return ""
}

func waitForReason(t *testing.T, name, reason string) *v1alpha1.Project {
	t.Helper()
	var p *v1alpha1.Project
	eventually(t, 15*time.Second, func() string {
		p = project(t, name)
		if got := readyReason(p); got != reason {
			return fmt.Sprintf("project %s: Ready reason %q, want %q (%+v)", name, got, reason, p.Status.Conditions)
		}
		return ""
	})
	return p
}

// finishNamespaceDeletion does what the namespace controller would do in a
// real cluster (envtest runs none): once deletion is requested, clear the
// "kubernetes" finalizer so the namespace goes away.
func finishNamespaceDeletion(t *testing.T, name string) {
	t.Helper()
	ctx := context.Background()
	eventually(t, 15*time.Second, func() string {
		ns, err := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
		if apierrors.IsNotFound(err) {
			return ""
		}
		if err != nil {
			return err.Error()
		}
		if ns.DeletionTimestamp == nil {
			return "namespace not being deleted yet"
		}
		ns.Spec.Finalizers = nil
		if _, err := env.managed.CoreV1().Namespaces().Finalize(ctx, ns, metav1.UpdateOptions{}); err != nil {
			return err.Error()
		}
		return "finalized; waiting for removal"
	})
}

func deleteProject(t *testing.T, name, auditID string) {
	t.Helper()
	p := project(t, name)
	patch := client.MergeFrom(p.DeepCopy())
	if p.Annotations == nil {
		p.Annotations = map[string]string{}
	}
	p.Annotations[v1alpha1.AnnotationDeletedBy] = "alice"
	p.Annotations[v1alpha1.AnnotationDeleteAuditID] = auditID
	if err := env.mgmt.Patch(context.Background(), p, patch); err != nil {
		t.Fatal(err)
	}
	if err := env.mgmt.Delete(context.Background(), p); err != nil {
		t.Fatal(err)
	}
}

func waitForProjectGone(t *testing.T, name string) {
	t.Helper()
	eventually(t, 20*time.Second, func() string {
		var p v1alpha1.Project
		err := env.mgmt.Get(context.Background(), types.NamespacedName{Name: name}, &p)
		if apierrors.IsNotFound(err) {
			return ""
		}
		return fmt.Sprintf("project %s still there (%v)", name, p.Status.Conditions)
	})
}

func auditRecords(t *testing.T) []audit.Record {
	t.Helper()
	recs, err := env.store.List(context.Background(), audit.Filter{Limit: 1000})
	if err != nil {
		t.Fatal(err)
	}
	return recs
}

func TestCreateProducesAllResources(t *testing.T) {
	requireEnv(t)
	name := uniq("alpha")
	ctx := context.Background()
	p := newProject(t, name, name, "dev-1")
	got := waitForReason(t, name, v1alpha1.ReasonReconciled)

	if got.Status.Phase != v1alpha1.PhaseReady || got.Status.ObservedGeneration != got.Generation || len(got.Status.Resources) != 7 {
		t.Errorf("status = %+v", got.Status)
	}
	if !strings.Contains(strings.Join(got.Finalizers, ","), v1alpha1.FinalizerRemoteCleanup) {
		t.Errorf("finalizer missing: %v", got.Finalizers)
	}
	ns, err := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if ns.Labels[v1alpha1.LabelProject] != name || ns.Annotations[v1alpha1.AnnotationProjectUID] != string(got.UID) {
		t.Errorf("namespace labels %v annotations %v", ns.Labels, ns.Annotations)
	}
	if ns.Labels[LabelPodSecurityEnforce] != "baseline" || ns.Labels[LabelPodSecurityWarn] != "restricted" {
		t.Errorf("pod security labels %v", ns.Labels)
	}
	if ps := got.Status.PodSecurity; ps == nil || ps.Enforce != "baseline" || len(ps.Violations) != 0 ||
		!meta.IsStatusConditionTrue(got.Status.Conditions, v1alpha1.ConditionPodSecurity) {
		t.Errorf("pod security status %+v %+v", got.Status.PodSecurity, got.Status.Conditions)
	}
	if _, err := env.managed.CoreV1().ResourceQuotas(name).Get(ctx, QuotaName, metav1.GetOptions{}); err != nil {
		t.Error(err)
	}
	if _, err := env.managed.CoreV1().LimitRanges(name).Get(ctx, LimitRangeName, metav1.GetOptions{}); err != nil {
		t.Error(err)
	}
	nps, _ := env.managed.NetworkingV1().NetworkPolicies(name).List(ctx, metav1.ListOptions{})
	if len(nps.Items) != 3 {
		t.Errorf("network policies = %d, want 3", len(nps.Items))
	}
	rb, err := env.managed.RbacV1().RoleBindings(name).Get(ctx, OwnerBindingName, metav1.GetOptions{})
	if err != nil || rb.Subjects[0].Kind != "Group" || rb.Subjects[0].Name != "team-"+name || rb.RoleRef.Name != "admin" {
		t.Errorf("role binding = %+v, %v", rb, err)
	}
	_ = p
}

func TestDriftIsRestoredByTheWatches(t *testing.T) {
	requireEnv(t)
	name := uniq("drift")
	ctx := context.Background()
	newProject(t, name, name, "dev-1")
	waitForReason(t, name, v1alpha1.ReasonReconciled)

	if err := env.managed.NetworkingV1().NetworkPolicies(name).Delete(ctx, DenyIngressName, metav1.DeleteOptions{}); err != nil {
		t.Fatal(err)
	}
	q, _ := env.managed.CoreV1().ResourceQuotas(name).Get(ctx, QuotaName, metav1.GetOptions{})
	q.Spec.Hard[corev1.ResourcePods] = *resourceQuantity("999")
	if _, err := env.managed.CoreV1().ResourceQuotas(name).Update(ctx, q, metav1.UpdateOptions{FieldManager: "someone"}); err != nil {
		t.Fatal(err)
	}

	// Resync is an hour: only the remote watches can bring these back.
	eventually(t, 10*time.Second, func() string {
		if _, err := env.managed.NetworkingV1().NetworkPolicies(name).Get(ctx, DenyIngressName, metav1.GetOptions{}); err != nil {
			return "deny policy not restored: " + err.Error()
		}
		q, _ := env.managed.CoreV1().ResourceQuotas(name).Get(ctx, QuotaName, metav1.GetOptions{})
		if v := q.Spec.Hard[corev1.ResourcePods]; v.String() != "10" {
			return "pods quota still " + v.String()
		}
		return ""
	})
}

func TestSizeAndOwnerChangesAreApplied(t *testing.T) {
	requireEnv(t)
	name := uniq("resize")
	ctx := context.Background()
	newProject(t, name, name, "dev-1")
	waitForReason(t, name, v1alpha1.ReasonReconciled)

	p := project(t, name)
	p.Spec.Size = v1alpha1.SizeM
	p.Spec.Owner = "platform-team"
	if err := env.mgmt.Update(ctx, p); err != nil {
		t.Fatal(err)
	}
	eventually(t, 10*time.Second, func() string {
		q, _ := env.managed.CoreV1().ResourceQuotas(name).Get(ctx, QuotaName, metav1.GetOptions{})
		if v := q.Spec.Hard[corev1.ResourcePods]; v.String() != "30" {
			return "pods quota " + v.String() + ", want 30 (size M)"
		}
		rb, _ := env.managed.RbacV1().RoleBindings(name).Get(ctx, OwnerBindingName, metav1.GetOptions{})
		if len(rb.Subjects) != 1 || rb.Subjects[0].Name != "platform-team" {
			return fmt.Sprintf("subjects %+v, want only platform-team", rb.Subjects)
		}
		if got := project(t, name); got.Status.ObservedGeneration != got.Generation {
			return "observedGeneration not updated"
		}
		return ""
	})
}

func TestExistingNamespaceIsNeverAdopted(t *testing.T) {
	requireEnv(t)
	ns := uniq("theirs")
	name := uniq("grabber")
	ctx := context.Background()
	if _, err := env.managed.CoreV1().Namespaces().Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: ns}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	newProject(t, name, ns, "dev-1")
	p := waitForReason(t, name, v1alpha1.ReasonNamespaceConflict)
	if p.Status.Phase != v1alpha1.PhaseError {
		t.Errorf("phase = %s", p.Status.Phase)
	}
	existing, _ := env.managed.CoreV1().Namespaces().Get(ctx, ns, metav1.GetOptions{})
	if _, labelled := existing.Labels[v1alpha1.LabelProject]; labelled {
		t.Error("existing namespace was labelled")
	}
	if qs, _ := env.managed.CoreV1().ResourceQuotas(ns).List(ctx, metav1.ListOptions{}); len(qs.Items) != 0 {
		t.Error("quota created in a namespace we do not own")
	}
}

func TestStaleOwnerOnCreate(t *testing.T) {
	requireEnv(t)
	name := uniq("reused")
	ctx := context.Background()
	// Left behind by an earlier Project called name.
	if _, err := env.managed.CoreV1().Namespaces().Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{
		Name:        name,
		Labels:      map[string]string{v1alpha1.LabelProject: name},
		Annotations: map[string]string{v1alpha1.AnnotationProjectUID: "uid-of-the-earlier-project"},
	}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	newProject(t, name, name, "dev-1")
	waitForReason(t, name, v1alpha1.ReasonStaleOwner)
	if qs, _ := env.managed.CoreV1().ResourceQuotas(name).List(ctx, metav1.ListOptions{}); len(qs.Items) != 0 {
		t.Error("stale namespace was adopted")
	}
}

func TestStaleOwnerOnDeleteKeepsTheNamespace(t *testing.T) {
	requireEnv(t)
	name := uniq("handover")
	ctx := context.Background()
	newProject(t, name, name, "dev-1")
	waitForReason(t, name, v1alpha1.ReasonReconciled)

	// The namespace now claims to belong to a different Project uid.
	ns, _ := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
	ns.Annotations[v1alpha1.AnnotationProjectUID] = "uid-of-someone-else"
	if _, err := env.managed.CoreV1().Namespaces().Update(ctx, ns, metav1.UpdateOptions{}); err != nil {
		t.Fatal(err)
	}
	waitForReason(t, name, v1alpha1.ReasonStaleOwner)

	req := "req-" + name
	deleteProject(t, name, req)
	waitForProjectGone(t, name)
	if ns, err := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{}); err != nil || ns.DeletionTimestamp != nil {
		t.Fatalf("namespace must be kept (uid mismatch): %v %v", err, ns.DeletionTimestamp)
	}
	found := false
	for _, r := range auditRecords(t) {
		if r.Action == "delete-namespace" && r.Name == name {
			found = r.Result == audit.ResultDenied && r.Ref == req && r.User == "alice"
		}
	}
	if !found {
		t.Error("kept namespace not audited as denied, linked to the delete request")
	}
}

func TestProtectedNamespaceIsRefusedAndNeverDeleted(t *testing.T) {
	requireEnv(t)
	name := uniq("sneaky")
	ctx := context.Background()
	newProject(t, name, "kube-system", "dev-1")
	waitForReason(t, name, v1alpha1.ReasonProtectedNamespace)

	deleteProject(t, name, "req-"+name)
	waitForProjectGone(t, name)
	if ns, err := env.managed.CoreV1().Namespaces().Get(ctx, "kube-system", metav1.GetOptions{}); err != nil || ns.DeletionTimestamp != nil {
		t.Fatal("kube-system was touched")
	}
}

func TestUnreachableClusterDoesNotBlockOthers(t *testing.T) {
	requireEnv(t)
	lost := uniq("lost")
	fine := uniq("fine")
	newProject(t, lost, lost, "dead")
	newProject(t, fine, fine, "dev-1")

	waitForReason(t, fine, v1alpha1.ReasonReconciled)
	p := waitForReason(t, lost, v1alpha1.ReasonClusterUnreachable)
	reach := meta.FindStatusCondition(p.Status.Conditions, v1alpha1.ConditionClusterReachable)
	if reach == nil || reach.Status != metav1.ConditionFalse || p.Status.Phase != v1alpha1.PhaseError {
		t.Errorf("status = %+v", p.Status)
	}
}

func TestDeleteRemovesOwnedNamespaceAndAuditsIt(t *testing.T) {
	requireEnv(t)
	name := uniq("doomed")
	ctx := context.Background()
	newProject(t, name, name, "dev-1")
	waitForReason(t, name, v1alpha1.ReasonReconciled)

	req := "req-" + name
	deleteProject(t, name, req)
	waitForReason(t, name, v1alpha1.ReasonTerminating)
	finishNamespaceDeletion(t, name)
	waitForProjectGone(t, name)

	if _, err := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{}); !apierrors.IsNotFound(err) {
		t.Fatalf("namespace still there: %v", err)
	}
	var deleted, removed bool
	for _, r := range auditRecords(t) {
		if r.Name != name || r.Ref != req || r.User != "alice" {
			continue
		}
		deleted = deleted || (r.Action == "delete-namespace" && r.Result == audit.ResultSuccess)
		removed = removed || (r.Action == "namespace-removed" && r.Result == audit.ResultSuccess)
	}
	if !deleted || !removed {
		t.Errorf("audit: delete-namespace=%v namespace-removed=%v (both linked to req-doomed)", deleted, removed)
	}
}

// Labelling a namespace that already runs a privileged pod: the dry run
// returns Kubernetes' warning about it and changes nothing.
func TestPodSecurityDryRunReportsExistingViolations(t *testing.T) {
	requireEnv(t)
	ctx := context.Background()
	name := uniq("psa")
	if _, err := env.managed.CoreV1().Namespaces().Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: name}}, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	privileged := true
	pod := &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "root-tool", Namespace: name}, Spec: corev1.PodSpec{Containers: []corev1.Container{{
		Name: "c", Image: "busybox:1.36", SecurityContext: &corev1.SecurityContext{Privileged: &privileged},
	}}}}
	if _, err := env.managed.CoreV1().Pods(name).Create(ctx, pod, metav1.CreateOptions{}); err != nil {
		t.Fatal(err)
	}
	ns := corev1ac.Namespace(name).WithLabels(PodSecurityLabels)
	warnings, err := podSecurityDryRun(ctx, env.managed, ns)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(strings.Join(warnings, "\n"), "root-tool") {
		t.Errorf("warnings = %q", warnings)
	}
	got, _ := env.managed.CoreV1().Namespaces().Get(ctx, name, metav1.GetOptions{})
	if got.Labels[LabelPodSecurityEnforce] != "" {
		t.Error("the dry run changed the namespace")
	}

	var st v1alpha1.ProjectStatus
	recordPodSecurity(&st, warnings, 3)
	c := meta.FindStatusCondition(st.Conditions, v1alpha1.ConditionPodSecurity)
	if c == nil || c.Status != metav1.ConditionFalse || c.Reason != v1alpha1.ReasonExistingViolations || !strings.Contains(c.Message, "root-tool") {
		t.Errorf("condition = %+v", c)
	}
}
