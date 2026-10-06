package cluster

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"time"

	authzv1 "k8s.io/api/authorization/v1"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/httpjson"
)

// API serves cluster registration and management. Kubeconfigs go in, only
// summaries come out: no response, log line or audit detail ever holds
// kubeconfig content.
type API struct {
	Mgmt     client.Client // nil when capybara-mgmt is unavailable (MgmtErr says why)
	MgmtErr  error
	Registry *Registry
	Auditor  *audit.Auditor
	Opts     ValidateOptions
	Logger   *slog.Logger
	// TestTimeout bounds a connection test or overview (default 10s).
	TestTimeout time.Duration
}

// Register adds the routes.
func (a *API) Register(mux *http.ServeMux) {
	mux.Handle("GET /api/clusters", ListHandler(a.Registry))
	mux.HandleFunc("POST /api/clusters/_validate", a.validate)
	mux.HandleFunc("POST /api/clusters/_test", a.test)
	mux.HandleFunc("POST /api/clusters", a.register)
	mux.HandleFunc("PATCH /api/clusters/{id}", a.update)
	mux.HandleFunc("PUT /api/clusters/{id}/kubeconfig", a.rotate)
	mux.HandleFunc("PUT /api/clusters/{id}/installer", a.setInstaller)
	mux.HandleFunc("DELETE /api/clusters/{id}/installer", a.removeInstaller)
	mux.HandleFunc("DELETE /api/clusters/{id}", a.remove)
	mux.HandleFunc("GET /api/clusters/{id}/overview", a.overview)
}

func (a *API) timeout() time.Duration {
	if a.TestTimeout > 0 {
		return a.TestTimeout
	}
	return 10 * time.Second
}

func (a *API) ready(w http.ResponseWriter) bool {
	if a.Mgmt == nil {
		msg := "capybara-mgmt is not available"
		if a.MgmtErr != nil {
			msg += ": " + a.MgmtErr.Error()
		}
		httpjson.Error(w, http.StatusServiceUnavailable, msg)
		return false
	}
	return true
}

type conflictError struct {
	msg      string
	projects []string
	plugins  []string
}

func (e *conflictError) Error() string { return e.msg }

func writeErr(w http.ResponseWriter, err error) {
	var (
		v   *ValidationError
		in  *InputError
		c   *conflictError
		onr *audit.OutcomeNotRecordedError
	)
	switch {
	case errors.As(err, &onr):
		httpjson.Error(w, http.StatusInternalServerError, onr.Error())
	case errors.Is(err, audit.ErrUnavailable):
		httpjson.Error(w, http.StatusServiceUnavailable, err.Error())
	case errors.As(err, &v):
		httpjson.Write(w, http.StatusBadRequest, map[string]any{"error": v.Error(), "problems": v.Problems})
	case errors.As(err, &in):
		httpjson.Error(w, http.StatusBadRequest, in.Msg)
	case errors.As(err, &c):
		httpjson.Write(w, http.StatusConflict, map[string]any{"error": c.msg, "projects": c.projects, "plugins": c.plugins})
	case errors.Is(err, ErrExists):
		httpjson.Error(w, http.StatusConflict, err.Error())
	case errors.Is(err, ErrNotFound):
		httpjson.Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, audit.ErrDenied):
		httpjson.Error(w, http.StatusForbidden, err.Error())
	default:
		httpjson.Error(w, http.StatusBadGateway, err.Error())
	}
}

func decode(w http.ResponseWriter, r *http.Request, v any) error {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, MaxKubeconfigBytes+64<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		// Never echo the body: it may hold a kubeconfig.
		return &InputError{Msg: "request body is not valid JSON for this endpoint"}
	}
	return nil
}

type kubeconfigBody struct {
	Kubeconfig string `json:"kubeconfig"`
}

// validate parses and summarises a kubeconfig. Nothing is stored.
func (a *API) validate(w http.ResponseWriter, r *http.Request) {
	var b kubeconfigBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	_, s, err := ParseKubeconfig([]byte(b.Kubeconfig), a.Opts)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"summary": s})
}

// Check is one permission probed by a connection test.
type Check struct {
	Name    string `json:"name"`
	Allowed bool   `json:"allowed"`
}

// TestResult is what a connection test found.
type TestResult struct {
	Summary      *Summary `json:"summary"`
	OK           bool     `json:"ok"`
	Reason       string   `json:"reason,omitempty"` // Unreachable, AuthFailed
	Message      string   `json:"message,omitempty"`
	Identity     string   `json:"identity,omitempty"`
	Version      string   `json:"version,omitempty"`
	NodeCount    *int     `json:"nodeCount,omitempty"`
	ClusterAdmin bool     `json:"clusterAdmin"`
	Checks       []Check  `json:"checks,omitempty"`
}

