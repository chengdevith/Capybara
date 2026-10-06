package cluster

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/types"
	toolscache "k8s.io/client-go/tools/cache"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
)

// CacheOptions limits what a capybara-mgmt cache holds: Secrets only of the
// kubeconfig type, only in capybara-system. Capybara never caches any other
// Secret.
func CacheOptions() map[client.Object]cache.ByObject {
	return map[client.Object]cache.ByObject{
		&corev1.Secret{}: {
			Namespaces: map[string]cache.Config{v1alpha1.SystemNamespace: {}},
			Field:      fields.OneTermEqualSelector("type", v1alpha1.KubeconfigSecretType),
		},
	}
}

// Sync keeps reg in step with the Cluster resources and their kubeconfig
// Secrets in capybara-mgmt, reading through c (a cache built with
// CacheOptions). It returns once the cache has synced and the registry is
// filled; updates keep flowing until ctx ends.
func Sync(ctx context.Context, c cache.Cache, reg *Registry, logger *slog.Logger) error {
	clusterInf, err := c.GetInformer(ctx, &v1alpha1.Cluster{})
	if err != nil {
		return fmt.Errorf("watch clusters: %w", err)
	}
	secretInf, err := c.GetInformer(ctx, &corev1.Secret{})
	if err != nil {
		return fmt.Errorf("watch kubeconfig secrets: %w", err)
	}

	resync := func(id string) {
		var cl v1alpha1.Cluster
		if err := c.Get(ctx, types.NamespacedName{Name: id}, &cl); err != nil {
			if apierrors.IsNotFound(err) {
				reg.Remove(id)
			} else {
				logger.Warn("cluster sync failed", "cluster", id, "err", err)
			}
			return
		}
		var secret *corev1.Secret
		var s corev1.Secret
		err := c.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: cl.Spec.KubeconfigSecret.Name}, &s)
		switch {
		case err == nil:
			secret = &s
		case !apierrors.IsNotFound(err):
			logger.Warn("kubeconfig secret sync failed", "cluster", id, "err", err)
			return
		}
		reg.Upsert(&cl, secret)
	}
	// A Secret change concerns every Cluster that references it.
	resyncForSecret := func(name string) {
		var list v1alpha1.ClusterList
		if err := c.List(ctx, &list); err != nil {
			return
		}
		for _, cl := range list.Items {
			if cl.Spec.KubeconfigSecret.Name == name {
				resync(cl.Name)
			}
		}
	}

	nameOf := func(obj any) string {
		if d, ok := obj.(toolscache.DeletedFinalStateUnknown); ok {
			obj = d.Obj
		}
		if o, ok := obj.(client.Object); ok {
			return o.GetName()
		}
		return ""
	}
	handler := func(fn func(string)) toolscache.ResourceEventHandlerFuncs {
		return toolscache.ResourceEventHandlerFuncs{
			AddFunc:    func(obj any) { fn(nameOf(obj)) },
			UpdateFunc: func(_, obj any) { fn(nameOf(obj)) },
			DeleteFunc: func(obj any) { fn(nameOf(obj)) },
		}
	}
	if _, err := clusterInf.AddEventHandler(handler(resync)); err != nil {
		return err
	}
	if _, err := secretInf.AddEventHandler(handler(resyncForSecret)); err != nil {
		return err
	}
	if !c.WaitForCacheSync(ctx) {
		return errors.New("capybara-mgmt cache did not sync")
	}
	// Fill the registry now, so it is complete when Sync returns (event
	// handlers may still be catching up; repeats are no-ops).
	var list v1alpha1.ClusterList
	if err := c.List(ctx, &list); err != nil {
		return fmt.Errorf("list clusters: %w", err)
	}
	for _, cl := range list.Items {
		resync(cl.Name)
	}
	return nil
}
