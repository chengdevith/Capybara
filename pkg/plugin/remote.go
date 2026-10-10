package plugin

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"sort"
	"strings"
	"time"

	authnv1 "k8s.io/api/authentication/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/utils/ptr"

	"github.com/capybara/capybara/api/v1alpha1"
)

func pluginLabels(plugin, clusterID string) map[string]string {
	return map[string]string{
		v1alpha1.LabelPlugin: plugin, v1alpha1.LabelPluginCluster: clusterID,
		v1alpha1.LabelManagedBy: v1alpha1.ManagedByValue,
	}
}

// ensureGeneratedSecrets creates the plugin's generated Secrets in ns.
// Existing ones are kept (a random password is created once).
func ensureGeneratedSecrets(ctx context.Context, cs kubernetes.Interface, ns, plugin string, secrets []v1alpha1.GeneratedSecret) error {
	for _, g := range secrets {
		_, err := cs.CoreV1().Secrets(ns).Get(ctx, g.Name, metav1.GetOptions{})
		if err == nil {
			continue
		}
		if !apierrors.IsNotFound(err) {
			return err
		}
		data := map[string][]byte{}
		for _, k := range g.Keys {
			if k.Random {
				b := make([]byte, 32)
				if _, err := rand.Read(b); err != nil {
					return err
				}
				data[k.Name] = []byte(base64.RawURLEncoding.EncodeToString(b))
			} else {
				data[k.Name] = []byte(k.Value)
			}
		}
		s := &corev1.Secret{
			ObjectMeta: metav1.ObjectMeta{Name: g.Name, Namespace: ns, Labels: map[string]string{v1alpha1.LabelPlugin: plugin, v1alpha1.LabelManagedBy: v1alpha1.ManagedByValue}},
			Type:       corev1.SecretTypeOpaque, Data: data,
		}
		if _, err := cs.CoreV1().Secrets(ns).Create(ctx, s, metav1.CreateOptions{}); err != nil && !apierrors.IsAlreadyExists(err) {
			return fmt.Errorf("create secret %s: %w", g.Name, err)
		}
	}
	return nil
}

func ensureNamespace(ctx context.Context, cs kubernetes.Interface, ns string, labels map[string]string) error {
	_, err := cs.CoreV1().Namespaces().Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: ns, Labels: labels}}, metav1.CreateOptions{})
	if apierrors.IsAlreadyExists(err) && len(labels) > 0 {
		patch, err := json.Marshal(map[string]any{"metadata": map[string]any{"labels": labels}})
		if err != nil {
			return err
		}
		_, err = cs.CoreV1().Namespaces().Patch(ctx, ns, types.MergePatchType, patch, metav1.PatchOptions{FieldManager: "capybara-controller"})
		return err
	}
	if apierrors.IsAlreadyExists(err) || apierrors.IsForbidden(err) {
		// Forbidden: connect mode may not create namespaces; the service's
		// namespace exists anyway.
		return nil
	}
	return err
}

// ensureBackendAccount creates (or updates) the backend's ServiceAccount,
// Role (get services/proxy on exactly the declared services) and
// RoleBinding in ns, with the installer credential.
func ensureBackendAccount(ctx context.Context, cs kubernetes.Interface, ns, plugin, clusterID string, rules []rbacv1.PolicyRule) error {
	name := BackendAccount(plugin)
	labels := pluginLabels(plugin, clusterID)
	sa := &corev1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns, Labels: labels}}
	if _, err := cs.CoreV1().ServiceAccounts(ns).Create(ctx, sa, metav1.CreateOptions{}); err != nil && !apierrors.IsAlreadyExists(err) {
		return fmt.Errorf("backend service account: %w", err)
	}
	role := &rbacv1.Role{ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns, Labels: labels}, Rules: rules}
	if _, err := cs.RbacV1().Roles(ns).Create(ctx, role, metav1.CreateOptions{}); apierrors.IsAlreadyExists(err) {
		existing, gerr := cs.RbacV1().Roles(ns).Get(ctx, name, metav1.GetOptions{})
		if gerr != nil {
			return gerr
		}
		existing.Rules = rules
		if _, err := cs.RbacV1().Roles(ns).Update(ctx, existing, metav1.UpdateOptions{}); err != nil {
			// Update needs `update`; connect installers only have patch.
			if !apierrors.IsForbidden(err) {
				return fmt.Errorf("backend role: %w", err)
			}
			if err := patchRole(ctx, cs, ns, name, rules); err != nil {
				return err
			}
		}
	} else if err != nil {
		return fmt.Errorf("backend role: %w", err)
	}
	rb := &rbacv1.RoleBinding{
		ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns, Labels: labels},
		RoleRef:    rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "Role", Name: name},
		Subjects:   []rbacv1.Subject{{Kind: "ServiceAccount", Name: name, Namespace: ns}},
	}
	if _, err := cs.RbacV1().RoleBindings(ns).Create(ctx, rb, metav1.CreateOptions{}); err != nil && !apierrors.IsAlreadyExists(err) {
		return fmt.Errorf("backend role binding: %w", err)
	}
	return nil
}

