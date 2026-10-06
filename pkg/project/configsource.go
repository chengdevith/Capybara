package project

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/fields"
	toolscache "k8s.io/client-go/tools/cache"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
)

// The live size presets: a ConfigMap in capybara-mgmt.
const (
	SizesConfigMap = "capybara-project-sizes"
	SizesKey       = "sizes.yaml"
)

// ConfigStatus says where the size presets come from and whether there is
// a problem with the ConfigMap.
type ConfigStatus struct {
	// Source is "built-in defaults" or the ConfigMap.
	Source    string    `json:"source"`
	Builtin   bool      `json:"builtin"`
	Problem   string    `json:"problem,omitempty"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ConfigSource holds the current Project configuration. It starts from the
// built-in copy and follows the ConfigMap; an invalid ConfigMap never
// replaces the last good configuration, it is reported instead.
type ConfigSource struct {
	logger *slog.Logger

	mu      sync.RWMutex
	current *Config
	status  ConfigStatus
	subs    []func()
	// onProblem is told about invalid ConfigMaps (e.g. to record an Event).
	onProblem func(cm *corev1.ConfigMap, problem string)
}

// NewConfigSource starts from the built-in presets, which must be valid.
func NewConfigSource(builtin []byte, logger *slog.Logger) (*ConfigSource, error) {
	cfg, err := ParseConfig(builtin)
	if err != nil {
		return nil, fmt.Errorf("built-in project sizes: %w", err)
	}
	return &ConfigSource{logger: logger, current: cfg,
		status: ConfigStatus{Source: "built-in defaults", Builtin: true, UpdatedAt: time.Now().UTC()}}, nil
}

// StaticConfig wraps a fixed Config (tests).
func StaticConfig(c *Config) *ConfigSource {
	return &ConfigSource{current: c, status: ConfigStatus{Source: "static"}, logger: slog.New(slog.DiscardHandler)}
}

// Get returns the current configuration.
func (s *ConfigSource) Get() *Config {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.current
}

// Status reports the source and any problem.
func (s *ConfigSource) Status() ConfigStatus {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.status
}

// Subscribe registers fn, called after the configuration changes.
func (s *ConfigSource) Subscribe(fn func()) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.subs = append(s.subs, fn)
}

// OnProblem registers a callback for invalid ConfigMaps.
func (s *ConfigSource) OnProblem(fn func(cm *corev1.ConfigMap, problem string)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onProblem = fn
}

// Apply takes a new ConfigMap. Invalid content keeps the last good config.
func (s *ConfigSource) Apply(cm *corev1.ConfigMap) {
	name := v1alpha1.SystemNamespace + "/" + cm.Name
	cfg, err := ParseConfig([]byte(cm.Data[SizesKey]))
	s.mu.Lock()
	if err != nil {
		problem := fmt.Sprintf("ConfigMap %s is invalid (%v); still using %s", name, err, s.status.Source)
		s.status.Problem = problem
		onProblem := s.onProblem
		s.mu.Unlock()
		s.logger.Error("invalid project size presets; keeping the last good configuration", "configmap", name, "err", err)
		if onProblem != nil {
			onProblem(cm, problem)
		}
		return
	}
	s.current = cfg
	s.status = ConfigStatus{Source: "ConfigMap " + name, UpdatedAt: time.Now().UTC()}
	subs := append([]func(){}, s.subs...)
	s.mu.Unlock()
	s.logger.Info("project size presets loaded", "configmap", name)
	for _, fn := range subs {
		fn()
	}
}

// Deleted keeps the last good configuration and reports it.
func (s *ConfigSource) Deleted() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.status.Problem = fmt.Sprintf("ConfigMap %s/%s was deleted; still using %s", v1alpha1.SystemNamespace, SizesConfigMap, s.status.Source)
}

// CacheOptions limits the mgmt cache to the one ConfigMap.
func CacheOptions() map[client.Object]cache.ByObject {
	return map[client.Object]cache.ByObject{
		&corev1.ConfigMap{}: {
			Namespaces: map[string]cache.Config{v1alpha1.SystemNamespace: {}},
			Field:      fields.OneTermEqualSelector("metadata.name", SizesConfigMap),
		},
	}
}

// Watch follows the ConfigMap through c (built with CacheOptions).
func (s *ConfigSource) Watch(ctx context.Context, c cache.Cache) error {
	inf, err := c.GetInformer(ctx, &corev1.ConfigMap{})
	if err != nil {
		return err
	}
	_, err = inf.AddEventHandler(toolscache.ResourceEventHandlerFuncs{
		AddFunc: func(obj any) {
			if cm, ok := obj.(*corev1.ConfigMap); ok {
				s.Apply(cm)
			}
		},
		UpdateFunc: func(_, obj any) {
			if cm, ok := obj.(*corev1.ConfigMap); ok {
				s.Apply(cm)
			}
		},
		DeleteFunc: func(any) { s.Deleted() },
	})
	return err
}