var probes = []struct {
	name string
	attr authzv1.ResourceAttributes
}{
	{"list pods in all namespaces", authzv1.ResourceAttributes{Verb: "list", Resource: "pods"}},
	{"delete pods", authzv1.ResourceAttributes{Verb: "delete", Resource: "pods"}},
	{"open a terminal (pods/exec)", authzv1.ResourceAttributes{Verb: "create", Resource: "pods", Subresource: "exec"}},
	{"create namespaces (Projects)", authzv1.ResourceAttributes{Verb: "create", Resource: "namespaces"}},
	{"bind the admin role (Project owners)", authzv1.ResourceAttributes{Verb: "bind", Group: "rbac.authorization.k8s.io", Resource: "clusterroles", Name: "admin"}},
	{"read Secret values", authzv1.ResourceAttributes{Verb: "get", Resource: "secrets"}},
}

// test connects with an uploaded kubeconfig: who it authenticates as, the
// version, node count and a few permissions. Nothing is stored.
func (a *API) test(w http.ResponseWriter, r *http.Request) {
	var b kubeconfigBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	rc, s, err := RESTConfigFromKubeconfig([]byte(b.Kubeconfig), a.Opts)
	if err != nil {
		writeErr(w, err)
		return
	}
	rc.Timeout = a.timeout()
	cs, err := kubernetes.NewForConfig(rc)
	if err != nil {
		writeErr(w, &ValidationError{Problems: []string{"kubeconfig cannot be used to build a client"}})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), a.timeout())
	defer cancel()
	res := TestResult{Summary: s}

	identity, err := whoAmI(ctx, cs)
	switch {
	case apierrors.IsUnauthorized(err):
		res.Reason, res.Message = v1alpha1.ReasonAuthFailed, "the cluster rejected these credentials"
	case err != nil:
		res.Reason, res.Message = v1alpha1.ReasonUnreachable, unreachableMessage(err)
	}
	if err != nil {
		httpjson.Write(w, http.StatusOK, res)
		return
	}
	res.OK, res.Identity = true, identity
	if v, err := cs.Discovery().ServerVersion(); err == nil {
		res.Version = v.GitVersion
	}
	if nodes, err := cs.CoreV1().Nodes().List(ctx, metav1.ListOptions{}); err == nil {
		n := len(nodes.Items)
		res.NodeCount = &n
	}
	for _, p := range probes {
		attr := p.attr
		res.Checks = append(res.Checks, Check{Name: p.name, Allowed: can(ctx, cs, &attr)})
	}
	res.ClusterAdmin = can(ctx, cs, &authzv1.ResourceAttributes{Verb: "*", Group: "*", Resource: "*"})
	httpjson.Write(w, http.StatusOK, res)
}

func can(ctx context.Context, cs kubernetes.Interface, attr *authzv1.ResourceAttributes) bool {
	r, err := cs.AuthorizationV1().SelfSubjectAccessReviews().Create(ctx, &authzv1.SelfSubjectAccessReview{
		Spec: authzv1.SelfSubjectAccessReviewSpec{ResourceAttributes: attr},
	}, metav1.CreateOptions{})
	return err == nil && r.Status.Allowed
}

// RegisterBody is POST /api/clusters.
type RegisterBody struct {
	ID          string               `json:"id"`
	DisplayName string               `json:"displayName,omitempty"`
	Environment v1alpha1.Environment `json:"environment"`
	Kubeconfig  string               `json:"kubeconfig"`
}

func (a *API) register(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b RegisterBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: b.ID, Kind: "Cluster", Name: b.ID, Action: "register"}
	var summary *Summary
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		s, err := Register(ctx, a.Mgmt, RegisterRequest{ID: b.ID, DisplayName: b.DisplayName, Environment: b.Environment, Kubeconfig: []byte(b.Kubeconfig)}, a.Opts)
		if err != nil {
			return "", err
		}
		summary = s
		return fmt.Sprintf("environment %s, %s auth as %s, server %s", b.Environment, s.AuthMethod, nonEmpty(s.Identity), s.Server), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusCreated, map[string]any{"id": b.ID, "summary": summary})
}

func nonEmpty(s string) string {
	if s == "" {
		return "(unknown)"
	}
	return s
}

