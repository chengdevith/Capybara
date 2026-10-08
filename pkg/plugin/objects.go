package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"sort"
	"strings"

	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/httpjson"
)

// ObjectClusters gives Capybara's own clients for a cluster.
type ObjectClusters interface {
	Dynamic(id string) (dynamic.Interface, error)
	Client(id string) (kubernetes.Interface, error)
}

// ObjectAPI writes the objects plugins declare (manifest `objects`) in
// Project namespaces, with Capybara's account (holding the plugin's
// per-Project grant there). Every write is validated by core against the
// object's policy, the Project's ServiceAccounts and quota, then dry-run
// through the cluster's admission, then made and audited (fail-closed) as
// <plugin>.<action>. Plugin code never decides what is written.
//
// Before authentication every user may use it; the guardrails stand in for
// per-user rights until Phase 5 (ADR 0008).
type ObjectAPI struct {
	Mgmt     client.Client
	Clusters ObjectClusters
	Auditor  *audit.Auditor
	Logger   *slog.Logger
}

// Register adds the routes.
func (a *ObjectAPI) Register(mux *http.ServeMux) {
	base := "/api/clusters/{id}/plugin-objects/{plugin}/{object}/{namespace}"
	mux.HandleFunc("POST "+base+"/_validate", a.validate)
	mux.HandleFunc("POST "+base+"/_cleanup", a.cleanup)
	mux.HandleFunc("POST "+base, a.create)
	mux.HandleFunc("PUT "+base+"/{name}", a.update)
	mux.HandleFunc("DELETE "+base+"/{name}", a.remove)
}

// ObjectRequest carries the object, as the editor or form produced it.
type ObjectRequest struct {
	Object map[string]any `json:"object"`
	// UID and ResourceVersion of the object as loaded (update).
	UID             string `json:"uid,omitempty"`
	ResourceVersion string `json:"resourceVersion,omitempty"`
	// Name: for validating an edit of an existing object.
	Name string `json:"name,omitempty"`
}

// Checked is what validation found.
type Checked struct {
	Problems []Violation `json:"problems"`
	Warnings []string    `json:"warnings"`
	// Object as it would be written (defaults applied).
	Object map[string]any `json:"object,omitempty"`
}

// target is one resolved request: plugin, object declaration, cluster,
// Project namespace, and Capybara's clients there.
type target struct {
	plugin  *v1alpha1.Plugin
	object  v1alpha1.PluginObject
	cluster string
	ns      string
	// project owns ns (policy placeholders).
	project string
	dyn     dynamic.Interface
	cs      kubernetes.Interface
}

func (t *target) gvr(o v1alpha1.PluginObject) schema.GroupVersionResource {
	return schema.GroupVersionResource{Group: o.Group, Version: o.Version, Resource: o.Resource}
}

func (t *target) action(verb v1alpha1.ObjectVerb) string {
	name := string(verb)
	if a := t.object.Audit[string(verb)]; a != "" {
		name = a
	}
	return t.plugin.Name + "." + name
}