func patchRole(ctx context.Context, cs kubernetes.Interface, ns, name string, rules []rbacv1.PolicyRule) error {
	role := &rbacv1.Role{TypeMeta: metav1.TypeMeta{APIVersion: "rbac.authorization.k8s.io/v1", Kind: "Role"},
		ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns}, Rules: rules}
	body, err := jsonMarshal(role)
	if err != nil {
		return err
	}
	_, err = cs.RbacV1().Roles(ns).Patch(ctx, name, "application/apply-patch+yaml", body,
		metav1.PatchOptions{FieldManager: "capybara-controller", Force: ptr.To(true)})
	return err
}

// deleteBackendAccount removes the backend's account (tokens stop working).
func deleteBackendAccount(ctx context.Context, cs kubernetes.Interface, ns, plugin string) error {
	name := BackendAccount(plugin)
	for _, del := range []func() error{
		func() error { return cs.RbacV1().RoleBindings(ns).Delete(ctx, name, metav1.DeleteOptions{}) },
		func() error { return cs.RbacV1().Roles(ns).Delete(ctx, name, metav1.DeleteOptions{}) },
		func() error { return cs.CoreV1().ServiceAccounts(ns).Delete(ctx, name, metav1.DeleteOptions{}) },
	} {
		if err := del(); err != nil && !apierrors.IsNotFound(err) {
			return err
		}
	}
	return nil
}

// mintToken requests a short-lived token for the backend's account.
func mintToken(ctx context.Context, cs kubernetes.Interface, ns, plugin string, ttl time.Duration) (string, time.Time, error) {
	req := &authnv1.TokenRequest{Spec: authnv1.TokenRequestSpec{ExpirationSeconds: ptr.To(int64(ttl.Seconds()))}}
	out, err := cs.CoreV1().ServiceAccounts(ns).CreateToken(ctx, BackendAccount(plugin), req, metav1.CreateOptions{})
	if err != nil {
		return "", time.Time{}, fmt.Errorf("backend token: %w", err)
	}
	return out.Status.Token, out.Status.ExpirationTimestamp.Time, nil
}

// TokenConfig is base (a cluster's REST config) with its credentials
// replaced by a plugin's bearer token.
func TokenConfig(base *rest.Config, token string) *rest.Config {
	cfg := rest.AnonymousClientConfig(base)
	cfg.BearerToken = token
	return cfg
}

// ServiceGet does a GET through the Kubernetes service proxy with cfg.
func ServiceGet(ctx context.Context, cfg *rest.Config, s Service, pathAndQuery string) (int, []byte, error) {
	hc, err := rest.HTTPClientFor(cfg)
	if err != nil {
		return 0, nil, err
	}
	u := strings.TrimRight(cfg.Host, "/") + ServiceProxyPath(s, pathAndQuery)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return 0, nil, err
	}
	resp, err := hc.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close() //nolint:errcheck
	body, err := readLimited(resp.Body, 4<<20)
	return resp.StatusCode, body, err
}

// ServiceProxyPath is the API path for a request through the service proxy.
func ServiceProxyPath(s Service, pathAndQuery string) string {
	return "/api/v1/namespaces/" + s.Namespace + "/services/" + s.ProxyName() + "/proxy" + pathAndQuery
}

