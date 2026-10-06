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
}

// Defaults returns the configuration used when nothing is set.
func Defaults() Config {
	return Config{
		Addr:           "127.0.0.1:8080",
		ClustersFile:   "deploy/clusters.yaml",
		ClusterTimeout: 3 * time.Second,
		LogLevel:       "info",
	}
}

// Load parses args (without the program name) on top of environment
// variables and defaults.
func Load(args []string, getenv func(string) string) (Config, error) {
	if getenv == nil {
		getenv = os.Getenv
	}
	cfg := Defaults()
	if v := getenv("CAPYBARA_ADDR"); v != "" {
		cfg.Addr = v
	}
	if v := getenv("CAPYBARA_CLUSTERS_FILE"); v != "" {
		cfg.ClustersFile = v
	}
	if v := getenv("CAPYBARA_CLUSTER_TIMEOUT"); v != "" {
		d, err := time.ParseDuration(v)
		if err != nil {
			return Config{}, fmt.Errorf("CAPYBARA_CLUSTER_TIMEOUT: %w", err)
		}
		cfg.ClusterTimeout = d
	}
	if v := getenv("CAPYBARA_LOG_LEVEL"); v != "" {
		cfg.LogLevel = v
	}

	fs := flag.NewFlagSet("capybara-server", flag.ContinueOnError)
	fs.StringVar(&cfg.Addr, "addr", cfg.Addr, "listen address (env CAPYBARA_ADDR)")
	fs.StringVar(&cfg.ClustersFile, "clusters-file", cfg.ClustersFile, "static cluster list (env CAPYBARA_CLUSTERS_FILE)")
	fs.DurationVar(&cfg.ClusterTimeout, "cluster-timeout", cfg.ClusterTimeout, "timeout for cluster health checks (env CAPYBARA_CLUSTER_TIMEOUT)")
	fs.StringVar(&cfg.LogLevel, "log-level", cfg.LogLevel, "debug|info|warn|error (env CAPYBARA_LOG_LEVEL)")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	return cfg, cfg.Validate()
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
	return nil
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