// resolve checks everything that does not depend on the object: the
// plugin declares it with this verb, is Ready and enabled on the cluster,
// and the namespace is a Ready Project's on that cluster.
func (a *ObjectAPI) resolve(ctx context.Context, r *http.Request, verb v1alpha1.ObjectVerb) (*target, error) {
	if a.Mgmt == nil {
		return nil, errorf(http.StatusServiceUnavailable, "capybara-mgmt is not available")
	}
	id, pluginName, objName, ns := r.PathValue("id"), r.PathValue("plugin"), r.PathValue("object"), r.PathValue("namespace")
	if !dnsRE.MatchString(ns) {
		return nil, errorf(http.StatusBadRequest, "namespace must be a Kubernetes name")
	}
	var p v1alpha1.Plugin
	if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: pluginName}, &p); err != nil {
		return nil, errorf(http.StatusNotFound, "plugin %q is not in the catalog", pluginName)
	}
	i := slices.IndexFunc(p.Spec.Objects, func(o v1alpha1.PluginObject) bool { return o.Name == objName })
	if i < 0 {
		return nil, errorf(http.StatusNotFound, "plugin %s declares no object %q", pluginName, objName)
	}
	obj := p.Spec.Objects[i]
	if verb != "" && !slices.Contains(obj.Verbs, verb) {
		return nil, fmt.Errorf("%w: plugin %s does not allow %s on %s", audit.ErrDenied, pluginName, verb, obj.Resource)
	}
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: v1alpha1.InstallationName(pluginName, id)}, &in); err != nil || !Usable(&in) {
		return nil, fmt.Errorf("%w: %s is not installed and enabled on %s", audit.ErrDenied, p.Spec.DisplayName, id)
	}
	if obj.RequiresStep != "" && !StepPassed(&in, obj.RequiresStep) {
		return nil, fmt.Errorf("%w: %s is view-only on %s (step %q has not passed)", audit.ErrDenied, p.Spec.DisplayName, id, obj.RequiresStep)
	}
	project, err := ProjectOf(ctx, a.Mgmt, id, ns)
	if err != nil {
		return nil, err
	}
	dyn, err := a.Clusters.Dynamic(id)
	if err != nil {
		return nil, errorf(http.StatusServiceUnavailable, "cluster %s is not available", id)
	}
	cs, err := a.Clusters.Client(id)
	if err != nil {
		return nil, errorf(http.StatusServiceUnavailable, "cluster %s is not available", id)
	}
	return &target{plugin: &p, object: obj, cluster: id, ns: ns, project: project, dyn: dyn, cs: cs}, nil
}

// RequireProjectNamespace returns ErrDenied unless ns belongs to a Ready
// Project on the cluster: plugin objects are written only in Project
// namespaces (never protected or system ones: Projects cannot use those).
func RequireProjectNamespace(ctx context.Context, mgmt client.Client, clusterID, ns string) error {
	_, err := ProjectOf(ctx, mgmt, clusterID, ns)
	return err
}

// ProjectOf names the Ready Project that owns ns (ErrDenied: none).
func ProjectOf(ctx context.Context, mgmt client.Client, clusterID, ns string) (string, error) {
	var projects v1alpha1.ProjectList
	if err := mgmt.List(ctx, &projects); err != nil {
		return "", err
	}
	for _, pr := range projects.Items {
		if pr.Spec.Cluster == clusterID && pr.Spec.Namespace == ns && pr.DeletionTimestamp.IsZero() && pr.Status.Phase == v1alpha1.PhaseReady {
			return pr.Name, nil
		}
	}
	return "", fmt.Errorf("%w: %s on %s is not a Project namespace; plugins write only in Project namespaces", audit.ErrDenied, ns, clusterID)
}

// prepare normalises the submitted object for the target: kind and
// apiVersion must match, the namespace is the target's, and fields the
// server owns are dropped.
func (t *target) prepare(raw map[string]any, name string) (*unstructured.Unstructured, error) {
	if raw == nil {
		return nil, errorf(http.StatusBadRequest, "object is required")
	}
	u := &unstructured.Unstructured{Object: raw}
	want := schema.GroupVersion{Group: t.object.Group, Version: t.object.Version}.String()
	if u.GetAPIVersion() == "" {
		u.SetAPIVersion(want)
	}
	if u.GetKind() == "" {
		u.SetKind(t.object.Kind)
	}
	if u.GetAPIVersion() != want || u.GetKind() != t.object.Kind {
		return nil, errorf(http.StatusBadRequest, "expected %s %s (got %s %s)", want, t.object.Kind, u.GetAPIVersion(), u.GetKind())
	}
	if ns := u.GetNamespace(); ns != "" && ns != t.ns {
		return nil, errorf(http.StatusBadRequest, "metadata.namespace is %q, not %q", ns, t.ns)
	}
	u.SetNamespace(t.ns)
	for _, f := range []string{"uid", "resourceVersion", "creationTimestamp", "generation", "managedFields", "selfLink",
		"deletionTimestamp", "deletionGracePeriodSeconds", "ownerReferences", "finalizers"} {
		unstructured.RemoveNestedField(u.Object, "metadata", f)
	}
	delete(u.Object, "status")
	if name != "" {
		if u.GetName() != "" && u.GetName() != name {
			return nil, errorf(http.StatusBadRequest, "the name cannot be changed (%q)", name)
		}
		u.SetName(name)
		u.SetGenerateName("")
	}
	if u.GetName() == "" && u.GetGenerateName() == "" {
		return nil, errorf(http.StatusBadRequest, "metadata.name is required")
	}
	if n := u.GetName(); n != "" && !dnsRE.MatchString(n) {
		return nil, errorf(http.StatusBadRequest, "metadata.name %q is not a valid name", n)
	}
	return u, nil
}