// ForeignObjects lists objects of the given CRDs not created by the
// release (namespace/name of the Helm release annotations) nor labelled as
// the plugin's (generated per-Project objects, chart hooks), sorted.
func ForeignObjects(ctx context.Context, dyn dynamic.Interface, crdNames []string, plugin, release, releaseNS string) ([]string, error) {
	crdGVR := schema.GroupVersionResource{Group: "apiextensions.k8s.io", Version: "v1", Resource: "customresourcedefinitions"}
	var out []string
	for _, name := range crdNames {
		crd, err := dyn.Resource(crdGVR).Get(ctx, name, metav1.GetOptions{})
		if apierrors.IsNotFound(err) {
			continue
		}
		if err != nil {
			return nil, err
		}
		group, _, _ := unstructuredString(crd.Object, "spec", "group")
		plural, _, _ := unstructuredString(crd.Object, "spec", "names", "plural")
		kind, _, _ := unstructuredString(crd.Object, "spec", "names", "kind")
		version := storageVersion(crd.Object)
		if version == "" {
			continue
		}
		list, err := dyn.Resource(schema.GroupVersionResource{Group: group, Version: version, Resource: plural}).List(ctx, metav1.ListOptions{})
		if err != nil {
			return nil, fmt.Errorf("list %s: %w", plural, err)
		}
		for _, o := range list.Items {
			a := o.GetAnnotations()
			if a["meta.helm.sh/release-name"] == release && a["meta.helm.sh/release-namespace"] == releaseNS {
				continue
			}
			if o.GetLabels()[v1alpha1.LabelPlugin] == plugin {
				continue
			}
			ref := o.GetName()
			if o.GetNamespace() != "" {
				ref = o.GetNamespace() + "/" + ref
			}
			out = append(out, kind+" "+ref)
		}
	}
	sort.Strings(out)
	return out, nil
}

// HashList is the confirmation hash of a foreign-object list.
func HashList(items []string) string {
	sum := sha256.Sum256([]byte(strings.Join(items, "\n")))
	return hex.EncodeToString(sum[:])
}

func storageVersion(crd map[string]any) string {
	versions, _ := nestedSlice(crd, "spec", "versions")
	for _, v := range versions {
		m, _ := v.(map[string]any)
		if storage, _ := m["storage"].(bool); storage {
			name, _ := m["name"].(string)
			return name
		}
	}
	return ""
}

// applyCRDs server-side applies the chart's CRDs before Helm runs. Helm
// installs crds/ only on first install and never upgrades them, so new
// plugin versions (and reinstalls over kept CRDs) bring their CRDs here.
func applyCRDs(ctx context.Context, inst *rest.Config, crds []*unstructured.Unstructured) error {
	if len(crds) == 0 {
		return nil
	}
	dyn, err := dynamic.NewForConfig(inst)
	if err != nil {
		return err
	}
	gvr := schema.GroupVersionResource{Group: "apiextensions.k8s.io", Version: "v1", Resource: "customresourcedefinitions"}
	for _, crd := range crds {
		body, err := crd.MarshalJSON()
		if err != nil {
			return err
		}
		if _, err := dyn.Resource(gvr).Patch(ctx, crd.GetName(), types.ApplyPatchType, body,
			metav1.PatchOptions{FieldManager: "capybara-controller", Force: ptr.To(true)}); err != nil {
			return fmt.Errorf("apply CRD %s: %w", crd.GetName(), err)
		}
	}
	return nil
}

// subjectFor turns an identity ("system:serviceaccount:ns:name" or a user)
// into an RBAC subject.
func subjectFor(identity string) (rbacv1.Subject, error) {
	if rest, ok := strings.CutPrefix(identity, "system:serviceaccount:"); ok {
		ns, name, ok := strings.Cut(rest, ":")
		if !ok || ns == "" || name == "" {
			return rbacv1.Subject{}, fmt.Errorf("bad service account identity %q", identity)
		}
		return rbacv1.Subject{Kind: "ServiceAccount", Namespace: ns, Name: name}, nil
	}
	if identity == "" {
		return rbacv1.Subject{}, errors.New("the identity of Capybara's account on the cluster is not known yet")
	}
	return rbacv1.Subject{Kind: "User", APIGroup: rbacv1.GroupName, Name: identity}, nil
}

