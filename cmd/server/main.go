// Command server is Capybara's API server (HTTP + websockets).
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/klog/v2"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"
	ctrllog "sigs.k8s.io/controller-runtime/pkg/log"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/deploy"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
	"github.com/capybara/capybara/pkg/plugin"
	"github.com/capybara/capybara/pkg/project"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "capybara-server:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	cfg, err := config.Load(args, os.Getenv)
	if err != nil {
		return err
	}
	logger := newLogger(cfg.LogLevel)
	// controller-runtime (the mgmt cache) and client-go log through the same
	// handler; otherwise controller-runtime prints a stack trace on first use.
	lr := logr.FromSlogHandler(logger.Handler())
	ctrllog.SetLogger(lr)
	klog.SetLogger(lr)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	projectCfg, err := project.NewConfigSource(deploy.ProjectSizes, logger)
	if err != nil {
		return err
	}

	// Clusters are Cluster resources in capybara-mgmt. The registry fills in
	// the background, so the server starts even while mgmt is still coming up.
	registry := cluster.NewRegistry(cluster.ValidateOptions{AllowInsecure: cfg.AllowInsecureKubeconfig}, logger)
	mgmtCfg, mgmtErr := cluster.RESTConfigFromFile(cfg.MgmtKubeconfig)
	if mgmtErr == nil {
		go syncMgmt(ctx, mgmtCfg, registry, projectCfg, logger)
	} else {
		logger.Warn("capybara-mgmt unavailable; no clusters and no Projects", "err", mgmtErr)
	}

	// Fail closed from the start: no server without a writable audit log.
	auditStore, err := audit.NewFileStore(cfg.AuditFile)
	if err != nil {
		return err
	}
	auditor := audit.NewAuditor(auditStore, logger)
	logger.Info("audit log", "file", cfg.AuditFile)

	// Projects live in capybara-mgmt. Without it the server still runs;
	// the Projects endpoints answer 503 with the reason.
	var mgmt client.WithWatch
	if mgmtErr == nil {
		mgmt, mgmtErr = client.NewWithWatch(mgmtCfg, client.Options{Scheme: mgmtScheme()})
	}

	if !cfg.IsLoopback() {
		logger.Warn("listening on a non-loopback address; there is no authentication yet", "addr", cfg.Addr)
	}

	var backendNames []string
	for name := range cfg.PluginBackends {
		backendNames = append(backendNames, name)
	}
	creds, err := plugin.IssueBackendCredentials(cfg.PluginTokenDir, backendNames)
	if err != nil {
		return fmt.Errorf("plugin backend credentials: %w", err)
	}
	if cfg.PluginDevDir != "" {
		logger.Warn("serving unpinned plugin UI bundles (dev only)", "dir", cfg.PluginDevDir)
	}

	srv := &http.Server{
		Addr: cfg.Addr,
		Handler: newHandler(deps{
			cfg: cfg, clusters: registry, auditor: auditor, auditLog: auditStore, logger: logger,
			sizes: projectCfg,
			plugins: &plugin.API{Mgmt: mgmt, MgmtErr: mgmtErr, Clusters: registry, Auditor: auditor, Logger: logger,
				Bundles: &plugin.Bundles{Mgmt: mgmt, PluginsDir: cfg.PluginsDir, DevDir: cfg.PluginDevDir}},
			backends: &plugin.BackendProxy{Backends: cfg.PluginBackends, Logger: logger},
			scoped:   &plugin.ScopedProxy{Mgmt: mgmt, Credentials: creds, Clusters: registry, Logger: logger},
			clusterAPI: &cluster.API{
				Mgmt: mgmt, MgmtErr: mgmtErr, Registry: registry, Auditor: auditor, Logger: logger,
				Opts: cluster.ValidateOptions{AllowInsecure: cfg.AllowInsecureKubeconfig},
			},
			projects: &project.API{
				Mgmt: mgmt, MgmtErr: mgmtErr, Clusters: registry, Config: projectCfg,
				Protected: cfg.Protected(), Auditor: auditor, Logger: logger,
			},
		}),
		ReadHeaderTimeout: 10 * time.Second,
	}

	errc := make(chan error, 1)
	go func() {
		logger.Info("listening", "addr", cfg.Addr)
		errc <- srv.ListenAndServe()
	}()

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}

	logger.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return err
	}
	if err := <-errc; !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func mgmtScheme() *runtime.Scheme {
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	return scheme
}

// syncMgmt keeps the cluster registry and the Project size presets in step
// with capybara-mgmt.
func syncMgmt(ctx context.Context, cfg *rest.Config, reg *cluster.Registry, sizes *project.ConfigSource, logger *slog.Logger) {
	byObject := cluster.CacheOptions()
	for k, v := range project.CacheOptions() {
		byObject[k] = v
	}
	c, err := cache.New(cfg, cache.Options{Scheme: mgmtScheme(), ByObject: byObject})
	if err != nil {
		logger.Error("capybara-mgmt cache", "err", err)
		return
	}
	go func() {
		if err := c.Start(ctx); err != nil {
			logger.Error("capybara-mgmt cache stopped", "err", err)
		}
	}()
	if err := sizes.Watch(ctx, c); err != nil {
		logger.Error("project size presets watch", "err", err)
	}
	if err := cluster.Sync(ctx, c, reg, logger); err != nil {
		logger.Error("cluster registry sync", "err", err)
		return
	}
	logger.Info("cluster registry synced", "clusters", len(reg.List()))
}

func newLogger(level string) *slog.Logger {
	var l slog.Level
	_ = l.UnmarshalText([]byte(level)) // validated by config
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: l}))
}