// check runs every guardrail on u (after defaults), its references, then
// a server-side dry run of the write.
func (a *ObjectAPI) check(ctx context.Context, t *target, u *unstructured.Unstructured, verb v1alpha1.ObjectVerb) (Checked, error) {
	out := Checked{Problems: []Violation{}, Warnings: []string{}}
	violations, err := a.policy(ctx, t, t.object, u.Object)
	if err != nil {
		return out, err
	}
	out.Problems = append(out.Problems, violations...)
	if problems, err := a.projectAccounts(ctx, t, u.Object); err != nil {
		return out, err
	} else {
		out.Problems = append(out.Problems, problems...)
	}
	images := Values(u.Object, "**.image")

	// Referenced objects (same namespace) are checked as they are now.
	for _, ref := range t.object.References {
		i := slices.IndexFunc(t.plugin.Spec.Objects, func(o v1alpha1.PluginObject) bool { return o.Name == ref.Object })
		if i < 0 {
			continue
		}
		decl := t.plugin.Spec.Objects[i]
		for _, name := range uniq(Values(u.Object, ref.Path)) {
			got, err := t.dyn.Resource(t.gvr(decl)).Namespace(t.ns).Get(ctx, name, metav1.GetOptions{})
			if apierrors.IsNotFound(err) {
				out.Warnings = append(out.Warnings, fmt.Sprintf("%s %q does not exist in %s yet", decl.Kind, name, t.ns))
				continue
			}
			if err != nil {
				return out, err
			}
			vs, err := a.policy(ctx, t, decl, got.Object)
			if err != nil {
				return out, err
			}
			for _, v := range vs {
				out.Problems = append(out.Problems, Violation{Path: v.Path, Message: fmt.Sprintf("%s %s: %s", decl.Kind, name, v.Message)})
			}
			images = append(images, Values(got.Object, "**.image")...)
			// One level further (e.g. a run's Pipeline's Tasks).
			for _, ref2 := range decl.References {
				j := slices.IndexFunc(t.plugin.Spec.Objects, func(o v1alpha1.PluginObject) bool { return o.Name == ref2.Object })
				if j < 0 {
					continue
				}
				decl2 := t.plugin.Spec.Objects[j]
				for _, name2 := range uniq(Values(got.Object, ref2.Path)) {
					got2, err := t.dyn.Resource(t.gvr(decl2)).Namespace(t.ns).Get(ctx, name2, metav1.GetOptions{})
					if apierrors.IsNotFound(err) {
						out.Problems = append(out.Problems, Violation{Path: ref.Path, Message: fmt.Sprintf("%s %s uses %s %q, which does not exist in %s", decl.Kind, name, decl2.Kind, name2, t.ns)})
						continue
					}
					if err != nil {
						return out, err
					}
					vs, err := a.policy(ctx, t, decl2, got2.Object)
					if err != nil {
						return out, err
					}
					for _, v := range vs {
						out.Problems = append(out.Problems, Violation{Path: v.Path, Message: fmt.Sprintf("%s %s: %s", decl2.Kind, name2, v.Message)})
					}
					images = append(images, Values(got2.Object, "**.image")...)
				}
			}
		}
	}
	out.Warnings = append(out.Warnings, a.missingImages(ctx, t, uniq(images))...)
	out.Object = u.Object
	if len(out.Problems) > 0 {
		return out, nil
	}
	// Admission (the tool's webhooks, quotas, Pod Security) as a dry run.
	res := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns)
	var dryErr error
	dry := metav1.DryRunAll
	switch verb {
	case v1alpha1.ObjectCreate:
		_, dryErr = res.Create(ctx, u.DeepCopy(), metav1.CreateOptions{DryRun: []string{dry}, FieldManager: "capybara"})
	case v1alpha1.ObjectUpdate:
		_, dryErr = res.Update(ctx, u.DeepCopy(), metav1.UpdateOptions{DryRun: []string{dry}, FieldManager: "capybara"})
	}
	if dryErr != nil {
		var status apierrors.APIStatus
		if errors.As(dryErr, &status) && (apierrors.IsInvalid(dryErr) || apierrors.IsBadRequest(dryErr) || apierrors.IsForbidden(dryErr) ||
			apierrors.IsAlreadyExists(dryErr) || apierrors.IsConflict(dryErr)) {
			out.Problems = append(out.Problems, Violation{Path: "", Message: "the cluster refused it: " + status.Status().Message})
			return out, nil
		}
		return out, dryErr
	}
	return out, nil
}

