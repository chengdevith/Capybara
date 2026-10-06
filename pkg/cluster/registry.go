// Package cluster is the cluster registry: it knows which clusters exist and
// hands out one cached client per cluster.
//
// Clusters are Cluster resources in capybara-mgmt, each with a kubeconfig
// Secret (see source.go). The registry builds clients from those Secrets,
// rebuilds them when credentials change, and tells subscribers (streams,
// controllers) so they can restart; every set of credentials gets its own
// lifetime context, cancelled on rotation or removal.
package cluster

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"sort"
	"sync"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/metadata"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"

	"github.com/capybara/capybara/api/v1alpha1"
)

// ErrNotFound is returned for an unknown cluster id.
var ErrNotFound = errors.New("cluster not found")

// Causes of a cluster lifetime context ending.
var (
	ErrCredentialsChanged = errors.New("cluster credentials changed")
	ErrClusterRemoved     = errors.New("cluster removed")
)

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
	// Metadata returns objects as PartialObjectMetadata (used for Secrets).
	Metadata(id string) (metadata.Interface, error)
	// RESTConfig is a copy of the cluster's REST config (for the passthrough proxy).
	RESTConfig(id string) (*rest.Config, error)
	// Context lives as long as the cluster's current credentials; it is
	// cancelled (cause ErrCredentialsChanged or ErrClusterRemoved) when they
	// change or the cluster goes away. Long-lived streams run under it.
	Context(id string) (context.Context, error)
}

// EventKind says what happened to a cluster.
type EventKind string

// Event kinds.
const (
	Added              EventKind = "Added"
	CredentialsChanged EventKind = "CredentialsChanged"
	InfoChanged        EventKind = "InfoChanged"
	Removed            EventKind = "Removed"
)

// Event is sent to subscribers when a cluster changes.
type Event struct {
	ID   string
	Kind EventKind
}

type entry struct {
	info          Info
	status        v1alpha1.ClusterStatus
	secretVersion string // resourceVersion of the Secret the clients were built from
	err           error  // why there are no clients (missing Secret, invalid kubeconfig)

	config  *rest.Config
	client  kubernetes.Interface
	dynamic dynamic.Interface
	meta    metadata.Interface

	ctx    context.Context
	cancel context.CancelCauseFunc
}

// Registry holds the registered clusters.
type Registry struct {
	opts   ValidateOptions
	logger *slog.Logger

	mu      sync.RWMutex
	entries map[string]*entry
	subs    []func(Event)
}

var _ Provider = (*Registry)(nil)

// NewRegistry returns an empty registry; Sync (source.go) fills it.
func NewRegistry(opts ValidateOptions, logger *slog.Logger) *Registry {
	return &Registry{opts: opts, logger: logger, entries: map[string]*entry{}}
}

// Subscribe registers fn for cluster events. fn must not block.
func (r *Registry) Subscribe(fn func(Event)) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.subs = append(r.subs, fn)
}

func (r *Registry) emit(evs ...Event) {
	r.mu.RLock()
	subs := append([]func(Event){}, r.subs...)
	r.mu.RUnlock()
	for _, ev := range evs {
		for _, fn := range subs {
			fn(ev)
		}
	}
}

// Upsert records a Cluster and its kubeconfig Secret (nil if missing).
// Clients are rebuilt only when the Secret changed.
func (r *Registry) Upsert(c *v1alpha1.Cluster, secret *corev1.Secret) {
	id := c.Name
	info := Info{ID: id, DisplayName: c.Spec.DisplayName, Environment: string(c.Spec.Environment)}
	if info.DisplayName == "" {
		info.DisplayName = id
	}
	version := ""
	if secret != nil {
		version = secret.ResourceVersion
	}

	r.mu.Lock()
	e, exists := r.entries[id]
	if exists && e.secretVersion == version && (e.client != nil || e.err != nil) {
		changed := e.info != info
		e.info, e.status = info, *c.Status.DeepCopy()
		r.mu.Unlock()
		if changed {
			r.emit(Event{ID: id, Kind: InfoChanged})
		}
		return
	}

	next := &entry{info: info, status: *c.Status.DeepCopy(), secretVersion: version}
	next.ctx, next.cancel = context.WithCancelCause(context.Background())
	switch {
	case secret == nil:
		next.err = fmt.Errorf("kubeconfig Secret %s/%s not found", v1alpha1.SystemNamespace, c.Spec.KubeconfigSecret.Name)
	case secret.Type != v1alpha1.KubeconfigSecretType:
		next.err = fmt.Errorf("kubeconfig secret %s is not of type %s", secret.Name, v1alpha1.KubeconfigSecretType)
	default:
		if err := next.build(secret.Data[v1alpha1.KubeconfigKey], r.opts); err != nil {
			next.err = err
		}
	}
	r.entries[id] = next
	r.mu.Unlock()

	kind := Added
	if exists {
		e.cancel(ErrCredentialsChanged)
		kind = CredentialsChanged
	}
	if next.err != nil {
		r.logger.Warn("cluster has no usable credentials", "cluster", id, "err", next.err)
	} else {
		r.logger.Info("cluster credentials loaded", "cluster", id, "event", kind)
	}
	r.emit(Event{ID: id, Kind: kind})
}

