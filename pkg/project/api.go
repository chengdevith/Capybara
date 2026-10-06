package project

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"strings"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/httpjson"
	"github.com/capybara/capybara/pkg/stream"
)

// API serves /api/projects. Projects live in capybara-mgmt; create,
// update and delete are audited (fail-closed).
type API struct {
	// Mgmt is nil when capybara-mgmt is not configured; MgmtErr says why.
	Mgmt      client.WithWatch
	MgmtErr   error
	Clusters  Clusters
	Config    *Config
	Protected []string
	Auditor   *audit.Auditor
	Logger    *slog.Logger
}

// Register adds the routes. Paths starting with "_" can never clash with a
// Project name (names are DNS labels).
func (a *API) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/projects", a.list)
	mux.HandleFunc("POST /api/projects", a.create)
	mux.HandleFunc("GET /api/projects/_config", a.config)
	mux.HandleFunc("GET /api/projects/_watch", a.watch)
	mux.HandleFunc("GET /api/projects/{name}", a.get)
	mux.HandleFunc("PATCH /api/projects/{name}", a.update)
	mux.HandleFunc("DELETE /api/projects/{name}", a.delete)
}

var (
	dnsLabel  = regexp.MustCompile(`^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`)
	ownerName = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._:@/-]*$`)
)

type badRequest string

func (e badRequest) Error() string { return string(e) }

type conflict string

func (e conflict) Error() string { return string(e) }

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

func writeErr(w http.ResponseWriter, err error) {
	var (
		bad  badRequest
		conf conflict
		onr  *audit.OutcomeNotRecordedError
	)
	switch {
	case errors.As(err, &onr):
		httpjson.Error(w, http.StatusInternalServerError, onr.Error())
	case errors.Is(err, audit.ErrUnavailable):
		httpjson.Error(w, http.StatusServiceUnavailable, err.Error())
	case errors.Is(err, audit.ErrDenied):
		httpjson.Error(w, http.StatusForbidden, err.Error())
	case errors.As(err, &bad):
		httpjson.Error(w, http.StatusBadRequest, err.Error())
	case errors.As(err, &conf), apierrors.IsConflict(err), apierrors.IsAlreadyExists(err):
		httpjson.Error(w, http.StatusConflict, err.Error())
	case apierrors.IsNotFound(err):
		httpjson.Error(w, http.StatusNotFound, err.Error())
	case apierrors.IsInvalid(err):
		httpjson.Error(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.Error(w, http.StatusBadGateway, err.Error())
	}
}

func decode(w http.ResponseWriter, r *http.Request, v any) error {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		return badRequest("invalid request body: " + err.Error())
	}
	return nil
}

func (a *API) list(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var l v1alpha1.ProjectList
	if err := a.Mgmt.List(r.Context(), &l); err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, &l)
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var p v1alpha1.Project
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: r.PathValue("name")}, &p); err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, &p)
}

// watch streams Project changes (same protocol as the cluster watch hub).
func (a *API) watch(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	rv := r.URL.Query().Get("resourceVersion")
	stream.ServeWatch(w, r, a.Logger.With("watch", "projects"), nil, func(ctx context.Context) (watch.Interface, error) {
		return a.Mgmt.Watch(ctx, &v1alpha1.ProjectList{}, &client.ListOptions{
			Raw: &metav1.ListOptions{ResourceVersion: rv, AllowWatchBookmarks: true},
		})
	}, nil)
}

// ConfigView is what the create form needs.
type ConfigView struct {
	Sizes     map[v1alpha1.Size]SizeSpec `json:"sizes"`
	Protected []string                   `json:"protected"`
	Clusters  []string                   `json:"clusters"`
}

func (a *API) config(w http.ResponseWriter, _ *http.Request) {
	var ids []string
	for _, c := range a.Clusters.List() {
		ids = append(ids, c.ID)
	}
	httpjson.Write(w, http.StatusOK, ConfigView{Sizes: a.Config.Sizes, Protected: a.Protected, Clusters: ids})
}

// CreateRequest is the body of POST /api/projects.
type CreateRequest struct {
	Name        string        `json:"name"`
	DisplayName string        `json:"displayName,omitempty"`
	Description string        `json:"description,omitempty"`
	Cluster     string        `json:"cluster"`
	Namespace   string        `json:"namespace,omitempty"` // default: name
	Owner       string        `json:"owner"`
	Size        v1alpha1.Size `json:"size"`
}

func (a *API) validateCommon(owner string, size v1alpha1.Size, displayName, description string) error {
	switch {
	case !ownerName.MatchString(owner) || len(owner) > 253:
		return badRequest("owner must be a group name (letters, digits, . _ : @ / -)")
	case a.Config.Sizes[size].Quota == nil:
		return badRequest(fmt.Sprintf("size must be S, M or L (got %q)", size))
	case len(displayName) > 128:
		return badRequest("displayName is too long (max 128)")
	case len(description) > 1024:
		return badRequest("description is too long (max 1024)")
	}
	return nil
}

func (a *API) knownCluster(id string) bool {
	for _, c := range a.Clusters.List() {
		if c.ID == id {
			return true
		}
	}
	return false
}

func (a *API) create(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var req CreateRequest
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	if req.Namespace == "" {
		req.Namespace = req.Name
	}
	if !dnsLabel.MatchString(req.Name) || len(req.Name) > 63 {
		writeErr(w, badRequest("name must be a DNS label (lowercase letters, digits, -; max 63)"))
		return
	}
	op := audit.Op{Cluster: req.Cluster, Namespace: req.Namespace, Kind: "Project", Name: req.Name, Action: "create"}
	var created *v1alpha1.Project
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		switch {
		case !dnsLabel.MatchString(req.Namespace) || len(req.Namespace) > 63:
			return "", badRequest("namespace must be a DNS label (max 63)")
		case !a.knownCluster(req.Cluster):
			return "", badRequest(fmt.Sprintf("cluster %q is not registered", req.Cluster))
		case IsProtected(req.Namespace, a.Protected):
			return "", fmt.Errorf("%w: namespace %q is protected and cannot be used by a Project", audit.ErrDenied, req.Namespace)
		}
		if err := a.validateCommon(req.Owner, req.Size, req.DisplayName, req.Description); err != nil {
			return "", err
		}
		if err := a.namespaceFree(ctx, req.Cluster, req.Namespace); err != nil {
			return "", err
		}
		p := &v1alpha1.Project{
			ObjectMeta: metav1.ObjectMeta{Name: req.Name},
			Spec: v1alpha1.ProjectSpec{
				DisplayName: req.DisplayName, Description: req.Description,
				Cluster: req.Cluster, Namespace: req.Namespace, Owner: req.Owner, Size: req.Size,
			},
		}
		if err := a.Mgmt.Create(ctx, p); err != nil {
			if apierrors.IsAlreadyExists(err) {
				return "", conflict(fmt.Sprintf("a Project named %q already exists", req.Name))
			}
			return "", err
		}
		created = p
		return fmt.Sprintf("size %s, owner %s, namespace %s in %s", req.Size, req.Owner, req.Namespace, req.Cluster), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusCreated, created)
}

// namespaceFree refuses a namespace another Project claims, or one that
// already exists in the cluster (Capybara never adopts). If the cluster
// cannot be reached the check is skipped: the controller reports it.
func (a *API) namespaceFree(ctx context.Context, clusterID, ns string) error {
	var l v1alpha1.ProjectList
	if err := a.Mgmt.List(ctx, &l); err != nil {
		return err
	}
	for _, p := range l.Items {
		if p.Spec.Cluster == clusterID && p.Spec.Namespace == ns {
			return conflict(fmt.Sprintf("namespace %q in %s already belongs to Project %q", ns, clusterID, p.Name))
		}
	}
	cs, err := a.Clusters.Client(clusterID)
	if err != nil {
		return nil
	}
	cctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if _, err := cs.CoreV1().Namespaces().Get(cctx, ns, metav1.GetOptions{}); err == nil {
		return conflict(fmt.Sprintf("namespace %q already exists in %s; Capybara never adopts existing namespaces", ns, clusterID))
	}
	return nil
}

// UpdateRequest is the body of PATCH /api/projects/{name}. Cluster and
// namespace cannot change.
type UpdateRequest struct {
	DisplayName *string        `json:"displayName,omitempty"`
	Owner       *string        `json:"owner,omitempty"`
	Size        *v1alpha1.Size `json:"size,omitempty"`
}

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var req UpdateRequest
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	name := r.PathValue("name")
	var p v1alpha1.Project
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: name}, &p); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: p.Spec.Cluster, Namespace: p.Spec.Namespace, Kind: "Project", Name: name, Action: "update"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !p.DeletionTimestamp.IsZero() {
			return "", conflict("the Project is being deleted")
		}
		var changes []string
		if req.Size != nil && *req.Size != p.Spec.Size {
			changes = append(changes, fmt.Sprintf("size %s → %s", p.Spec.Size, *req.Size))
			p.Spec.Size = *req.Size
		}
		if req.Owner != nil && *req.Owner != p.Spec.Owner {
			changes = append(changes, fmt.Sprintf("owner %s → %s", p.Spec.Owner, *req.Owner))
			p.Spec.Owner = *req.Owner
		}
		if req.DisplayName != nil && *req.DisplayName != p.Spec.DisplayName {
			changes = append(changes, "display name")
			p.Spec.DisplayName = *req.DisplayName
		}
		if err := a.validateCommon(p.Spec.Owner, p.Spec.Size, p.Spec.DisplayName, p.Spec.Description); err != nil {
			return "", err
		}
		if len(changes) == 0 {
			return "no changes", nil
		}
		if err := a.Mgmt.Update(ctx, &p); err != nil {
			return "", err
		}
		return strings.Join(changes, "; "), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, &p)
}

// delete asks for the Project's deletion. The controller then removes its
// namespace (if it is provably the Project's); that removal is audited and
// linked to this request's audit entry through an annotation.
func (a *API) delete(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	name, uid := r.PathValue("name"), r.URL.Query().Get("uid")
	var p v1alpha1.Project
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: name}, &p); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: p.Spec.Cluster, Namespace: p.Spec.Namespace, Kind: "Project", Name: name, Action: "delete"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if uid == "" || uid != string(p.UID) {
			return "", conflict("the Project changed since it was loaded (uid mismatch); reload and try again")
		}
		patch := client.MergeFrom(p.DeepCopy())
		if p.Annotations == nil {
			p.Annotations = map[string]string{}
		}
		p.Annotations[v1alpha1.AnnotationDeleteAuditID] = audit.IDFrom(ctx)
		if u, ok := auth.UserFrom(ctx); ok {
			p.Annotations[v1alpha1.AnnotationDeletedBy] = u.Name
		}
		if err := a.Mgmt.Patch(ctx, &p, patch); err != nil {
			return "", err
		}
		puid := p.UID
		if err := a.Mgmt.Delete(ctx, &p, &client.DeleteOptions{Preconditions: &metav1.Preconditions{UID: &puid}}); err != nil {
			return "", err
		}
		return fmt.Sprintf("deletion requested; the controller removes namespace %s from %s", p.Spec.Namespace, p.Spec.Cluster), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusAccepted, map[string]any{"deleting": true})
}
