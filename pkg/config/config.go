// Package config holds the API server's settings.
//
// Every setting has a flag and an environment variable; the flag wins.
package config

import (
	"errors"
	"flag"
	"fmt"
	"net"
	"net/url"
	"os"
	"path"
	"strings"
	"time"
)

// Config is the API server configuration.
type Config struct {
	// Addr is the listen address. Defaults to loopback only.
	Addr string
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

	// MgmtKubeconfig reaches capybara-mgmt, where Capybara keeps its CRDs.
	MgmtKubeconfig string

	// AllowInsecureKubeconfig accepts insecure-skip-tls-verify (dev only).
	AllowInsecureKubeconfig bool
	// ClusterCheckInterval is how often the controller checks each cluster.
	ClusterCheckInterval time.Duration
	// CredentialExpiryWarning flags credentials expiring within this time.
	CredentialExpiryWarning time.Duration

	// PluginsDir is the builtin plugin repository (plugins/<name>/plugin.yaml).
	PluginsDir string
	// PluginDevDir (DEV ONLY, loopback only) serves unpinned UI bundles from
	// plugins/<name>/ui/dist in this directory, marked as dev bundles.
	PluginDevDir string
	// PluginBackends maps a plugin backend name to its loopback URL
	// ("monitoring=http://127.0.0.1:8091").
	PluginBackends map[string]string
	// PluginTokenDir is where the credential issued to each host-process
	// plugin backend is written (one file per backend, mode 600).
	PluginTokenDir string
}

// DefaultProtectedNamespaces are the namespaces protected out of the box.
var DefaultProtectedNamespaces = []string{"kube-system", "kube-public", "kube-node-lease", "default", "openshift-*"}