func (e *entry) build(raw []byte, opts ValidateOptions) error {
	cfg, _, err := RESTConfigFromKubeconfig(raw, opts)
	if err != nil {
		return err
	}
	cfg.UserAgent = "capybara"
	if e.client, err = kubernetes.NewForConfig(cfg); err != nil {
		return err
	}
	if e.dynamic, err = dynamic.NewForConfig(cfg); err != nil {
		return err
	}
	if e.meta, err = metadata.NewForConfig(cfg); err != nil {
		return err
	}
	e.config = cfg
	return nil
}

// Remove forgets a cluster and ends its lifetime context.
func (r *Registry) Remove(id string) {
	r.mu.Lock()
	e, ok := r.entries[id]
	delete(r.entries, id)
	r.mu.Unlock()
	if !ok {
		return
	}
	e.cancel(ErrClusterRemoved)
	r.logger.Info("cluster removed", "cluster", id)
	r.emit(Event{ID: id, Kind: Removed})
}

// List returns all clusters sorted by id.
func (r *Registry) List() []Info {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]Info, 0, len(r.entries))
	for _, e := range r.entries {
		out = append(out, e.info)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}

// Status returns the last health status the controller recorded.
func (r *Registry) Status(id string) (v1alpha1.ClusterStatus, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	e, ok := r.entries[id]
	if !ok {
		return v1alpha1.ClusterStatus{}, false
	}
	return *e.status.DeepCopy(), true
}

// CredentialsError says why a cluster has no clients (nil if it has them).
func (r *Registry) CredentialsError(id string) error {
	_, err := r.get(id)
	return err
}

func (r *Registry) get(id string) (*entry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	e, ok := r.entries[id]
	if !ok {
		return nil, ErrNotFound
	}
	if e.err != nil {
		return nil, fmt.Errorf("cluster %q unavailable: %w", id, e.err)
	}
	return e, nil
}

// Client returns the cluster's typed clientset.
func (r *Registry) Client(id string) (kubernetes.Interface, error) {
	e, err := r.get(id)
	if err != nil {
		return nil, err
	}
	return e.client, nil
}

// Dynamic returns the cluster's dynamic client.
func (r *Registry) Dynamic(id string) (dynamic.Interface, error) {
	e, err := r.get(id)
	if err != nil {
		return nil, err
	}
	return e.dynamic, nil
}

// Metadata returns the cluster's metadata-only client.
func (r *Registry) Metadata(id string) (metadata.Interface, error) {
	e, err := r.get(id)
	if err != nil {
		return nil, err
	}
	return e.meta, nil
}

// RESTConfig returns a copy of the cluster's REST config.
func (r *Registry) RESTConfig(id string) (*rest.Config, error) {
	e, err := r.get(id)
	if err != nil {
		return nil, err
	}
	return rest.CopyConfig(e.config), nil
}

// Context implements Provider.
func (r *Registry) Context(id string) (context.Context, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	e, ok := r.entries[id]
	if !ok {
		return nil, ErrNotFound
	}
	return e.ctx, nil
}

// RESTConfigFromFile builds a REST config from exactly one kubeconfig file
// on this machine (capybara-mgmt's), refusing anything that is not a local
// Capybara k3d cluster. It never consults KUBECONFIG, ~/.kube/config or
// in-cluster config.
func RESTConfigFromFile(path string) (*rest.Config, error) {
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
	cfg.UserAgent = "capybara"
	return cfg, nil
}
