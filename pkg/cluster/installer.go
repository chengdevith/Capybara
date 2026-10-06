package cluster

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sync"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
	toolscache "k8s.io/client-go/tools/cache"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
)

// ErrNoInstaller means a cluster has no installer credential: plugin
// installs are disabled there.
var ErrNoInstaller = errors.New("no installer credential for this cluster; plugin installs are disabled")

// InstallerSecretName is the installer Secret for a cluster.
func InstallerSecretName(id string) string { return id + "-installer" }

// Installers holds each cluster's optional installer credential. Only the
// plugin controller has one: it reads installer Secrets through its own
// cache (InstallerCache), which the API server never builds, so the
// console's proxy cannot reach these credentials.
type Installers struct {
	opts   ValidateOptions
	logger *slog.Logger

	mu      sync.RWMutex
	entries map[string]installerEntry
	subs    []func(id string)
}

type installerEntry struct {
	version string
	config  *rest.Config
	summary *Summary
	err     error
}

// NewInstallers returns an empty store; SyncInstallers fills it.
func NewInstallers(opts ValidateOptions, logger *slog.Logger) *Installers {
	return &Installers{opts: opts, logger: logger, entries: map[string]installerEntry{}}
}

// Subscribe registers fn, called with a cluster id when its installer
// credential appears, changes or goes away. fn must not block.
func (s *Installers) Subscribe(fn func(id string)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.subs = append(s.subs, fn)
}

// Get returns the installer REST config for a cluster.
func (s *Installers) Get(id string) (*rest.Config, *Summary, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	e, ok := s.entries[id]
	if !ok {
		return nil, nil, ErrNoInstaller
	}
	if e.err != nil {
		return nil, nil, e.err
	}
	return rest.CopyConfig(e.config), e.summary, nil
}

// Set records the installer Secret of a cluster (nil: none).
func (s *Installers) Set(id string, secret *corev1.Secret) {
	s.mu.Lock()
	old, had := s.entries[id]
	if secret == nil {
		delete(s.entries, id)
		s.mu.Unlock()
		if had {
			s.notify(id)
		}
		return
	}
	if had && old.version == secret.ResourceVersion {
		s.mu.Unlock()
		return
	}
	e := installerEntry{version: secret.ResourceVersion}
	if secret.Type != v1alpha1.InstallerSecretType {
		e.err = fmt.Errorf("installer secret %s is not of type %s", secret.Name, v1alpha1.InstallerSecretType)
	} else if cfg, summary, err := RESTConfigFromKubeconfig(secret.Data[v1alpha1.KubeconfigKey], s.opts); err != nil {
		e.err = fmt.Errorf("installer kubeconfig: %w", err)
	} else {
		cfg.UserAgent = "capybara-installer"
		e.config, e.summary = cfg, summary
	}
	s.entries[id] = e
	s.mu.Unlock()
	if e.err != nil {
		s.logger.Warn("installer credential unusable", "cluster", id, "err", e.err)
	} else {
		s.logger.Info("installer credential loaded", "cluster", id)
	}
	s.notify(id)
}

func (s *Installers) notify(id string) {
	s.mu.RLock()
	subs := append([]func(string){}, s.subs...)
	s.mu.RUnlock()
	for _, fn := range subs {
		fn(id)
	}
}

// NewInstallerCache builds the controller's separate cache for installer
// Secrets (only that type, only in capybara-system) and Clusters.
func NewInstallerCache(cfg *rest.Config, scheme *runtime.Scheme) (cache.Cache, error) {
	return cache.New(cfg, cache.Options{Scheme: scheme, ByObject: map[client.Object]cache.ByObject{
		&corev1.Secret{}: {
			Namespaces: map[string]cache.Config{v1alpha1.SystemNamespace: {}},
			Field:      fields.OneTermEqualSelector("type", v1alpha1.InstallerSecretType),
		},
	}})
}

// SyncInstallers keeps s in step with Clusters' installer Secrets, reading
// through c (from NewInstallerCache). It runs until ctx ends.
func SyncInstallers(ctx context.Context, c cache.Cache, s *Installers) error {
	clusterInf, err := c.GetInformer(ctx, &v1alpha1.Cluster{})
	if err != nil {
		return err
	}
	secretInf, err := c.GetInformer(ctx, &corev1.Secret{})
	if err != nil {
		return err
	}
	resync := func(id string) {
		var cl v1alpha1.Cluster
		if err := c.Get(ctx, types.NamespacedName{Name: id}, &cl); err != nil {
			if apierrors.IsNotFound(err) {
				s.Set(id, nil)
			}
			return
		}
		if cl.Spec.InstallerSecret == nil {
			s.Set(id, nil)
			return
		}
		var secret corev1.Secret
		err := c.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: cl.Spec.InstallerSecret.Name}, &secret)
		switch {
		case err == nil:
			s.Set(id, &secret)
		case apierrors.IsNotFound(err):
			s.Set(id, nil)
		}
	}
	resyncAll := func(string) {
		var list v1alpha1.ClusterList
		if err := c.List(ctx, &list); err == nil {
			for _, cl := range list.Items {
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
	h := func(fn func(string)) toolscache.ResourceEventHandlerFuncs {
		return toolscache.ResourceEventHandlerFuncs{
			AddFunc:    func(o any) { fn(nameOf(o)) },
			UpdateFunc: func(_, o any) { fn(nameOf(o)) },
			DeleteFunc: func(o any) { fn(nameOf(o)) },
		}
	}
	if _, err := clusterInf.AddEventHandler(h(resync)); err != nil {
		return err
	}
	if _, err := secretInf.AddEventHandler(h(resyncAll)); err != nil {
		return err
	}
	if !c.WaitForCacheSync(ctx) {
		return errors.New("installer cache did not sync")
	}
	resyncAll("")
	<-ctx.Done()
	return nil
}