// policy applies the declaration's policy (with the namespace's quota).
func (a *ObjectAPI) policy(ctx context.Context, t *target, decl v1alpha1.PluginObject, obj map[string]any) ([]Violation, error) {
	if decl.Policy == "" {
		return nil, nil
	}
	rules, err := ResolvePolicy(t.plugin.Spec.Policies, decl.Policy)
	if err != nil {
		return nil, err
	}
	return ApplyPolicy(ctx, SubstituteRules(rules, PolicyVars(t.project, t.ns, t.cluster)), obj, t.quotas)
}

// quotas: what the namespace's ResourceQuotas still allow (the least).
func (t *target) quotas(ctx context.Context, name string) (resource.Quantity, bool, error) {
	list, err := t.cs.CoreV1().ResourceQuotas(t.ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return resource.Quantity{}, false, err
	}
	var left resource.Quantity
	found := false
	for _, q := range list.Items {
		hard, ok := q.Status.Hard[corev1.ResourceName(name)]
		if !ok {
			if hard, ok = q.Spec.Hard[corev1.ResourceName(name)]; !ok {
				continue
			}
		}
		rest := hard.DeepCopy()
		if used, ok := q.Status.Used[corev1.ResourceName(name)]; ok {
			rest.Sub(used)
		}
		if !found || rest.Cmp(left) < 0 {
			left, found = rest, true
		}
	}
	return left, found, nil
}

// projectAccounts: a ServiceAccount the plugin declares per Project and the
// object names must be Capybara's (labelled) and bound to nothing.
func (a *ObjectAPI) projectAccounts(ctx context.Context, t *target, obj map[string]any) ([]Violation, error) {
	pa := t.plugin.Spec.Permissions.Project
	if pa == nil || len(pa.ServiceAccounts) == 0 {
		return nil, nil
	}
	var out []Violation
	for _, m := range match(obj, splitPath("**.serviceAccountName")) {
		name := scalar(m.value)
		if !slices.ContainsFunc(pa.ServiceAccounts, func(s v1alpha1.ProjectServiceAccount) bool { return s.Name == name }) {
			continue // the policy decides about other names
		}
		sa, err := t.cs.CoreV1().ServiceAccounts(t.ns).Get(ctx, name, metav1.GetOptions{})
		if apierrors.IsNotFound(err) {
			out = append(out, Violation{Path: m.path, Message: fmt.Sprintf("the Project's %q ServiceAccount is not there yet; try again shortly", name)})
			continue
		}
		if err != nil {
			return nil, err
		}
		if sa.Labels[LabelProjectAccess] != "true" {
			out = append(out, Violation{Path: m.path, Message: fmt.Sprintf("ServiceAccount %q in %s was not created by Capybara", name, t.ns)})
			continue
		}
		bound, err := t.boundTo(ctx, name)
		if err != nil {
			return nil, err
		}
		if bound != "" {
			out = append(out, Violation{Path: m.path, Message: fmt.Sprintf("ServiceAccount %q must have no permissions, but %s grants it some", name, bound)})
		}
	}
	return out, nil
}

