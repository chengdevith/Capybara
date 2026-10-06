// Package config holds the API server's settings.
//
// Every setting has a flag and an environment variable; the flag wins.
package config

import (
	"errors"
	"flag"
	"fmt"
	"net"
	"os"
	"path"
	"strings"
	"time"
)

// Config is the API server configuration.
type Config struct {
	// Addr is the listen address. Defaults to loopback only.
	Addr string
	// ClustersFile is the static cluster list (id -> kubeconfig file).
	// Replaced by the Cluster CRD in Phase 4.
	ClustersFile string
	// ClusterTimeout bounds each call made to check a cluster's health.
	ClusterTimeout time.Duration
	// LogLevel is one of debug, info, warn, error.
	LogLevel string

	// AuditFile is the append-only JSON Lines audit log.
	AuditFile string
	// ProtectedNamespaces can never be deleted. Entries are path.Match
	// patterns (e.g. "openshift-*"). CapybaraNamespace is always added.
	ProtectedNamespaces []string
	// CapybaraNamespace is where Capybara itself runs (Helm chart, later).
	CapybaraNamespace string
	// ExecIdleTimeout closes a terminal with no input for this long.
	ExecIdleTimeout time.Duration
	// ExecMaxDuration closes any terminal session after this long.
	ExecMaxDuration time.Duration
}

// DefaultProtectedNamespaces are the namespaces protected out of the box.
var DefaultProtectedNamespaces = []string{"kube-system", "kube-public", "kube-node-lease", "default", "openshift-*"}

// Defaults returns the configuration used when nothing is set.
func Defaults() Config {
	return Config{
		Addr:                "127.0.0.1:8080",
		ClustersFile:        "deploy/clusters.yaml",
		ClusterTimeout:      3 * time.Second,
		LogLevel:            "info",
		AuditFile:           ".local/audit/audit.jsonl",
		ProtectedNamespaces: append([]string(nil), DefaultProtectedNamespaces...),
		CapybaraNamespace:   "capybara-system",
		ExecIdleTimeout:     15 * time.Minute,
		ExecMaxDuration:     8 * time.Hour,
	}
}

// Load parses args (without the program name) on top of environment
// variables and defaults.
func Load(args []string, getenv func(string) string) (Config, error) {
	if getenv == nil {
		getenv = os.Getenv
	}
	cfg := Defaults()
	protected := strings.Join(cfg.ProtectedNamespaces, ",")

	strs := map[string]*string{
		"CAPYBARA_ADDR":                 &cfg.Addr,
		"CAPYBARA_CLUSTERS_FILE":        &cfg.ClustersFile,
		"CAPYBARA_LOG_LEVEL":            &cfg.LogLevel,
		"CAPYBARA_AUDIT_FILE":           &cfg.AuditFile,
		"CAPYBARA_PROTECTED_NAMESPACES": &protected,
		"CAPYBARA_NAMESPACE":            &cfg.CapybaraNamespace,
	}
	for env, dst := range strs {
		if v := getenv(env); v != "" {
			*dst = v
		}
	}
	durations := map[string]*time.Duration{
		"CAPYBARA_CLUSTER_TIMEOUT":   &cfg.ClusterTimeout,
		"CAPYBARA_EXEC_IDLE_TIMEOUT": &cfg.ExecIdleTimeout,
		"CAPYBARA_EXEC_MAX_DURATION": &cfg.ExecMaxDuration,
	}
	for env, dst := range durations {
		if v := getenv(env); v != "" {
			d, err := time.ParseDuration(v)
			if err != nil {
				return Config{}, fmt.Errorf("%s: %w", env, err)
			}
			*dst = d
		}
	}

	fs := flag.NewFlagSet("capybara-server", flag.ContinueOnError)
	fs.StringVar(&cfg.Addr, "addr", cfg.Addr, "listen address (env CAPYBARA_ADDR)")
	fs.StringVar(&cfg.ClustersFile, "clusters-file", cfg.ClustersFile, "static cluster list (env CAPYBARA_CLUSTERS_FILE)")
	fs.DurationVar(&cfg.ClusterTimeout, "cluster-timeout", cfg.ClusterTimeout, "timeout for cluster health checks (env CAPYBARA_CLUSTER_TIMEOUT)")
	fs.StringVar(&cfg.LogLevel, "log-level", cfg.LogLevel, "debug|info|warn|error (env CAPYBARA_LOG_LEVEL)")
	fs.StringVar(&cfg.AuditFile, "audit-file", cfg.AuditFile, "append-only audit log, JSON Lines (env CAPYBARA_AUDIT_FILE)")
	fs.StringVar(&protected, "protected-namespaces", protected, "comma-separated namespaces (globs allowed) that can never be deleted (env CAPYBARA_PROTECTED_NAMESPACES)")
	fs.StringVar(&cfg.CapybaraNamespace, "capybara-namespace", cfg.CapybaraNamespace, "Capybara's own namespace, always protected (env CAPYBARA_NAMESPACE)")
	fs.DurationVar(&cfg.ExecIdleTimeout, "exec-idle-timeout", cfg.ExecIdleTimeout, "close a terminal after this long without input (env CAPYBARA_EXEC_IDLE_TIMEOUT)")
	fs.DurationVar(&cfg.ExecMaxDuration, "exec-max-duration", cfg.ExecMaxDuration, "close any terminal after this long (env CAPYBARA_EXEC_MAX_DURATION)")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	cfg.ProtectedNamespaces = splitList(protected)
	return cfg, cfg.Validate()
}

func splitList(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// Validate checks the configuration for obvious mistakes.
func (c Config) Validate() error {
	if _, _, err := net.SplitHostPort(c.Addr); err != nil {
		return fmt.Errorf("addr %q: %w", c.Addr, err)
	}
	if c.ClustersFile == "" {
		return errors.New("clusters-file must be set")
	}
	if c.ClusterTimeout <= 0 {
		return errors.New("cluster-timeout must be positive")
	}
	switch c.LogLevel {
	case "debug", "info", "warn", "error":
	default:
		return fmt.Errorf("log-level %q: want debug, info, warn or error", c.LogLevel)
	}
	if c.AuditFile == "" {
		return errors.New("audit-file must be set")
	}
	for _, p := range c.ProtectedNamespaces {
		if _, err := path.Match(p, ""); err != nil {
			return fmt.Errorf("protected namespace pattern %q: %w", p, err)
		}
	}
	if c.CapybaraNamespace == "" {
		return errors.New("capybara-namespace must be set")
	}
	if c.ExecIdleTimeout <= 0 || c.ExecMaxDuration <= 0 {
		return errors.New("exec timeouts must be positive")
	}
	if c.ExecIdleTimeout > c.ExecMaxDuration {
		return errors.New("exec-idle-timeout must not exceed exec-max-duration")
	}
	return nil
}

// Protected returns the full protected-namespace pattern list, including
// Capybara's own namespace.
func (c Config) Protected() []string {
	return append(append([]string(nil), c.ProtectedNamespaces...), c.CapybaraNamespace)
}

// IsLoopback reports whether Addr only accepts local connections.
func (c Config) IsLoopback() bool {
	host, _, err := net.SplitHostPort(c.Addr)
	if err != nil {
		return false
	}
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}
