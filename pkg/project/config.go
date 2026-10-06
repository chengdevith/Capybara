// Package project is the Project controller's logic: configuration (size
// presets, ingress sources), the resources a Project owns in its cluster,
// ownership checks, and reconciliation.
package project

import (
	"errors"
	"fmt"
	"os"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
)

// Config is deploy/project-sizes.yaml.
type Config struct {
	Sizes          map[v1alpha1.Size]SizeSpec `json:"sizes"`
	IngressSources []IngressSource            `json:"ingressSources"`
}

// SizeSpec is one quota preset.
type SizeSpec struct {
	Quota  corev1.ResourceList `json:"quota"`
	Limits LimitSpec           `json:"limits"`
}

// LimitSpec is the per-container LimitRange of a size.
type LimitSpec struct {
	DefaultRequest corev1.ResourceList `json:"defaultRequest"`
	Default        corev1.ResourceList `json:"default"`
	Max            corev1.ResourceList `json:"max"`
}

// IngressSource is a peer allowed into Project namespaces (e.g. a router).
type IngressSource struct {
	Name              string                `json:"name"`
	NamespaceSelector *metav1.LabelSelector `json:"namespaceSelector,omitempty"`
	PodSelector       *metav1.LabelSelector `json:"podSelector,omitempty"`
}

// LoadConfig reads and validates the configuration file.
func LoadConfig(path string) (*Config, error) {
	raw, err := os.ReadFile(path) //nolint:gosec // path is the binary's own setting
	if err != nil {
		return nil, fmt.Errorf("read project config: %w", err)
	}
	return ParseConfig(raw)
}

// ParseConfig parses and validates configuration YAML.
func ParseConfig(raw []byte) (*Config, error) {
	var c Config
	if err := yaml.UnmarshalStrict(raw, &c); err != nil {
		return nil, fmt.Errorf("parse project config: %w", err)
	}
	return &c, c.validate()
}

func (c *Config) validate() error {
	var errs []error
	for _, size := range []v1alpha1.Size{v1alpha1.SizeS, v1alpha1.SizeM, v1alpha1.SizeL} {
		s, ok := c.Sizes[size]
		if !ok {
			errs = append(errs, fmt.Errorf("size %s is not defined", size))
			continue
		}
		if len(s.Quota) == 0 {
			errs = append(errs, fmt.Errorf("size %s: quota is empty", size))
		}
		for name, max := range s.Limits.Max {
			if d, ok := s.Limits.Default[name]; ok && d.Cmp(max) > 0 {
				errs = append(errs, fmt.Errorf("size %s: default %s %s exceeds max %s", size, name, d.String(), max.String()))
			}
			if r, ok := s.Limits.DefaultRequest[name]; ok && r.Cmp(max) > 0 {
				errs = append(errs, fmt.Errorf("size %s: defaultRequest %s %s exceeds max %s", size, name, r.String(), max.String()))
			}
		}
		for name, r := range s.Limits.DefaultRequest {
			if d, ok := s.Limits.Default[name]; ok && r.Cmp(d) > 0 {
				errs = append(errs, fmt.Errorf("size %s: defaultRequest %s exceeds default", size, name))
			}
		}
	}
	for size := range c.Sizes {
		if size != v1alpha1.SizeS && size != v1alpha1.SizeM && size != v1alpha1.SizeL {
			errs = append(errs, fmt.Errorf("unknown size %q (S, M and L only)", size))
		}
	}
	for i, src := range c.IngressSources {
		if src.Name == "" {
			errs = append(errs, fmt.Errorf("ingressSources[%d]: name is required", i))
		}
		if src.NamespaceSelector == nil && src.PodSelector == nil {
			errs = append(errs, fmt.Errorf("ingressSources[%d] (%s): needs a namespaceSelector or podSelector", i, src.Name))
		}
	}
	return errors.Join(errs...)
}
