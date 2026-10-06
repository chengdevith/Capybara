package plugin

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	authnv1 "k8s.io/api/authentication/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
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

func ensureNamespace(ctx context.Context, cs kubernetes.Interface, ns string) error {
	_, err := cs.CoreV1().Namespaces().Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: ns}}, metav1.CreateOptions{})
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
// release (namespace/name of the Helm release annotations), sorted.
func ForeignObjects(ctx context.Context, dyn dynamic.Interface, crdNames []string, release, releaseNS string) ([]string, error) {
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
