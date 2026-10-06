// Command bootstrap registers local clusters in capybara-mgmt for
// `make cluster-up`, through the same validation and storage as the API,
// and records one audit entry (user "bootstrap") listing what it registered.
// Clusters already registered are left alone.
//
//	bootstrap [-environment dev] dev-1=path/to/kubeconfig dev-2=...
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "bootstrap:", err)
		os.Exit(1)
	}
}

func run() error {
	mgmtKubeconfig := flag.String("mgmt-kubeconfig", ".local/kubeconfig/capybara-mgmt.yaml", "kubeconfig of capybara-mgmt")
	auditFile := flag.String("audit-file", ".local/audit/audit.jsonl", "audit log")
	env := flag.String("environment", "dev", "environment label for the clusters")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))
	cfg, err := cluster.RESTConfigFromFile(*mgmtKubeconfig)
	if err != nil {
		return err
	}
	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	c, err := client.New(cfg, client.Options{Scheme: scheme})
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	var registered []string
	for _, arg := range flag.Args() {
		id, path, ok := strings.Cut(arg, "=")
		if !ok {
			return fmt.Errorf("argument %q: want id=kubeconfig-path", arg)
		}
		raw, err := os.ReadFile(path) //nolint:gosec // paths come from make cluster-up
		if err != nil {
			return err
		}
		_, err = cluster.Register(ctx, c, cluster.RegisterRequest{
			ID: id, DisplayName: displayName(id), Environment: v1alpha1.Environment(*env), Kubeconfig: raw,
		}, cluster.ValidateOptions{})
		switch {
		case errors.Is(err, cluster.ErrExists):
			logger.Info("already registered", "cluster", id)
		case err != nil:
			return fmt.Errorf("register %s: %w", id, err)
		default:
			logger.Info("registered", "cluster", id)
			registered = append(registered, id)
		}
	}
	if len(registered) == 0 {
		return nil
	}

	store, err := audit.NewFileStore(*auditFile)
	if err != nil {
		return err
	}
	a := audit.NewAuditor(store, logger)
	return a.Event(auth.WithUser(ctx, auth.User{Name: "bootstrap"}), audit.Op{
		Kind: "Cluster", Name: strings.Join(registered, ","), Action: "bootstrap-register",
	}, audit.ResultSuccess, fmt.Sprintf("registered by make cluster-up: %s (ServiceAccount kubeconfigs, 30-day tokens, with secrets)",
		strings.Join(registered, ", ")))
}

// displayName turns "dev-1" into "Dev 1".
func displayName(id string) string {
	parts := strings.Split(id, "-")
	for i, p := range parts {
		if p != "" {
			parts[i] = strings.ToUpper(p[:1]) + p[1:]
		}
	}
	return strings.Join(parts, " ")
}