// ensureConsole grants Capybara's own account the plugin's console
// permissions (ClusterRole + binding), with the installer credential.
func ensureConsole(ctx context.Context, cs kubernetes.Interface, plugin, clusterID, identity string, rules []rbacv1.PolicyRule) error {
	if len(rules) == 0 {
		return nil
	}
	subject, err := subjectFor(identity)
	if err != nil {
		return err
	}
	name := ConsoleRole(plugin)
	labels := pluginLabels(plugin, clusterID)
	role := &rbacv1.ClusterRole{TypeMeta: metav1.TypeMeta{APIVersion: "rbac.authorization.k8s.io/v1", Kind: "ClusterRole"},
		ObjectMeta: metav1.ObjectMeta{Name: name, Labels: labels}, Rules: rules}
	binding := &rbacv1.ClusterRoleBinding{TypeMeta: metav1.TypeMeta{APIVersion: "rbac.authorization.k8s.io/v1", Kind: "ClusterRoleBinding"},
		ObjectMeta: metav1.ObjectMeta{Name: name, Labels: labels},
		RoleRef:    rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: name},
		Subjects:   []rbacv1.Subject{subject}}
	opts := metav1.PatchOptions{FieldManager: "capybara-controller", Force: ptr.To(true)}
	body, _ := jsonMarshal(role)
	if _, err := cs.RbacV1().ClusterRoles().Patch(ctx, name, types.ApplyPatchType, body, opts); err != nil {
		return fmt.Errorf("console role: %w", err)
	}
	body, _ = jsonMarshal(binding)
	if _, err := cs.RbacV1().ClusterRoleBindings().Patch(ctx, name, types.ApplyPatchType, body, opts); err != nil {
		return fmt.Errorf("console role binding: %w", err)
	}
	return nil
}