// boundTo names a RoleBinding or ClusterRoleBinding that has the
// namespace's ServiceAccount as a subject ("" when none).
func (t *target) boundTo(ctx context.Context, sa string) (string, error) {
	is := func(s []rbacv1.Subject, bindingNS string) bool {
		for _, x := range s {
			ns := x.Namespace
			if ns == "" {
				ns = bindingNS
			}
			if x.Kind == "ServiceAccount" && x.Name == sa && ns == t.ns {
				return true
			}
		}
		return false
	}
	rbs, err := t.cs.RbacV1().RoleBindings(t.ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return "", err
	}
	for _, b := range rbs.Items {
		if is(b.Subjects, t.ns) {
			return "RoleBinding " + b.Name, nil
		}
	}
	crbs, err := t.cs.RbacV1().ClusterRoleBindings().List(ctx, metav1.ListOptions{})
	if err != nil {
		return "", err
	}
	for _, b := range crbs.Items {
		if is(b.Subjects, "") {
			return "ClusterRoleBinding " + b.Name, nil
		}
	}
	return "", nil
}

// missingImages warns about images no node of the cluster has (they will be
// pulled when a step starts, if the nodes can pull at all).
func (a *ObjectAPI) missingImages(ctx context.Context, t *target, images []string) []string {
	if len(images) == 0 {
		return nil
	}
	nodes, err := t.cs.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil // a warning only
	}
	have := map[string]bool{}
	for _, n := range nodes.Items {
		for _, img := range n.Status.Images {
			for _, name := range img.Names {
				have[name] = true
				have[normalizeImage(name)] = true
			}
		}
	}
	var out []string
	for _, img := range images {
		if strings.Contains(img, "$(") {
			continue // a parameter
		}
		if !have[img] && !have[normalizeImage(img)] {
			out = append(out, fmt.Sprintf("image %s is not on any node of %s; steps using it wait until it can be pulled", img, t.cluster))
		}
	}
	return out
}

// normalizeImage writes Docker Hub short names in full ("busybox:1.36" →
// "docker.io/library/busybox:1.36"), as nodes report them.
func normalizeImage(ref string) string {
	repo, suffix := ref, ""
	if i := strings.Index(repo, "@"); i >= 0 {
		repo, suffix = repo[:i], repo[i:]
	}
	if j := strings.LastIndex(repo, ":"); j > strings.LastIndex(repo, "/") {
		repo, suffix = repo[:j], repo[j:]+suffix
	}
	if suffix == "" {
		suffix = ":latest"
	}
	first, _, hasSlash := strings.Cut(repo, "/")
	switch {
	case !hasSlash:
		repo = "docker.io/library/" + repo
	case !strings.ContainsAny(first, ".:") && first != "localhost":
		repo = "docker.io/" + repo
	}
	return repo + suffix
}

func uniq(in []string) []string {
	out := slices.Clone(in)
	slices.Sort(out)
	return slices.Compact(out)
}

// problemsError carries validation problems to the client (422).
func problemsError(c Checked) error {
	return &apiError{status: http.StatusUnprocessableEntity, msg: "the object does not meet the rules for this Project",
		extra: map[string]any{"problems": c.Problems, "warnings": c.Warnings}}
}

func (a *ObjectAPI) validate(w http.ResponseWriter, r *http.Request) {
	var b ObjectRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	verb := v1alpha1.ObjectCreate
	if b.Name != "" {
		verb = v1alpha1.ObjectUpdate
	}
	t, err := a.resolve(r.Context(), r, verb)
	if err != nil {
		writeErr(w, err)
		return
	}
	u, err := t.prepare(b.Object, b.Name)
	if err != nil {
		writeErr(w, err)
		return
	}
	if verb == v1alpha1.ObjectUpdate {
		// Validating writes nothing: check against the current version
		// (saving still requires the loaded one).
		if b.UID == "" {
			cur, err := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns).Get(r.Context(), u.GetName(), metav1.GetOptions{})
			if err != nil {
				writeObjectErr(w, err)
				return
			}
			b.UID, b.ResourceVersion = string(cur.GetUID()), cur.GetResourceVersion()
		}
		if err := t.carryVersion(r.Context(), u, b); err != nil {
			writeErr(w, err)
			return
		}
	}
	c, err := a.check(r.Context(), t, u, verb)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, c)
}

