package cluster

import (
	"context"
	"errors"
	"fmt"
	"regexp"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/utils/ptr"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
)

var idPattern = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`)

// ErrExists means a cluster with that id is already registered.
var ErrExists = errors.New("a cluster with this id is already registered")

// RegisterRequest describes a cluster to register.
type RegisterRequest struct {
	ID          string
	DisplayName string
	Environment v1alpha1.Environment
	Kubeconfig  []byte
}

// SecretName is the kubeconfig Secret's name for a cluster id.
func SecretName(id string) string { return id + "-kubeconfig" }

func validEnvironment(e v1alpha1.Environment) bool {
	return e == v1alpha1.EnvDev || e == v1alpha1.EnvUAT || e == v1alpha1.EnvProd
}

// InputError is a bad request that is not about the kubeconfig itself.
type InputError struct{ Msg string }

func (e *InputError) Error() string { return e.Msg }

// Register validates the kubeconfig, then creates the Cluster and its
// kubeconfig Secret (owned by the Cluster) in capybara-mgmt. Nothing is
// created if validation fails; a failed Secret rolls the Cluster back.
func Register(ctx context.Context, c client.Client, req RegisterRequest, opts ValidateOptions) (*Summary, error) {
	if !idPattern.MatchString(req.ID) {
		return nil, &InputError{Msg: "id must be a DNS label (lowercase letters, digits, -; max 63)"}
	}
	if !validEnvironment(req.Environment) {
		return nil, &InputError{Msg: "environment must be dev, uat or prod"}
	}
	_, summary, err := ParseKubeconfig(req.Kubeconfig, opts)
	if err != nil {
		return nil, err
	}
	if err := ensureSystemNamespace(ctx, c); err != nil {
		return nil, err
	}

	cl := &v1alpha1.Cluster{
		ObjectMeta: metav1.ObjectMeta{Name: req.ID},
		Spec: v1alpha1.ClusterSpec{
			DisplayName: req.DisplayName, Environment: req.Environment,
			KubeconfigSecret: v1alpha1.SecretRef{Name: SecretName(req.ID)},
		},
	}
	if err := c.Create(ctx, cl); err != nil {
		if apierrors.IsAlreadyExists(err) {
			return nil, ErrExists
		}
		return nil, err
	}
	secret := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: v1alpha1.SystemNamespace, Name: SecretName(req.ID),
			Labels: map[string]string{v1alpha1.LabelCluster: req.ID, v1alpha1.LabelManagedBy: v1alpha1.ManagedByValue},
			OwnerReferences: []metav1.OwnerReference{{
				APIVersion: v1alpha1.GroupVersion.String(), Kind: "Cluster", Name: cl.Name, UID: cl.UID,
				BlockOwnerDeletion: ptr.To(true),
			}},
		},
		Type: v1alpha1.KubeconfigSecretType,
		Data: map[string][]byte{v1alpha1.KubeconfigKey: req.Kubeconfig},
	}
	if err := c.Create(ctx, secret); err != nil {
		_ = c.Delete(context.WithoutCancel(ctx), cl)
		return nil, fmt.Errorf("store kubeconfig: %w", err)
	}
	return summary, nil
}

// ReplaceKubeconfig validates new credentials and swaps them in; the
// registry then rebuilds the clients and restarts the cluster's watches.
func ReplaceKubeconfig(ctx context.Context, c client.Client, id string, raw []byte, opts ValidateOptions) (*Summary, error) {
	_, summary, err := ParseKubeconfig(raw, opts)
	if err != nil {
		return nil, err
	}
	var cl v1alpha1.Cluster
	if err := c.Get(ctx, types.NamespacedName{Name: id}, &cl); err != nil {
		if apierrors.IsNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	var secret corev1.Secret
	key := types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: cl.Spec.KubeconfigSecret.Name}
	if err := c.Get(ctx, key, &secret); err != nil {
		return nil, fmt.Errorf("kubeconfig secret: %w", err)
	}
	if secret.Type != v1alpha1.KubeconfigSecretType {
		return nil, fmt.Errorf("secret %s is not a kubeconfig secret", secret.Name)
	}
	secret.Data = map[string][]byte{v1alpha1.KubeconfigKey: raw}
	if err := c.Update(ctx, &secret); err != nil {
		return nil, err
	}
	return summary, nil
}

// UpdateInfo changes a cluster's display name and/or environment.
func UpdateInfo(ctx context.Context, c client.Client, id string, displayName *string, env *v1alpha1.Environment) (*v1alpha1.Cluster, error) {
	var cl v1alpha1.Cluster
	if err := c.Get(ctx, types.NamespacedName{Name: id}, &cl); err != nil {
		if apierrors.IsNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if env != nil {
		if !validEnvironment(*env) {
			return nil, &InputError{Msg: "environment must be dev, uat or prod"}
		}
		cl.Spec.Environment = *env
	}
	if displayName != nil {
		cl.Spec.DisplayName = *displayName
	}
	return &cl, c.Update(ctx, &cl)
}

// Unregister deletes the Cluster and its kubeconfig Secret.
func Unregister(ctx context.Context, c client.Client, id string) error {
	var cl v1alpha1.Cluster
	if err := c.Get(ctx, types.NamespacedName{Name: id}, &cl); err != nil {
		if apierrors.IsNotFound(err) {
			return ErrNotFound
		}
		return err
	}
	if err := c.Delete(ctx, &cl); err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	// Owned by the Cluster, so garbage collection would remove it too;
	// delete it now rather than wait.
	secret := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: cl.Spec.KubeconfigSecret.Name}}
	if err := c.Delete(ctx, secret); err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	return nil
}

func ensureSystemNamespace(ctx context.Context, c client.Client) error {
	ns := &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.SystemNamespace}}
	if err := c.Create(ctx, ns); err != nil && !apierrors.IsAlreadyExists(err) {
		return err
	}
	return nil
}
