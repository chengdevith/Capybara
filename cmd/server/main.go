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

	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
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

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Clusters are Cluster resources in capybara-mgmt. The registry fills in
	// the background, so the server starts even while mgmt is still coming up.
	registry := cluster.NewRegistry(cluster.ValidateOptions{AllowInsecure: cfg.AllowInsecureKubeconfig}, logger)
	mgmtCfg, mgmtErr := cluster.RESTConfigFromFile(cfg.MgmtKubeconfig)
	if mgmtErr == nil {
		go syncClusters(ctx, mgmtCfg, registry, logger)
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

	projectCfg, err := project.LoadConfig(cfg.ProjectConfigFile)
	if err != nil {
		return err
	}
	// Projects live in capybara-mgmt. Without it the server still runs;
	// the Projects endpoints answer 503 with the reason.
	var mgmt client.WithWatch
	if mgmtErr == nil {
		mgmt, mgmtErr = client.NewWithWatch(mgmtCfg, client.Options{Scheme: mgmtScheme()})
	}

	if !cfg.IsLoopback() {
		logger.Warn("listening on a non-loopback address; there is no authentication yet", "addr", cfg.Addr)
	}

	srv := &http.Server{
		Addr: cfg.Addr,
		Handler: newHandler(deps{
			cfg: cfg, clusters: registry, registry: registry, auditor: auditor, auditLog: auditStore, logger: logger,
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

// syncClusters keeps the registry in step with capybara-mgmt, retrying
// until mgmt answers.
func syncClusters(ctx context.Context, cfg *rest.Config, reg *cluster.Registry, logger *slog.Logger) {
	c, err := cache.New(cfg, cache.Options{Scheme: mgmtScheme(), ByObject: cluster.CacheOptions()})
	if err != nil {
		logger.Error("capybara-mgmt cache", "err", err)
		return
	}
	go func() {
		if err := c.Start(ctx); err != nil {
			logger.Error("capybara-mgmt cache stopped", "err", err)
		}
	}()
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