// carryVersion sets the loaded resourceVersion on an update, refusing when
// the object changed (or was re-created) since it was loaded.
func (t *target) carryVersion(ctx context.Context, u *unstructured.Unstructured, b ObjectRequest) error {
	cur, err := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns).Get(ctx, u.GetName(), metav1.GetOptions{})
	if err != nil {
		return err
	}
	if b.UID == "" || string(cur.GetUID()) != b.UID || (b.ResourceVersion != "" && cur.GetResourceVersion() != b.ResourceVersion) {
		return errorf(http.StatusConflict, "%s %s changed since it was loaded; reload it (your edits stay in the editor)", t.object.Kind, u.GetName())
	}
	u.SetResourceVersion(cur.GetResourceVersion())
	u.SetUID(cur.GetUID())
	// Keep what the editor does not own.
	u.SetLabels(mergeStrings(cur.GetLabels(), u.GetLabels()))
	u.SetAnnotations(mergeStrings(nil, u.GetAnnotations()))
	return nil
}

func mergeStrings(base, over map[string]string) map[string]string {
	if base == nil && over == nil {
		return nil
	}
	out := map[string]string{}
	for k, v := range base {
		out[k] = v
	}
	for k, v := range over {
		out[k] = v
	}
	return out
}

func (a *ObjectAPI) create(w http.ResponseWriter, r *http.Request) {
	a.write(w, r, v1alpha1.ObjectCreate)
}

func (a *ObjectAPI) update(w http.ResponseWriter, r *http.Request) {
	a.write(w, r, v1alpha1.ObjectUpdate)
}

func (a *ObjectAPI) write(w http.ResponseWriter, r *http.Request, verb v1alpha1.ObjectVerb) {
	var b ObjectRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id, ns, name := r.PathValue("id"), r.PathValue("namespace"), r.PathValue("name")
	op := a.auditOp(r, id, ns, name, verb)
	if b.Object != nil {
		if n, _ := b.Object["metadata"].(map[string]any); n != nil && op.Name == "" {
			op.Name, _ = n["name"].(string)
			if op.Name == "" {
				op.Name, _ = n["generateName"].(string)
			}
		}
	}
	var checked Checked
	var written *unstructured.Unstructured
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		t, err := a.resolve(ctx, r, verb)
		if err != nil {
			return "", err
		}
		u, err := t.prepare(b.Object, name)
		if err != nil {
			return "", err
		}
		if verb == v1alpha1.ObjectUpdate {
			if err := t.carryVersion(ctx, u, b); err != nil {
				return "", err
			}
		}
		if checked, err = a.check(ctx, t, u, verb); err != nil {
			return "", err
		}
		if len(checked.Problems) > 0 {
			return "", fmt.Errorf("%w: %w", audit.ErrDenied, problemsError(checked))
		}
		res := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns)
		if verb == v1alpha1.ObjectCreate {
			written, err = res.Create(ctx, u, metav1.CreateOptions{FieldManager: "capybara"})
		} else {
			written, err = res.Update(ctx, u, metav1.UpdateOptions{FieldManager: "capybara"})
		}
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("%s %s %s", pastTense(verb), t.object.Kind, written.GetName()), nil
	})
	if err != nil {
		var ae *apiError
		if errors.As(err, &ae) {
			writeErr(w, ae)
			return
		}
		writeObjectErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"object": written.Object, "warnings": checked.Warnings})
}

