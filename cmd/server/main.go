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

	registry, err := cluster.LoadFile(cfg.ClustersFile, logger)
	if err != nil {
		return err
	}
	for _, c := range registry.List() {
		if _, err := registry.Client(c.ID); err != nil {
			logger.Warn("cluster not ready at startup", "cluster", c.ID, "err", err)
		} else {
			logger.Info("cluster registered", "cluster", c.ID)
		}
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
	mgmt, mgmtErr := mgmtClient(cfg.MgmtKubeconfig)
	if mgmtErr != nil {
		logger.Warn("capybara-mgmt unavailable; Projects disabled", "err", mgmtErr)
	}

	if !cfg.IsLoopback() {
		logger.Warn("listening on a non-loopback address; there is no authentication yet", "addr", cfg.Addr)
	}

	srv := &http.Server{
		Addr: cfg.Addr,
		Handler: newHandler(deps{
			cfg: cfg, clusters: registry, auditor: auditor, auditLog: auditStore, logger: logger,
			projects: &project.API{
				Mgmt: mgmt, MgmtErr: mgmtErr, Clusters: registry, Config: projectCfg,
				Protected: cfg.Protected(), Auditor: auditor, Logger: logger,
			},
		}),
		ReadHeaderTimeout: 10 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

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

func mgmtClient(kubeconfig string) (client.WithWatch, error) {
	restCfg, err := cluster.RESTConfigFromFile(kubeconfig)
	if err != nil {
		return nil, err
	}
	scheme := runtime.NewScheme()
	if err := v1alpha1.AddToScheme(scheme); err != nil {
		return nil, err
	}
	return client.NewWithWatch(restCfg, client.Options{Scheme: scheme})
}

func newLogger(level string) *slog.Logger {
	var l slog.Level
	_ = l.UnmarshalText([]byte(level)) // validated by config
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: l}))
}
