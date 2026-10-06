// Package clustertest provides a fake cluster.Provider for handler tests.
package clustertest

import (
	"context"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/metadata"
	"k8s.io/client-go/rest"

	"github.com/capybara/capybara/pkg/cluster"
)

// Provider is a cluster.Provider backed by fixed clients. Unknown ids
// return cluster.ErrNotFound; known ids without a given client return
// Unavailable.
type Provider struct {
	Infos    []cluster.Info
	Clients  map[string]kubernetes.Interface
	Dynamics map[string]dynamic.Interface
	Metas    map[string]metadata.Interface
	// Contexts per cluster (default: never cancelled).
	Contexts map[string]context.Context
	Configs  map[string]*rest.Config
	// Unavailable is returned for known clusters missing a client (default: generic error).
	Unavailable error
}

var _ cluster.Provider = (*Provider)(nil)

// List implements cluster.Provider.
func (p *Provider) List() []cluster.Info { return p.Infos }

// Client implements cluster.Provider.
func (p *Provider) Client(id string) (kubernetes.Interface, error) {
	return lookup(p, id, p.Clients)
}

// Dynamic implements cluster.Provider.
func (p *Provider) Dynamic(id string) (dynamic.Interface, error) {
	return lookup(p, id, p.Dynamics)
}

// Metadata implements cluster.Provider.
func (p *Provider) Metadata(id string) (metadata.Interface, error) {
	return lookup(p, id, p.Metas)
}

// Context implements cluster.Provider.
func (p *Provider) Context(id string) (context.Context, error) {
	if c, ok := p.Contexts[id]; ok {
		return c, nil
	}
	for _, i := range p.Infos {
		if i.ID == id {
			return context.Background(), nil
		}
	}
	return nil, cluster.ErrNotFound
}

// RESTConfig implements cluster.Provider.
func (p *Provider) RESTConfig(id string) (*rest.Config, error) {
	c, err := lookup(p, id, p.Configs)
	if err != nil {
		return nil, err
	}
	return rest.CopyConfig(c), nil
}

func lookup[T any](p *Provider, id string, m map[string]T) (T, error) {
	var zero T
	if v, ok := m[id]; ok {
		return v, nil
	}
	known := false
	for _, i := range p.Infos {
		known = known || i.ID == id
	}
	if !known {
		return zero, cluster.ErrNotFound
	}
	if p.Unavailable != nil {
		return zero, p.Unavailable
	}
	return zero, errUnavailable
}

type unavailableError struct{}

func (unavailableError) Error() string { return "cluster unavailable" }

var errUnavailable = unavailableError{}