func (a *ObjectAPI) remove(w http.ResponseWriter, r *http.Request) {
	id, ns, name := r.PathValue("id"), r.PathValue("namespace"), r.PathValue("name")
	uid, modeName := r.URL.Query().Get("uid"), r.URL.Query().Get("mode")
	op := a.auditOp(r, id, ns, name, v1alpha1.ObjectDelete)
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		t, err := a.resolve(ctx, r, v1alpha1.ObjectDelete)
		if err != nil {
			return "", err
		}
		res := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns)
		cur, err := res.Get(ctx, name, metav1.GetOptions{})
		if err != nil {
			return "", err
		}
		if uid == "" || string(cur.GetUID()) != uid {
			return "", errorf(http.StatusConflict, "%s %s changed since it was loaded (uid mismatch); reload and try again", t.object.Kind, name)
		}
		curUID := cur.GetUID()
		detail := ""
		if len(t.object.DeleteModes) > 0 {
			i := slices.IndexFunc(t.object.DeleteModes, func(m v1alpha1.DeleteMode) bool { return m.Name == modeName })
			if i < 0 {
				var names []string
				for _, m := range t.object.DeleteModes {
					names = append(names, m.Name)
				}
				return "", errorf(http.StatusBadRequest, "choose how to delete %s %s (mode: %s)", t.object.Kind, name, strings.Join(names, " or "))
			}
			mode := t.object.DeleteModes[i]
			if err := setFinalizers(ctx, res, cur, mode); err != nil {
				return "", err
			}
			detail = " (" + mode.Title + ")"
		} else if modeName != "" {
			return "", errorf(http.StatusBadRequest, "%s has no delete modes", t.object.Kind)
		}
		if err := res.Delete(ctx, name, metav1.DeleteOptions{Preconditions: &metav1.Preconditions{UID: &curUID}}); err != nil {
			return "", err
		}
		return fmt.Sprintf("deleted %s %s%s", t.object.Kind, name, detail), nil
	})
	if err != nil {
		writeObjectErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"ok": true})
}

// setFinalizers makes the object's finalizers what a delete mode needs
// (guarded by its resourceVersion), so the tool does (or does not) remove
// what the object deployed.
func setFinalizers(ctx context.Context, res dynamic.ResourceInterface, cur *unstructured.Unstructured, mode v1alpha1.DeleteMode) error {
	have := cur.GetFinalizers()
	want := slices.DeleteFunc(slices.Clone(have), func(f string) bool { return slices.Contains(mode.RemoveFinalizers, f) })
	for _, f := range mode.EnsureFinalizers {
		if !slices.Contains(want, f) {
			want = append(want, f)
		}
	}
	if slices.Equal(have, want) {
		return nil
	}
	if want == nil {
		want = []string{}
	}
	patch, _ := json.Marshal(map[string]any{"metadata": map[string]any{"finalizers": want, "resourceVersion": cur.GetResourceVersion()}})
	_, err := res.Patch(ctx, cur.GetName(), types.MergePatchType, patch, metav1.PatchOptions{FieldManager: "capybara"})
	return err
}

// CleanupRequest asks to keep only the newest Keep finished objects per group.
type CleanupRequest struct {
	Keep int `json:"keep"`
	// Group limits the cleanup to one group (e.g. one Pipeline).
	Group string `json:"group,omitempty"`
	// DryRun lists what would be deleted.
	DryRun bool `json:"dryRun,omitempty"`
}

func (a *ObjectAPI) cleanup(w http.ResponseWriter, r *http.Request) {
	var b CleanupRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	if b.Keep < 0 || b.Keep > 1000 {
		writeErr(w, errorf(http.StatusBadRequest, "keep must be between 0 and 1000"))
		return
	}
	ctx := r.Context()
	t, err := a.resolve(ctx, r, v1alpha1.ObjectDelete)
	if err != nil {
		writeObjectErr(w, err)
		return
	}
	if t.object.Cleanup == nil {
		writeErr(w, errorf(http.StatusNotFound, "%s cannot be cleaned up in bulk", t.object.Kind))
		return
	}
	res := t.dyn.Resource(t.gvr(t.object)).Namespace(t.ns)
	list, err := res.List(ctx, metav1.ListOptions{})
	if err != nil {
		writeObjectErr(w, err)
		return
	}
	groups := map[string][]unstructured.Unstructured{}
	for _, o := range list.Items {
		g := o.GetLabels()[t.object.Cleanup.GroupLabel]
		if (b.Group != "" && g != b.Group) || !finished(&o, t.object.Cleanup.FinishedCondition) {
			continue
		}
		groups[g] = append(groups[g], o)
	}
	var doomed []unstructured.Unstructured
	for _, items := range groups {
		sort.Slice(items, func(i, j int) bool {
			return items[i].GetCreationTimestamp().After(items[j].GetCreationTimestamp().Time)
		})
		if len(items) > b.Keep {
			doomed = append(doomed, items[b.Keep:]...)
		}
	}
	sort.Slice(doomed, func(i, j int) bool { return doomed[i].GetName() < doomed[j].GetName() })
	names := make([]string, 0, len(doomed))
	for _, o := range doomed {
		names = append(names, o.GetName())
	}
	if b.DryRun {
		httpjson.Write(w, http.StatusOK, map[string]any{"deleted": names, "dryRun": true})
		return
	}
	var deleted []string
	for _, o := range doomed {
		op := audit.Op{Cluster: t.cluster, Namespace: t.ns, Kind: t.object.Kind, Name: o.GetName(), Action: t.action(v1alpha1.ObjectDelete)}
		uid := o.GetUID()
		err := a.Auditor.Do(ctx, op, func(ctx context.Context) (string, error) {
			if err := res.Delete(ctx, o.GetName(), metav1.DeleteOptions{Preconditions: &metav1.Preconditions{UID: &uid}}); err != nil && !apierrors.IsNotFound(err) {
				return "", err
			}
			return fmt.Sprintf("cleanup: deleted finished %s %s (keeping the newest %d per %s)", t.object.Kind, o.GetName(), b.Keep, t.object.Cleanup.GroupLabel), nil
		})
		if err != nil {
			writeObjectErr(w, err)
			return
		}
		deleted = append(deleted, o.GetName())
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"deleted": deleted})
}