// deleteConsole revokes the console permissions.
func deleteConsole(ctx context.Context, cs kubernetes.Interface, plugin string) error {
	name := ConsoleRole(plugin)
	if err := cs.RbacV1().ClusterRoleBindings().Delete(ctx, name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	if err := cs.RbacV1().ClusterRoles().Delete(ctx, name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	return nil
}

// APIResourceServed reports whether the cluster serves "<group>/<resource>"
// (discovery needs no RBAC).
func APIResourceServed(cs kubernetes.Interface, groupResource string) (bool, error) {
	group, resource, _ := strings.Cut(groupResource, "/")
	groups, err := cs.Discovery().ServerGroups()
	if err != nil {
		return false, err
	}
	for _, g := range groups.Groups {
		if g.Name != group {
			continue
		}
		list, err := cs.Discovery().ServerResourcesForGroupVersion(g.PreferredVersion.GroupVersion)
		if err != nil {
			return false, err
		}
		for _, r := range list.APIResources {
			if r.Name == resource {
				return true, nil
			}
		}
	}
	return false, nil
}

// dryRunCreate asks the API server to accept obj without storing it.
func dryRunCreate(ctx context.Context, cfg *rest.Config, ns string, raw []byte) error {
	var obj unstructured.Unstructured
	if err := obj.UnmarshalJSON(raw); err != nil {
		return err
	}
	gv, err := schema.ParseGroupVersion(obj.GetAPIVersion())
	if err != nil {
		return err
	}
	plural, _ := meta.UnsafeGuessKindToResource(gv.WithKind(obj.GetKind()))
	dyn, err := dynamic.NewForConfig(cfg)
	if err != nil {
		return err
	}
	if obj.GetName() == "" && obj.GetGenerateName() == "" {
		obj.SetGenerateName("capybara-check-")
	}
	_, err = dyn.Resource(plural).Namespace(ns).Create(ctx, &obj, metav1.CreateOptions{DryRun: []string{metav1.DryRunAll}})
	return err
}

// ProjectRole names the ClusterRole holding a plugin's per-Project rules;
// a RoleBinding of the same name grants it in each Project namespace.
func ProjectRole(plugin string) string { return "capybara-plugin-" + plugin + "-project" }

// LabelProjectAccess marks the per-Project RoleBindings and ServiceAccounts
// a plugin created (so stale ones can be found and removed).
const LabelProjectAccess = "platform.capybara.io/plugin-project-access"

// ProjectAccessResult says which Project namespaces got the plugin's
// per-Project access, and which could not (e.g. a ServiceAccount of that
// name exists there and is not Capybara's: it is never adopted).
type ProjectAccessResult struct {
	Granted  []string
	Problems []string
}

// syncProjectAccess makes the plugin's per-Project access exactly the
// given namespaces: the ClusterRole, and in each namespace a RoleBinding
// to Capybara's account plus the declared ServiceAccounts (no permissions;
// no API token unless declared). Stale ones (Projects gone) are removed.
// With the installer credential.
func syncProjectAccess(ctx context.Context, cs kubernetes.Interface, plugin, clusterID, identity string,
	pa *v1alpha1.ProjectAccess, namespaces []string) (ProjectAccessResult, error) {
	var res ProjectAccessResult
	name := ProjectRole(plugin)
	labels := pluginLabels(plugin, clusterID)
	labels[LabelProjectAccess] = "true"
	opts := metav1.PatchOptions{FieldManager: "capybara-controller", Force: ptr.To(true)}
	// Without rules, Capybara's account gets nothing in Projects (the plugin
	// only generates objects or ServiceAccounts there).
	grants := pa != nil && len(pa.Rules) > 0
	if pa != nil && len(namespaces) > 0 {
		var subject rbacv1.Subject
		if grants {
			var err error
			if subject, err = subjectFor(identity); err != nil {
				return res, err
			}
			role := &rbacv1.ClusterRole{TypeMeta: metav1.TypeMeta{APIVersion: "rbac.authorization.k8s.io/v1", Kind: "ClusterRole"},
				ObjectMeta: metav1.ObjectMeta{Name: name, Labels: labels}, Rules: toRBAC(pa.Rules)}
			body, _ := jsonMarshal(role)
			if _, err := cs.RbacV1().ClusterRoles().Patch(ctx, name, types.ApplyPatchType, body, opts); err != nil {
				return res, fmt.Errorf("project role: %w", err)
			}
		}
	nextNamespace:
		for _, ns := range namespaces {
			for _, sa := range pa.ServiceAccounts {
				existing, err := cs.CoreV1().ServiceAccounts(ns).Get(ctx, sa.Name, metav1.GetOptions{})
				if err == nil && existing.Labels[LabelProjectAccess] != "true" {
					res.Problems = append(res.Problems, fmt.Sprintf(
						"%s: a ServiceAccount %q exists there and was not created by Capybara (never adopted)", ns, sa.Name))
					continue nextNamespace
				}
				if err != nil && !apierrors.IsNotFound(err) {
					return res, err
				}
				obj := &corev1.ServiceAccount{TypeMeta: metav1.TypeMeta{APIVersion: "v1", Kind: "ServiceAccount"},
					ObjectMeta:                   metav1.ObjectMeta{Name: sa.Name, Namespace: ns, Labels: labels},
					AutomountServiceAccountToken: ptr.To(sa.AutomountToken)}
				body, _ := jsonMarshal(obj)
				if _, err := cs.CoreV1().ServiceAccounts(ns).Patch(ctx, sa.Name, types.ApplyPatchType, body, opts); err != nil {
					return res, fmt.Errorf("%s: service account %s: %w", ns, sa.Name, err)
				}
			}
			if !grants {
				res.Granted = append(res.Granted, ns)
				continue
			}
			binding := &rbacv1.RoleBinding{TypeMeta: metav1.TypeMeta{APIVersion: "rbac.authorization.k8s.io/v1", Kind: "RoleBinding"},
				ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns, Labels: labels},
				RoleRef:    rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: name},
				Subjects:   []rbacv1.Subject{subject}}
			body, _ := jsonMarshal(binding)
			if _, err := cs.RbacV1().RoleBindings(ns).Patch(ctx, name, types.ApplyPatchType, body, opts); err != nil {
				return res, fmt.Errorf("%s: role binding: %w", ns, err)
			}
			res.Granted = append(res.Granted, ns)
		}
	}

	// Remove what no longer belongs to a Project.
	want := map[string]bool{}
	for _, ns := range res.Granted {
		want[ns] = true
	}
	selector := metav1.ListOptions{LabelSelector: v1alpha1.LabelPlugin + "=" + plugin + "," + LabelProjectAccess + "=true"}
	// A plugin without rules never had bindings or a role (nor may its
	// installer list them).
	ruleless := pa != nil && len(pa.Rules) == 0
	var bindings rbacv1.RoleBindingList
	if !ruleless {
		list, err := cs.RbacV1().RoleBindings("").List(ctx, selector)
		if err != nil {
			return res, fmt.Errorf("list project role bindings: %w", err)
		}
		bindings = *list
	}
	for _, b := range bindings.Items {
		if b.Name == name && !want[b.Namespace] {
			if err := cs.RbacV1().RoleBindings(b.Namespace).Delete(ctx, b.Name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
				return res, err
			}
		}
	}
	// Only plugins that declare ServiceAccounts create them (and may list
	// them: the installer's rules are derived from the manifest).
	var accounts corev1.ServiceAccountList
	if pa != nil && len(pa.ServiceAccounts) > 0 {
		list, err := cs.CoreV1().ServiceAccounts("").List(ctx, selector)
		if err != nil {
			return res, fmt.Errorf("list project service accounts: %w", err)
		}
		accounts = *list
	}
	for _, a := range accounts.Items {
		if !want[a.Namespace] {
			if err := cs.CoreV1().ServiceAccounts(a.Namespace).Delete(ctx, a.Name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
				return res, err
			}
		}
	}
	if !ruleless && (pa == nil || len(res.Granted) == 0) {
		if err := cs.RbacV1().ClusterRoles().Delete(ctx, name, metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
			return res, err
		}
	}
	return res, nil
}

