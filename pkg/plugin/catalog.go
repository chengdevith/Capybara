package plugin

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	"github.com/capybara/capybara/api/v1alpha1"
)

// CatalogReconciler syncs PluginRepositories into Plugin catalog entries.
// Only builtin repositories (the plugins/ directory) sync in this phase.
type CatalogReconciler struct {
	Client     client.Client
	PluginsDir string
	// DevUI tolerates UI bundles that do not match their pin (--plugin-dev-dir).
	DevUI    bool
	Interval time.Duration
	Logger   *slog.Logger
	Now      func() time.Time
}

// SetupWithManager registers the reconciler.
func (r *CatalogReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).Named("plugin-catalog").For(&v1alpha1.PluginRepository{}).Complete(r)
}

func (r *CatalogReconciler) now() time.Time {
	if r.Now != nil {
		return r.Now()
	}
	return time.Now()
}

// Reconcile syncs one repository.
func (r *CatalogReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var repo v1alpha1.PluginRepository
	if err := r.Client.Get(ctx, req.NamespacedName, &repo); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	interval := r.Interval
	if interval <= 0 {
		interval = 5 * time.Minute
	}
	status := v1alpha1.PluginRepositoryStatus{ObservedGeneration: repo.Generation}
	now := metav1.NewTime(r.now())
	status.LastSynced = &now

	switch repo.Spec.Type {
	case v1alpha1.RepositoryBuiltin:
		names, problems, err := r.syncBuiltin(ctx, &repo)
		if err != nil {
			return ctrl.Result{}, err
		}
		status.Plugins = names
		status.Phase = "Synced"
		if len(problems) > 0 {
			status.Phase = "Error"
			status.Message = strings.Join(problems, "; ")
		}
	default:
		status.Phase = "Unsupported"
		status.Message = fmt.Sprintf("%s repositories are not synced yet; only builtin is", repo.Spec.Type)
	}
	repo.Status = status
	if err := r.Client.Status().Update(ctx, &repo); err != nil {
		return ctrl.Result{}, err
	}
	return ctrl.Result{RequeueAfter: interval}, nil
}

func (r *CatalogReconciler) syncBuiltin(ctx context.Context, repo *v1alpha1.PluginRepository) ([]string, []string, error) {
	entries, err := os.ReadDir(r.PluginsDir)
	if err != nil {
		return nil, []string{fmt.Sprintf("read %s: %v", r.PluginsDir, err)}, nil
	}
	var names, problems []string
	seen := map[string]bool{}
	for _, e := range entries {
		dir := filepath.Join(r.PluginsDir, e.Name())
		if !e.IsDir() {
			continue
		}
		if _, err := os.Stat(filepath.Join(dir, ManifestFile)); err != nil {
			continue
		}
		m, spec, verr := LoadDir(dir, repo.Name)
		if m == nil {
			problems = append(problems, fmt.Sprintf("%s: %v", e.Name(), verr))
			continue
		}
		if m.Name != e.Name() {
			problems = append(problems, fmt.Sprintf("%s: manifest name %q does not match its directory", e.Name(), m.Name))
			continue
		}
		available, problem := true, ""
		var uiErr *UIBundleError
		switch {
		case verr != nil && errors.As(verr, &uiErr) && r.DevUI:
			problem = "dev bundle: " + verr.Error()
		case verr != nil:
			available, problem = false, verr.Error()
		}
		if !repo.Spec.Trusted {
			available, problem = false, "repository is not trusted"
		}
		if err := r.upsert(ctx, m.Name, spec, available, problem); err != nil {
			if errors.Is(err, errOtherRepository) {
				problems = append(problems, fmt.Sprintf("%s: %v", m.Name, err))
				continue
			}
			return nil, nil, err
		}
		seen[m.Name] = true
		names = append(names, m.Name)
	}
	// Entries that left the repository stay listed (installations may use
	// them) but can no longer be installed.
	var all v1alpha1.PluginList
	if err := r.Client.List(ctx, &all); err != nil {
		return nil, nil, err
	}
	for i := range all.Items {
		p := &all.Items[i]
		gone := "no longer in repository " + repo.Name
		if p.Spec.Repository == repo.Name && !seen[p.Name] && (p.Status.Available || p.Status.Problem != gone) {
			p.Status.Available, p.Status.Problem = false, gone
			if err := r.Client.Status().Update(ctx, p); err != nil {
				return nil, nil, err
			}
		}
	}
	sort.Strings(names)
	return names, problems, nil
}

var errOtherRepository = errors.New("a plugin with this name comes from another repository")

func (r *CatalogReconciler) upsert(ctx context.Context, name string, spec *v1alpha1.PluginSpec, available bool, problem string) error {
	p := &v1alpha1.Plugin{ObjectMeta: metav1.ObjectMeta{Name: name}}
	if err := r.Client.Get(ctx, client.ObjectKeyFromObject(p), p); err == nil && p.Spec.Repository != spec.Repository {
		return errOtherRepository
	} else if err != nil && !apierrors.IsNotFound(err) {
		return err
	}
	if _, err := controllerutil.CreateOrUpdate(ctx, r.Client, p, func() error {
		p.Spec = *spec
		return nil
	}); err != nil {
		return err
	}
	now := metav1.NewTime(r.now())
	p.Status = v1alpha1.PluginStatus{Available: available, Problem: problem, SyncedAt: &now}
	return r.Client.Status().Update(ctx, p)
}