// Defaults returns the configuration used when nothing is set.
func Defaults() Config {
	return Config{ //nolint:gosec // PluginTokenDir is a directory path, not a credential
		Addr:                "127.0.0.1:8080",
		ClusterTimeout:      3 * time.Second,
		LogLevel:            "info",
		AuditFile:           ".local/audit/audit.jsonl",
		ProtectedNamespaces: append([]string(nil), DefaultProtectedNamespaces...),
		CapybaraNamespace:   "capybara-system",
		ExecIdleTimeout:     15 * time.Minute,
		ExecMaxDuration:     8 * time.Hour,
		MgmtKubeconfig:      ".local/kubeconfig/capybara-mgmt.yaml",

		ClusterCheckInterval:    30 * time.Second,
		CredentialExpiryWarning: 7 * 24 * time.Hour,

		PluginsDir:     "plugins",
		PluginBackends: map[string]string{},
		PluginTokenDir: ".local/plugin-backends",
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
	backends := ""

	strs := map[string]*string{
		"CAPYBARA_ADDR":                 &cfg.Addr,
		"CAPYBARA_LOG_LEVEL":            &cfg.LogLevel,
		"CAPYBARA_AUDIT_FILE":           &cfg.AuditFile,
		"CAPYBARA_PROTECTED_NAMESPACES": &protected,
		"CAPYBARA_NAMESPACE":            &cfg.CapybaraNamespace,
		"CAPYBARA_MGMT_KUBECONFIG":      &cfg.MgmtKubeconfig,
		"CAPYBARA_PLUGINS_DIR":          &cfg.PluginsDir,
		"CAPYBARA_PLUGIN_DEV_DIR":       &cfg.PluginDevDir,
		"CAPYBARA_PLUGIN_BACKENDS":      &backends,
		"CAPYBARA_PLUGIN_TOKEN_DIR":     &cfg.PluginTokenDir,
	}
	for env, dst := range strs {
		if v := getenv(env); v != "" {
			*dst = v
		}
	}
	durations := map[string]*time.Duration{
		"CAPYBARA_CLUSTER_TIMEOUT":           &cfg.ClusterTimeout,
		"CAPYBARA_EXEC_IDLE_TIMEOUT":         &cfg.ExecIdleTimeout,
		"CAPYBARA_EXEC_MAX_DURATION":         &cfg.ExecMaxDuration,
		"CAPYBARA_CLUSTER_CHECK_INTERVAL":    &cfg.ClusterCheckInterval,
		"CAPYBARA_CREDENTIAL_EXPIRY_WARNING": &cfg.CredentialExpiryWarning,
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
	fs.DurationVar(&cfg.ClusterTimeout, "cluster-timeout", cfg.ClusterTimeout, "timeout for cluster health checks (env CAPYBARA_CLUSTER_TIMEOUT)")
	fs.StringVar(&cfg.LogLevel, "log-level", cfg.LogLevel, "debug|info|warn|error (env CAPYBARA_LOG_LEVEL)")
	fs.StringVar(&cfg.AuditFile, "audit-file", cfg.AuditFile, "append-only audit log, JSON Lines (env CAPYBARA_AUDIT_FILE)")
	fs.StringVar(&protected, "protected-namespaces", protected, "comma-separated namespaces (globs allowed) that can never be deleted (env CAPYBARA_PROTECTED_NAMESPACES)")
	fs.StringVar(&cfg.CapybaraNamespace, "capybara-namespace", cfg.CapybaraNamespace, "Capybara's own namespace, always protected (env CAPYBARA_NAMESPACE)")
	fs.DurationVar(&cfg.ExecIdleTimeout, "exec-idle-timeout", cfg.ExecIdleTimeout, "close a terminal after this long without input (env CAPYBARA_EXEC_IDLE_TIMEOUT)")
	fs.DurationVar(&cfg.ExecMaxDuration, "exec-max-duration", cfg.ExecMaxDuration, "close any terminal after this long (env CAPYBARA_EXEC_MAX_DURATION)")
	fs.StringVar(&cfg.MgmtKubeconfig, "mgmt-kubeconfig", cfg.MgmtKubeconfig, "kubeconfig of capybara-mgmt (env CAPYBARA_MGMT_KUBECONFIG)")
	cfg.AllowInsecureKubeconfig = getenv("CAPYBARA_ALLOW_INSECURE_KUBECONFIG") == "true"
	fs.BoolVar(&cfg.AllowInsecureKubeconfig, "allow-insecure-kubeconfig", cfg.AllowInsecureKubeconfig, "DEV ONLY: accept kubeconfigs with insecure-skip-tls-verify (env CAPYBARA_ALLOW_INSECURE_KUBECONFIG=true)")
	fs.DurationVar(&cfg.ClusterCheckInterval, "cluster-check-interval", cfg.ClusterCheckInterval, "how often each cluster's health is checked (env CAPYBARA_CLUSTER_CHECK_INTERVAL)")
	fs.DurationVar(&cfg.CredentialExpiryWarning, "credential-expiry-warning", cfg.CredentialExpiryWarning, "warn when cluster credentials expire within this time (env CAPYBARA_CREDENTIAL_EXPIRY_WARNING)")
	fs.StringVar(&cfg.PluginsDir, "plugins-dir", cfg.PluginsDir, "builtin plugin repository (env CAPYBARA_PLUGINS_DIR)")
	fs.StringVar(&cfg.PluginDevDir, "plugin-dev-dir", cfg.PluginDevDir, "DEV ONLY, loopback only: serve unpinned plugin UI bundles from this plugins directory (env CAPYBARA_PLUGIN_DEV_DIR)")
	fs.StringVar(&backends, "plugin-backends", backends, "comma-separated name=http://127.0.0.1:port plugin backends (env CAPYBARA_PLUGIN_BACKENDS)")
	fs.StringVar(&cfg.PluginTokenDir, "plugin-token-dir", cfg.PluginTokenDir, "where host-process plugin backends get their credential (env CAPYBARA_PLUGIN_TOKEN_DIR)")
	if err := fs.Parse(args); err != nil {
		return Config{}, err
	}
	cfg.ProtectedNamespaces = splitList(protected)
	cfg.PluginBackends = map[string]string{}
	for _, kv := range splitList(backends) {
		name, url, ok := strings.Cut(kv, "=")
		if !ok {
			return Config{}, fmt.Errorf("plugin-backends: %q is not name=url", kv)
		}
		cfg.PluginBackends[name] = url
	}
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
	if c.MgmtKubeconfig == "" {
		return errors.New("mgmt-kubeconfig must be set")
	}
	if c.ClusterCheckInterval < time.Second || c.CredentialExpiryWarning <= 0 {
		return errors.New("cluster-check-interval must be at least 1s and credential-expiry-warning positive")
	}
	if c.ExecIdleTimeout > c.ExecMaxDuration {
		return errors.New("exec-idle-timeout must not exceed exec-max-duration")
	}
	if c.PluginsDir == "" || c.PluginTokenDir == "" {
		return errors.New("plugins-dir and plugin-token-dir must be set")
	}
	if c.PluginDevDir != "" && !c.IsLoopback() {
		return errors.New("plugin-dev-dir is for development only and needs a loopback addr")
	}
	for name, raw := range c.PluginBackends {
		u, err := url.Parse(raw)
		if err != nil || u.Scheme != "http" || u.Path != "" && u.Path != "/" || !isLoopbackHost(u.Hostname()) {
			return fmt.Errorf("plugin backend %s: want http://127.0.0.1:<port> (host processes only for now)", name)
		}
	}
	return nil
}

func isLoopbackHost(h string) bool {
	if h == "localhost" {
		return true
	}
	ip := net.ParseIP(h)
	return ip != nil && ip.IsLoopback()
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