// finished: the condition is True or False (not Unknown or missing).
func finished(o *unstructured.Unstructured, condition string) bool {
	conds, _, _ := unstructured.NestedSlice(o.Object, "status", "conditions")
	for _, c := range conds {
		m, _ := c.(map[string]any)
		if m["type"] == condition {
			return m["status"] == "True" || m["status"] == "False"
		}
	}
	return false
}

func pastTense(v v1alpha1.ObjectVerb) string {
	switch v {
	case v1alpha1.ObjectCreate:
		return "created"
	case v1alpha1.ObjectUpdate:
		return "updated"
	}
	return "deleted"
}

// writeObjectErr maps errors to responses (a refused write keeps its
// problems in the body).
func writeObjectErr(w http.ResponseWriter, err error) {
	var ae *apiError
	if errors.As(err, &ae) {
		writeErr(w, ae)
		return
	}
	var status apierrors.APIStatus
	if errors.As(err, &status) && !errors.Is(err, audit.ErrUnavailable) {
		s := status.Status()
		code := int(s.Code)
		if code < 400 || code > 599 {
			code = http.StatusBadGateway
		}
		httpjson.Write(w, code, map[string]any{"error": s.Message})
		return
	}
	writeErr(w, err)
}

// auditOp names the audited action as the plugin declares it (e.g.
// tekton.start for creating a PipelineRun) and the object's kind, before
// anything is checked, so refused attempts are recorded the same way.
func (a *ObjectAPI) auditOp(r *http.Request, id, ns, name string, verb v1alpha1.ObjectVerb) audit.Op {
	pluginName, objName := r.PathValue("plugin"), r.PathValue("object")
	op := audit.Op{Cluster: id, Namespace: ns, Name: name, Action: pluginName + "." + string(verb)}
	var p v1alpha1.Plugin
	if a.Mgmt != nil && a.Mgmt.Get(r.Context(), types.NamespacedName{Name: pluginName}, &p) == nil {
		if i := slices.IndexFunc(p.Spec.Objects, func(o v1alpha1.PluginObject) bool { return o.Name == objName }); i >= 0 {
			t := target{plugin: &p, object: p.Spec.Objects[i]}
			op.Action, op.Kind = t.action(verb), t.object.Kind
		}
	}
	return op
}

// Governs names the plugin (its display name) whose declared objects
// include group/resource, or "". Core's generic Edit YAML and Delete refuse
// such kinds: their writes go through the plugin's validated pages.
func (a *ObjectAPI) Governs(ctx context.Context, group, resource string) string {
	if a == nil || a.Mgmt == nil {
		return ""
	}
	var plugins v1alpha1.PluginList
	if err := a.Mgmt.List(ctx, &plugins); err != nil {
		return ""
	}
	for _, p := range plugins.Items {
		for _, o := range p.Spec.Objects {
			if o.Group == group && o.Resource == resource {
				return p.Spec.DisplayName
			}
		}
	}
	return ""
}
