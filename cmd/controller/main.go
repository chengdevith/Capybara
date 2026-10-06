// Command controller runs Capybara's CRD controllers (Project for now)
// against capybara-mgmt, reaching managed clusters through the registry.
package main

import (
	"fmt"
	"log/slog"
	"os"

	"context"

	"github.com/go-logr/logr"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/klog/v2"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	metricsserver "sigs.k8s.io/controller-runtime/pkg/metrics/server"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/deploy"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
	"github.com/capybara/capybara/pkg/plugin"
	"github.com/capybara/capybara/pkg/project"
)

func mergeCacheOptions(maps ...map[client.Object]cache.ByObject) map[client.Object]cache.ByObject {
	out := map[client.Object]cache.ByObject{}
	for _, m := range maps {
		for k, v := range m {
			out[k] = v
		}
	}
	return out
}

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
	projectCfg, err := project.NewConfigSource(deploy.ProjectSizes, logger)
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
		Cache:                  cache.Options{ByObject: mergeCacheOptions(cluster.CacheOptions(), project.CacheOptions())},
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
		if err := projectCfg.Watch(ctx, mgr.GetCache()); err != nil {
			return err
		}
		if err := cluster.Sync(ctx, mgr.GetCache(), registry, logger); err != nil {
			return err
		}
		<-ctx.Done()
		return nil
	})); err != nil {
		return err
	}

	// Installer credentials come through a separate cache that only this
	// controller builds; the API server never sees them.
	installers := cluster.NewInstallers(cluster.ValidateOptions{AllowInsecure: cfg.AllowInsecureKubeconfig}, logger)
	installerCache, err := cluster.NewInstallerCache(mgmt, scheme)
	if err != nil {
		return err
	}
	if err := mgr.Add(installerCache); err != nil {
		return err
	}
	if err := mgr.Add(manager.RunnableFunc(func(ctx context.Context) error {
		return cluster.SyncInstallers(ctx, installerCache, installers)
	})); err != nil {
		return err
	}

	if err := (&cluster.HealthReconciler{
		Client: mgr.GetClient(), Registry: registry, Installers: installers,
		Interval: cfg.ClusterCheckInterval, ExpiryWarning: cfg.CredentialExpiryWarning,
	}).SetupWithManager(mgr); err != nil {
		return err
	}

	if err := (&plugin.CatalogReconciler{
		Client: mgr.GetClient(), PluginsDir: cfg.PluginsDir, DevUI: cfg.PluginDevDir != "", Logger: logger,
	}).SetupWithManager(mgr); err != nil {
		return err
	}

	remote := make(chan event.GenericEvent, 1024)

	// New size presets apply to every Project; an invalid ConfigMap is
	// reported on the ConfigMap itself (the last good presets stay).
	projectCfg.Subscribe(func() {
		var list v1alpha1.ProjectList
		if err := mgr.GetClient().List(context.Background(), &list); err != nil {
			return
		}
		for i := range list.Items {
			remote <- event.GenericEvent{Object: &list.Items[i]}
		}
	})
	events := mgr.GetEventRecorder("capybara-controller")
	projectCfg.OnProblem(func(cm *corev1.ConfigMap, problem string) {
		events.Eventf(cm, nil, corev1.EventTypeWarning, "InvalidConfig", "Validate", "%s", problem)
	})
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