// UninstallBlockers lists the objects (anywhere on the cluster) that keep a
// plugin from being uninstalled, e.g. Argo CD Applications: removing the
// tool under them would orphan them or, if their CRD went too, delete them
// (and with a cascade finalizer, what they deployed). Each line names the
// object; flagged ones carry the blocker's finalizer.
func UninstallBlockers(ctx context.Context, dyn dynamic.Interface, cs kubernetes.Interface, blockers []v1alpha1.UninstallBlocker) ([]string, error) {
	var out []string
	for _, b := range blockers {
		// Not served: nothing can block. (Listing an unserved kind can be
		// refused as forbidden before Kubernetes looks for the kind.)
		served, err := APIResourceServed(cs, b.Group+"/"+b.Resource)
		if err != nil {
			return nil, fmt.Errorf("discover %s: %w", b.Resource, err)
		}
		if !served {
			continue
		}
		list, err := dyn.Resource(schema.GroupVersionResource{Group: b.Group, Version: b.Version, Resource: b.Resource}).List(ctx, metav1.ListOptions{})
		if apierrors.IsNotFound(err) || meta.IsNoMatchError(err) {
			continue // the kind is not served: nothing can block
		}
		if err != nil {
			return nil, fmt.Errorf("list %s: %w", b.Resource, err)
		}
		for _, o := range list.Items {
			line := fmt.Sprintf("%s %s/%s", b.Kind, o.GetNamespace(), o.GetName())
			if b.FlagFinalizer != "" && slices.Contains(o.GetFinalizers(), b.FlagFinalizer) {
				line += " (deletes its resources when deleted)"
			}
			out = append(out, line)
		}
	}
	return out, nil
}

// blockersMessage explains a refused uninstall.
// fieldCheck passes when any of checks finds its value (read with
// Capybara's account; a missing object or field does not pass).
func fieldCheck(ctx context.Context, cfg *rest.Config, checks []v1alpha1.FieldCheck, config map[string]any, pluginNS string) error {
	dyn, err := dynamic.NewForConfig(cfg)
	if err != nil {
		return err
	}
	var seen []string
	for _, c := range checks {
		ns := c.Namespace
		if c.NamespaceKey != "" {
			ns, _ = config[c.NamespaceKey].(string)
		}
		if ns == "" {
			ns = pluginNS
		}
		res := dyn.Resource(schema.GroupVersionResource{Group: c.Group, Version: c.Version, Resource: c.Resource}).Namespace(ns)
		var objs []unstructured.Unstructured
		if c.Name != "" {
			o, err := res.Get(ctx, c.Name, metav1.GetOptions{})
			if err == nil {
				objs = append(objs, *o)
			} else if !apierrors.IsNotFound(err) && !meta.IsNoMatchError(err) {
				return err
			}
		} else {
			list, err := res.List(ctx, metav1.ListOptions{})
			if err == nil {
				objs = list.Items
			} else if !apierrors.IsNotFound(err) && !meta.IsNoMatchError(err) {
				return err
			}
		}
		for _, o := range objs {
			v, ok, _ := unstructured.NestedFieldNoCopy(o.Object, SplitDotted(c.Path)...)
			if !ok {
				continue
			}
			switch v := v.(type) {
			case string:
				for _, part := range strings.Split(v, ",") {
					if strings.TrimSpace(part) == c.Contains {
						return nil
					}
				}
			case []any:
				for _, item := range v {
					if item == c.Contains {
						return nil
					}
				}
			}
		}
		seen = append(seen, fmt.Sprintf("%s %s in %s", c.Path, c.Resource, ns))
	}
	return fmt.Errorf("not set (%s)", strings.Join(seen, "; "))
}

// StepPassed reports whether the installation's step name is done.
func StepPassed(in *v1alpha1.PluginInstallation, name string) bool {
	for _, s := range in.Status.Steps {
		if s.Name == name {
			return s.State == v1alpha1.StepDone
		}
	}
	return false
}

func blockersMessage(blockers []v1alpha1.UninstallBlocker, found []string) string {
	var how []string
	for _, b := range blockers {
		how = append(how, b.Message)
	}
	return fmt.Sprintf("%d object(s) must be deleted first: %s. %s", len(found), strings.Join(found, ", "), strings.Join(how, " "))
}
