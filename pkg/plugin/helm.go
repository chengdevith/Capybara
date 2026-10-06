package plugin

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"helm.sh/helm/v4/pkg/action"
	chart "helm.sh/helm/v4/pkg/chart/v2"
	"helm.sh/helm/v4/pkg/kube"
	releasecommon "helm.sh/helm/v4/pkg/release/common"
	releasev1 "helm.sh/helm/v4/pkg/release/v1"
	"helm.sh/helm/v4/pkg/storage/driver"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/cli-runtime/pkg/genericclioptions"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/discovery/cached/memory"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/restmapper"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

// restGetter hands Helm a REST config directly: no kubeconfig file, no
// KUBECONFIG, no current context.
type restGetter struct {
	cfg       *rest.Config
	namespace string
}

var _ genericclioptions.RESTClientGetter = (*restGetter)(nil)

func (g *restGetter) ToRESTConfig() (*rest.Config, error) { return rest.CopyConfig(g.cfg), nil }

func (g *restGetter) ToDiscoveryClient() (discovery.CachedDiscoveryInterface, error) {
	dc, err := discovery.NewDiscoveryClientForConfig(g.cfg)
	if err != nil {
		return nil, err
	}
	return memory.NewMemCacheClient(dc), nil
}

func (g *restGetter) ToRESTMapper() (meta.RESTMapper, error) {
	dc, err := g.ToDiscoveryClient()
	if err != nil {
		return nil, err
	}
	return restmapper.NewShortcutExpander(restmapper.NewDeferredDiscoveryRESTMapper(dc), dc, nil), nil
}

func (g *restGetter) ToRawKubeConfigLoader() clientcmd.ClientConfig {
	return clientcmd.NewDefaultClientConfig(*clientcmdapi.NewConfig(), &clientcmd.ConfigOverrides{Context: clientcmdapi.Context{Namespace: g.namespace}})
}

// Helm runs chart operations in one cluster with the installer credential.
type Helm struct {
	cfg *action.Configuration
	ns  string
}

// NewHelm prepares Helm for releases in namespace (stored as Secrets there).
func NewHelm(cfg *rest.Config, namespace string, logger *slog.Logger) (*Helm, error) {
	ac := &action.Configuration{}
	ac.SetLogger(logger.Handler())
	if err := ac.Init(&restGetter{cfg: cfg, namespace: namespace}, namespace, "secret"); err != nil {
		return nil, err
	}
	return &Helm{cfg: ac, ns: namespace}, nil
}

// Deployed returns the deployed release, or nil when there is none.
func (h *Helm) Deployed(name string) (*releasev1.Release, error) {
	r, err := action.NewStatus(h.cfg).Run(name)
	if errors.Is(err, driver.ErrReleaseNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	rel, ok := r.(*releasev1.Release)
	if !ok {
		return nil, errors.New("unexpected release type")
	}
	return rel, nil
}

// Apply installs the release, or upgrades it when it exists. It waits for
// hooks only; readiness is tracked by the installation's steps.
func (h *Helm) Apply(ctx context.Context, name string, ch *chart.Chart, values map[string]any, timeout time.Duration) (upgraded bool, err error) {
	existing, err := h.Deployed(name)
	if err != nil {
		return false, err
	}
	if existing == nil || existing.Info == nil || existing.Info.Status == releasecommon.StatusUninstalled {
		in := action.NewInstall(h.cfg)
		in.ReleaseName, in.Namespace, in.CreateNamespace = name, h.ns, true
		in.Timeout, in.WaitStrategy = timeout, kube.HookOnlyStrategy
		in.Replace = existing != nil // a failed earlier attempt
		if _, err := in.RunWithContext(ctx, ch, values); err != nil {
			return false, fmt.Errorf("helm install: %w", err)
		}
		return false, nil
	}
	up := action.NewUpgrade(h.cfg)
	up.Namespace, up.Timeout, up.WaitStrategy = h.ns, timeout, kube.HookOnlyStrategy
	up.ResetValues = true // the preset plus install values are complete
	if _, err := up.RunWithContext(ctx, name, ch, values); err != nil {
		return true, fmt.Errorf("helm upgrade: %w", err)
	}
	return true, nil
}

// Uninstall removes the release (not its CRDs: Helm never deletes those).
func (h *Helm) Uninstall(name string, timeout time.Duration) error {
	un := action.NewUninstall(h.cfg)
	un.IgnoreNotFound, un.Timeout, un.WaitStrategy = true, timeout, kube.HookOnlyStrategy
	if _, err := un.Run(name); err != nil {
		return fmt.Errorf("helm uninstall: %w", err)
	}
	return nil
}
