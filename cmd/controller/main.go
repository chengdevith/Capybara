// Command controller runs Capybara's CRD controllers (Project for now)
// against capybara-mgmt, reaching managed clusters through the registry.
package main

import (
	"fmt"
	"log/slog"
	"os"

	"context"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/klog/v2"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	metricsserver "sigs.k8s.io/controller-runtime/pkg/metrics/server"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
	"github.com/capybara/capybara/pkg/project"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "capybara-controller:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	cfg, err := config.Load(args, os.Getenv)
	if err != nil {
		return err
	}
	var level slog.Level
	_ = level.UnmarshalText([]byte(cfg.LogLevel))
	logger := slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: level})).With("component", "controller")
	lr := logr.FromSlogHandler(logger.Handler())
	ctrl.SetLogger(lr)
	klog.SetLogger(lr) // client-go's own logs, same format

	mgmt, err := cluster.RESTConfigFromFile(cfg.MgmtKubeconfig)
	if err != nil {
		return fmt.Errorf("capybara-mgmt: %w", err)
	}
	registry := cluster.NewRegistry(cluster.ValidateOptions{AllowInsecure: cfg.AllowInsecureKubeconfig}, logger)
	projectCfg, err := project.LoadConfig(cfg.ProjectConfigFile)
	if err != nil {
		return err
	}
	store, err := audit.NewFileStore(cfg.AuditFile)
	if err != nil {
		return err
	}

	scheme := runtime.NewScheme()
	if err := clientgoscheme.AddToScheme(scheme); err != nil {
		return err
	}
	if err := v1alpha1.AddToScheme(scheme); err != nil {
		return err
	}
	mgr, err := ctrl.NewManager(mgmt, ctrl.Options{
		Scheme:                 scheme,
		Cache:                  cache.Options{ByObject: cluster.CacheOptions()},
		Metrics:                metricsserver.Options{BindAddress: "0"},
		HealthProbeBindAddress: "0",
		LeaderElection:         false, // one local instance; enable with the Helm chart
	})
	if err != nil {
		return err
	}

	// Fill the cluster registry from the manager's cache before the
	// controllers need it.
	if err := mgr.Add(manager.RunnableFunc(func(ctx context.Context) error {
		if err := cluster.Sync(ctx, mgr.GetCache(), registry, logger); err != nil {
			return err
		}
		<-ctx.Done()
		return nil
	})); err != nil {
		return err
	}

	remote := make(chan event.GenericEvent, 1024)
	r := &project.Reconciler{
		Client:    mgr.GetClient(),
		Clusters:  registry,
		Config:    projectCfg,
		Protected: cfg.Protected(),
		Auditor:   audit.NewAuditor(store, logger),
	}
	if err := r.SetupWithManager(mgr, remote); err != nil {
		return err
	}
	if err := mgr.Add(&project.RemoteWatcher{Clusters: registry, Registry: registry, Events: remote, Logger: logger}); err != nil {
		return err
	}
	logger.Info("starting", "mgmt", cfg.MgmtKubeconfig, "audit", cfg.AuditFile)
	return mgr.Start(ctrl.SetupSignalHandler())
}