// UpdateBody is PATCH /api/clusters/{id}.
type UpdateBody struct {
	DisplayName *string               `json:"displayName,omitempty"`
	Environment *v1alpha1.Environment `json:"environment,omitempty"`
}

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b UpdateBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	op := audit.Op{Cluster: id, Kind: "Cluster", Name: id, Action: "update"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if _, err := UpdateInfo(ctx, a.Mgmt, id, b.DisplayName, b.Environment); err != nil {
			return "", err
		}
		var parts []string
		if b.Environment != nil {
			parts = append(parts, "environment "+string(*b.Environment))
		}
		if b.DisplayName != nil {
			parts = append(parts, "display name")
		}
		return strings.Join(parts, "; "), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"updated": true})
}

// rotate replaces a cluster's kubeconfig (credential rotation).
func (a *API) rotate(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b kubeconfigBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	op := audit.Op{Cluster: id, Kind: "Cluster", Name: id, Action: "rotate-credentials"}
	var summary *Summary
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		s, err := ReplaceKubeconfig(ctx, a.Mgmt, id, []byte(b.Kubeconfig), a.Opts)
		if err != nil {
			return "", err
		}
		summary = s
		return fmt.Sprintf("%s auth as %s", s.AuthMethod, nonEmpty(s.Identity)), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"summary": summary})
}

// setInstaller stores the cluster's installer credential (write-only).
func (a *API) setInstaller(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b kubeconfigBody
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	op := audit.Op{Cluster: id, Kind: "Cluster", Name: id, Action: "set-installer"}
	var summary *Summary
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		s, err := SetInstaller(ctx, a.Mgmt, id, []byte(b.Kubeconfig), a.Opts)
		if err != nil {
			return "", err
		}
		summary = s
		return fmt.Sprintf("installer: %s auth as %s", s.AuthMethod, nonEmpty(s.Identity)), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"summary": summary})
}

// removeInstaller drops the installer credential; plugin installs are then
// disabled on the cluster.
func (a *API) removeInstaller(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	id := r.PathValue("id")
	op := audit.Op{Cluster: id, Kind: "Cluster", Name: id, Action: "remove-installer"}
	if err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		return "plugin installs disabled", RemoveInstaller(ctx, a.Mgmt, id)
	}); err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"removed": true})
}

