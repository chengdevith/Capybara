// Package cluster is the cluster registry: it knows which clusters exist and
// hands out one cached client per cluster.
//
// Phases 0-3 read a static file (id -> kubeconfig path). Phase 4 replaces the
// source with the Cluster CRD + kubeconfig Secrets behind the same methods.
package cluster

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"sync"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"sigs.k8s.io/yaml"
)

// ErrNotFound is returned for an unknown cluster id.
var ErrNotFound = errors.New("cluster not found")

// Info describes a registered cluster.
type Info struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Environment string `json:"environment"`
}

// Provider is what handlers need from the registry. Tests use fakes.
type Provider interface {
	List() []Info
	// Client is the typed clientset for a cluster.
	Client(id string) (kubernetes.Interface, error)
	// Dynamic is the dynamic client, for any resource by GroupVersionResource.
	Dynamic(id string) (dynamic.Interface, error)
	// RESTConfig is a copy of the cluster's REST config (for the passthrough proxy).
	RESTConfig(id string) (*rest.Config, error)
}

// fileConfig is the format of the static clusters file.
type fileConfig struct {
	Clusters []struct {
		Info       `json:",inline"`
		Kubeconfig string `json:"kubeconfig"`
	} `json:"clusters"`
}

var idPattern = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`)

type entry struct {
	info           Info
	kubeconfigPath string

	mu      sync.Mutex
	config  *rest.Config
	client  kubernetes.Interface
	dynamic dynamic.Interface
}

// Registry holds the known clusters in file order.
type Registry struct {
	entries map[string]*entry
	order   []string
	logger  *slog.Logger
}

// LoadFile reads the static clusters file. Kubeconfig paths are relative to
// the file. Clients are built lazily, so a cluster whose kubeconfig does not
// exist yet (cluster not created) shows as Error instead of stopping startup.
func LoadFile(path string, logger *slog.Logger) (*Registry, error) {
	raw, err := os.ReadFile(path) //nolint:gosec // path is the server's own --clusters-file setting
	if err != nil {
		return nil, fmt.Errorf("read clusters file: %w", err)
	}
	var fc fileConfig
	if err := yaml.UnmarshalStrict(raw, &fc); err != nil {
		return nil, fmt.Errorf("parse clusters file %s: %w", path, err)
	}

	r := &Registry{entries: map[string]*entry{}, logger: logger}
	base := filepath.Dir(path)
	for _, c := range fc.Clusters {
		if !idPattern.MatchString(c.ID) {
			return nil, fmt.Errorf("cluster id %q: must be a DNS label", c.ID)
		}
		if _, dup := r.entries[c.ID]; dup {
			return nil, fmt.Errorf("cluster id %q: duplicate", c.ID)
		}
		if c.Kubeconfig == "" {
			return nil, fmt.Errorf("cluster %q: kubeconfig is required", c.ID)
		}
		kc := c.Kubeconfig
		if !filepath.IsAbs(kc) {
			kc = filepath.Join(base, kc)
		}
		info := c.Info
		if info.DisplayName == "" {
			info.DisplayName = info.ID
		}
		r.entries[c.ID] = &entry{info: info, kubeconfigPath: kc}
		r.order = append(r.order, c.ID)
	}
	return r, nil
}

// List returns all clusters in file order.
func (r *Registry) List() []Info {
	out := make([]Info, 0, len(r.order))
	for _, id := range r.order {
		out = append(out, r.entries[id].info)
	}
	return out
}

// Client returns the cached clientset for id, building it on first use.
func (r *Registry) Client(id string) (kubernetes.Interface, error) {
	e, err := r.load(id)
	if err != nil {
		return nil, err
	}
	return e.client, nil
}

// Dynamic returns the cached dynamic client for id, building it on first use.
func (r *Registry) Dynamic(id string) (dynamic.Interface, error) {
	e, err := r.load(id)
	if err != nil {
		return nil, err
	}
	return e.dynamic, nil
}

// RESTConfig returns a copy of the REST config for id.
func (r *Registry) RESTConfig(id string) (*rest.Config, error) {
	e, err := r.load(id)
	if err != nil {
		return nil, err
	}
	return rest.CopyConfig(e.config), nil
}

func (r *Registry) load(id string) (*entry, error) {
	e, ok := r.entries[id]
	if !ok {
		return nil, ErrNotFound
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	if e.client != nil {
		return e, nil
	}
	cfg, err := restConfigFromFile(e.kubeconfigPath)
	if err != nil {
		// The path is fine to log; the file content never is.
		r.logger.Warn("cluster unavailable", "cluster", id, "kubeconfig", e.kubeconfigPath, "err", err)
		return nil, fmt.Errorf("cluster %q unavailable: %w", id, err)
	}
	client, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("cluster %q: %w", id, err)
	}
	dyn, err := dynamic.NewForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("cluster %q: %w", id, err)
	}
	e.config, e.client, e.dynamic = cfg, client, dyn
	return e, nil
}

// restConfigFromFile builds a REST config from exactly one kubeconfig file.
// It never consults KUBECONFIG, ~/.kube/config or in-cluster config.
func restConfigFromFile(path string) (*rest.Config, error) {
	kc, err := clientcmd.LoadFromFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, errors.New("kubeconfig not found (run `make cluster-up`)")
		}
		return nil, fmt.Errorf("load kubeconfig: %w", err)
	}
	if err := checkLocal(kc); err != nil {
		return nil, err
	}
	cfg, err := clientcmd.NewNonInteractiveClientConfig(*kc, kc.CurrentContext, &clientcmd.ConfigOverrides{}, nil).ClientConfig()
	if err != nil {
		return nil, fmt.Errorf("build client config: %w", err)
	}
	cfg.UserAgent = "capybara-server"
	return cfg, nil
}
