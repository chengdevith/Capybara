// Package action holds the user-initiated operations that change a
// cluster (apply, scale, restart, delete) or read sensitive data (reveal a
// Secret). Every one runs through the auditor, which refuses the operation
// if its attempt cannot be recorded. The passthrough proxy stays read-only:
// this package is the only way to write.
package action

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"path"
	"regexp"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

// FieldManager is the server-side apply field manager for edits made in Capybara.
const FieldManager = "capybara"

const maxBody = 2 << 20

// Handlers serves the action endpoints.
type Handlers struct {
	Clusters cluster.Provider
	Auditor  *audit.Auditor
	// Protected namespace patterns (path.Match); these can never be deleted.
	Protected []string
	Logger    *slog.Logger
	// Governed names the plugin that manages writes of a kind (its
	// declared objects), whose own pages must be used ("" when none).
	Governed func(ctx context.Context, group, resource string) string
}

// guardGoverned refuses generic writes to a kind a plugin manages: they go
// through that plugin's validated writes instead.
func (h *Handlers) guardGoverned(ctx context.Context, t Target) error {
	if h.Governed == nil {
		return nil
	}
	if plugin := h.Governed(ctx, t.Group, t.Resource); plugin != "" {
		return fmt.Errorf("%w: %s %s is managed by the %s plugin; edit or delete it in its pages", audit.ErrDenied, t.Kind, t.Name, plugin)
	}
	return nil
}

// Register adds the action routes to mux.
func (h *Handlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/clusters/{id}/apply", h.apply)
	mux.HandleFunc("POST /api/clusters/{id}/actions/scale", h.scale)
	mux.HandleFunc("POST /api/clusters/{id}/actions/restart", h.restart)
	mux.HandleFunc("POST /api/clusters/{id}/actions/delete", h.delete)
	mux.HandleFunc("GET /api/clusters/{id}/secrets/{namespace}/{name}", h.revealSecret)
}

// Target identifies the object an action is about.
type Target struct {
	Group     string `json:"group"`
	Version   string `json:"version"`
	Resource  string `json:"resource"` // plural, e.g. "deployments"
	Kind      string `json:"kind"`
	Namespace string `json:"namespace,omitempty"`
	Name      string `json:"name"`
}

var (
	dnsName = regexp.MustCompile(`^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$`)
	version = regexp.MustCompile(`^v[0-9]+((alpha|beta)[0-9]+)?$`)
	kind    = regexp.MustCompile(`^[A-Z][A-Za-z0-9]*$`)
)

func (t Target) validate() error {
	switch {
	case !dnsName.MatchString(t.Resource):
		return badRequest("target.resource is required (plural, e.g. deployments)")
	case !version.MatchString(t.Version):
		return badRequest("target.version is required (e.g. v1)")
	case t.Group != "" && !dnsName.MatchString(t.Group):
		return badRequest("invalid target.group")
	case !kind.MatchString(t.Kind):
		return badRequest("target.kind is required (e.g. Deployment)")
	case !dnsName.MatchString(t.Name):
		return badRequest("target.name is required")
	case t.Namespace != "" && !dnsName.MatchString(t.Namespace):
		return badRequest("invalid target.namespace")
	}
	return nil
}

// GVR of the target.
func (t Target) GVR() schema.GroupVersionResource {
	return schema.GroupVersionResource{Group: t.Group, Version: t.Version, Resource: t.Resource}
}

// APIVersion as written in objects, e.g. "apps/v1" or "v1".
func (t Target) APIVersion() string {
	return schema.GroupVersion{Group: t.Group, Version: t.Version}.String()
}

func (t Target) isSecret() bool { return t.Group == "" && t.Resource == "secrets" }

func (t Target) op(clusterID, act string) audit.Op {
	return audit.Op{
		Cluster: clusterID, Namespace: t.Namespace, Kind: t.Kind, Name: t.Name,
		Action: act, Sensitive: t.isSecret(),
	}
}

// errKubeconfigSecret refuses actions on Capybara's own kubeconfig Secrets.
var errKubeconfigSecret = fmt.Errorf("%w: this Secret holds a Capybara credential (cluster kubeconfig, installer or plugin credential); manage it from the Clusters or Marketplace pages", audit.ErrDenied)

// guardKubeconfigSecret refuses reveal, edit and delete of Secrets of
// Capybara's credential types, on any cluster: their values never leave
// Capybara.
func (h *Handlers) guardKubeconfigSecret(ctx context.Context, id string, t Target, declaredType string) error {
	if !t.isSecret() {
		return nil
	}
	if v1alpha1.IsCredentialSecretType(declaredType) {
		return errKubeconfigSecret
	}
	client, err := h.Clusters.Client(id)
	if err != nil {
		return err
	}
	s, err := client.CoreV1().Secrets(t.Namespace).Get(ctx, t.Name, metav1.GetOptions{})
	switch {
	case apierrors.IsNotFound(err):
		return nil
	case err != nil:
		return err
	case v1alpha1.IsCredentialSecretType(string(s.Type)):
		return errKubeconfigSecret
	}
	return nil
}

// IsProtected reports whether namespace matches one of the patterns.
func IsProtected(namespace string, patterns []string) bool {
	for _, p := range patterns {
		if ok, _ := path.Match(p, namespace); ok {
			return true
		}
	}
	return false
}

type badRequestError struct{ msg string }

func (e badRequestError) Error() string { return e.msg }

func badRequest(format string, args ...any) error {
	return badRequestError{msg: fmt.Sprintf(format, args...)}
}

func decode(w http.ResponseWriter, r *http.Request, v any) error {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBody))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		return badRequest("invalid request body: %v", err)
	}
	return nil
}

// writeErr maps an action error to an HTTP response. Messages go to the
// user who made the request; they are never logged here.
func writeErr(w http.ResponseWriter, err error) {
	var (
		bad      badRequestError
		onr      *audit.OutcomeNotRecordedError
		conflict *ConflictError
		status   apierrors.APIStatus
	)
	switch {
	case errors.As(err, &onr):
		httpjson.Error(w, http.StatusInternalServerError, onr.Error())
	case errors.Is(err, audit.ErrUnavailable):
		httpjson.Error(w, http.StatusServiceUnavailable, err.Error())
	case errors.As(err, &bad):
		httpjson.Error(w, http.StatusBadRequest, bad.msg)
	case errors.Is(err, audit.ErrDenied):
		httpjson.Error(w, http.StatusForbidden, err.Error())
	case errors.As(err, &conflict):
		httpjson.Write(w, http.StatusConflict, conflict)
	case errors.Is(err, cluster.ErrNotFound):
		httpjson.Error(w, http.StatusNotFound, err.Error())
	case errors.As(err, &status):
		s := status.Status()
		code := int(s.Code)
		if code < 400 || code > 599 {
			code = http.StatusBadGateway
		}
		httpjson.Write(w, code, map[string]any{"error": s.Message, "reason": s.Reason})
	default:
		httpjson.Error(w, http.StatusBadGateway, err.Error())
	}
}