// projectsOn lists the Projects on a cluster, except those already being
// deleted with their remote resources abandoned (a previous removal).
func (a *API) projectsOn(ctx context.Context, id string) ([]v1alpha1.Project, error) {
	var l v1alpha1.ProjectList
	if err := a.Mgmt.List(ctx, &l); err != nil {
		return nil, err
	}
	var out []v1alpha1.Project
	for _, p := range l.Items {
		abandoned := p.DeletionTimestamp != nil && p.Annotations[v1alpha1.AnnotationAbandonRemote] == "true"
		if p.Spec.Cluster == id && !abandoned {
			out = append(out, p)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

// pluginsOn lists plugin installations on a cluster, except those already
// being removed with their remote resources abandoned.
func (a *API) pluginsOn(ctx context.Context, id string) ([]v1alpha1.PluginInstallation, error) {
	var l v1alpha1.PluginInstallationList
	if err := a.Mgmt.List(ctx, &l); err != nil {
		return nil, err
	}
	var out []v1alpha1.PluginInstallation
	for _, in := range l.Items {
		abandoned := in.DeletionTimestamp != nil && in.Annotations[v1alpha1.AnnotationAbandonRemote] == "true"
		if in.Spec.Cluster == id && !abandoned {
			out = append(out, in)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

// remove unregisters a cluster. ?confirm must repeat the id. While Projects
// use it, removal is refused unless ?abandon=true: their remote resources
// are then left in place and the Projects removed (each linked to this
// entry). Open streams for the cluster close when it leaves the registry.
func (a *API) remove(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	id := r.PathValue("id")
	abandon := r.URL.Query().Get("abandon") == "true"
	op := audit.Op{Cluster: id, Kind: "Cluster", Name: id, Action: "remove"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if r.URL.Query().Get("confirm") != id {
			return "", &InputError{Msg: "confirm must repeat the cluster id"}
		}
		if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: id}, &v1alpha1.Cluster{}); err != nil {
			if apierrors.IsNotFound(err) {
				return "", ErrNotFound
			}
			return "", err
		}
		projects, err := a.projectsOn(ctx, id)
		if err != nil {
			return "", err
		}
		var names []string
		for _, p := range projects {
			names = append(names, p.Name)
		}
		installs, err := a.pluginsOn(ctx, id)
		if err != nil {
			return "", err
		}
		var pluginNames []string
		for _, in := range installs {
			pluginNames = append(pluginNames, in.Spec.Plugin)
		}
		if (len(projects) > 0 || len(installs) > 0) && !abandon {
			return "", &conflictError{
				msg: fmt.Sprintf("%d Project(s) and %d plugin installation(s) use this cluster; remove them first or choose to abandon their remote resources",
					len(projects), len(installs)),
				projects: names, plugins: pluginNames,
			}
		}
		user := "unknown"
		if u, ok := auth.UserFrom(ctx); ok {
			user = u.Name
		}
		for i := range projects {
			p := &projects[i]
			patch := client.MergeFrom(p.DeepCopy())
			if p.Annotations == nil {
				p.Annotations = map[string]string{}
			}
			p.Annotations[v1alpha1.AnnotationAbandonRemote] = "true"
			p.Annotations[v1alpha1.AnnotationDeleteAuditID] = audit.IDFrom(ctx)
			p.Annotations[v1alpha1.AnnotationDeletedBy] = user
			if err := a.Mgmt.Patch(ctx, p, patch); err != nil {
				return "", fmt.Errorf("mark Project %s: %w", p.Name, err)
			}
			if err := a.Mgmt.Delete(ctx, p); err != nil && !apierrors.IsNotFound(err) {
				return "", fmt.Errorf("delete Project %s: %w", p.Name, err)
			}
		}
		for i := range installs {
			in := &installs[i]
			patch := client.MergeFrom(in.DeepCopy())
			if in.Annotations == nil {
				in.Annotations = map[string]string{}
			}
			in.Annotations[v1alpha1.AnnotationAbandonRemote] = "true"
			in.Annotations[v1alpha1.AnnotationRequestAuditID] = audit.IDFrom(ctx)
			in.Annotations[v1alpha1.AnnotationRequestedBy] = user
			if err := a.Mgmt.Patch(ctx, in, patch); err != nil {
				return "", fmt.Errorf("mark plugin installation %s: %w", in.Name, err)
			}
			if err := a.Mgmt.Delete(ctx, in); err != nil && !apierrors.IsNotFound(err) {
				return "", fmt.Errorf("delete plugin installation %s: %w", in.Name, err)
			}
		}
		if err := Unregister(ctx, a.Mgmt, id); err != nil {
			return "", err
		}
		var parts []string
		if len(names) > 0 {
			parts = append(parts, "Projects "+strings.Join(names, ", "))
		}
		if len(pluginNames) > 0 {
			parts = append(parts, "plugins "+strings.Join(pluginNames, ", "))
		}
		if len(parts) > 0 {
			return "removed; remote resources abandoned for " + strings.Join(parts, " and "), nil
		}
		return "removed", nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"removed": true})
}

// Overview is GET /api/clusters/{id}/overview. Counts the credentials may
// not see are null.
type Overview struct {
	View
	Nodes       *int           `json:"nodes"`
	Namespaces  *int           `json:"namespaces"`
	Pods        map[string]int `json:"pods,omitempty"` // by phase
	Deployments *int           `json:"deployments"`
	Services    *int           `json:"services"`
	Projects    *int           `json:"projects"`
}

func (a *API) overview(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	st, ok := a.Registry.Status(id)
	if !ok {
		writeErr(w, ErrNotFound)
		return
	}
	var info Info
	for _, i := range a.Registry.List() {
		if i.ID == id {
			info = i
		}
	}
	out := Overview{View: ToView(info, st)}
	if a.Mgmt != nil {
		if ps, err := a.projectsOn(r.Context(), id); err == nil {
			n := len(ps)
			out.Projects = &n
		}
	}
	cs, err := a.Registry.Client(id)
	if err != nil {
		httpjson.Write(w, http.StatusOK, out)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), a.timeout())
	defer cancel()
	count := func(list func() (int, error)) *int {
		n, err := list()
		if err != nil {
			return nil
		}
		return &n
	}
	opts := metav1.ListOptions{}
	out.Nodes = count(func() (int, error) {
		l, err := cs.CoreV1().Nodes().List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(l.Items), nil
	})
	out.Namespaces = count(func() (int, error) {
		l, err := cs.CoreV1().Namespaces().List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(l.Items), nil
	})
	out.Deployments = count(func() (int, error) {
		l, err := cs.AppsV1().Deployments("").List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(l.Items), nil
	})
	out.Services = count(func() (int, error) {
		l, err := cs.CoreV1().Services("").List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(l.Items), nil
	})
	if pods, err := cs.CoreV1().Pods("").List(ctx, opts); err == nil {
		out.Pods = map[string]int{}
		for _, p := range pods.Items {
			out.Pods[string(podPhase(&p))]++
		}
	}
	httpjson.Write(w, http.StatusOK, out)
}

func podPhase(p *corev1.Pod) corev1.PodPhase {
	if p.Status.Phase == "" {
		return corev1.PodUnknown
	}
	return p.Status.Phase
}
