package action

import (
	"context"
	"errors"
	"net/http"
	"regexp"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/httpjson"
)

// MaskPlaceholder is what a masked Secret value looks like. Applying it
// would overwrite the real value, so it is refused.
const MaskPlaceholder = "••••••••"

// Metadata fields set by the server; applying them is meaningless at best.
var serverOwnedMetadata = []string{
	"managedFields", "creationTimestamp", "generation", "selfLink",
	"deletionTimestamp", "deletionGracePeriodSeconds",
}

type applyRequest struct {
	Target Target         `json:"target"`
	Object map[string]any `json:"object"`
}

// Conflict is one field another manager owns with a different value.
type Conflict struct {
	Field   string `json:"field"`
	Manager string `json:"manager,omitempty"`
	// Subresource the manager wrote through, e.g. "scale".
	Subresource string `json:"subresource,omitempty"`
	Message     string `json:"message"`
}

// ConflictError is a 409 from server-side apply: either field-manager
// conflicts (force-apply possible) or a stale object (reload needed).
type ConflictError struct {
	Message   string     `json:"error"`
	Conflicts []Conflict `json:"conflicts,omitempty"`
	// Stale: the object changed since it was loaded (resourceVersion).
	Stale bool `json:"stale,omitempty"`
}

func (e *ConflictError) Error() string { return e.Message }

// AuditResult records conflicts as "conflict" rather than "failure".
func (e *ConflictError) AuditResult() audit.Result { return audit.ResultConflict }

var (
	conflictManager     = regexp.MustCompile(`conflict with "([^"]+)"`)
	conflictSubresource = regexp.MustCompile(`with subresource "([^"]+)"`)
)

// asConflict turns an apply 409 into a ConflictError, or returns err.
func asConflict(err error) error {
	var se apierrors.APIStatus
	if !apierrors.IsConflict(err) || !errors.As(err, &se) {
		return err
	}
	st := se.Status()
	ce := &ConflictError{Message: st.Message}
	if st.Details != nil {
		for _, c := range st.Details.Causes {
			if c.Type != metav1.CauseTypeFieldManagerConflict {
				continue
			}
			conflict := Conflict{Field: c.Field, Message: c.Message}
			if m := conflictManager.FindStringSubmatch(c.Message); m != nil {
				conflict.Manager = m[1]
			}
			if m := conflictSubresource.FindStringSubmatch(c.Message); m != nil {
				conflict.Subresource = m[1]
			}
			ce.Conflicts = append(ce.Conflicts, conflict)
		}
	}
	ce.Stale = len(ce.Conflicts) == 0
	return ce
}

// prepare checks the object against the target and strips what must not
// be applied. The editor can never create, rename or move objects.
func prepare(t Target, obj map[string]any) (*unstructured.Unstructured, error) {
	u := &unstructured.Unstructured{Object: obj}
	if u.GetAPIVersion() != t.APIVersion() {
		return nil, badRequest("apiVersion must stay %q", t.APIVersion())
	}
	if u.GetKind() != t.Kind {
		return nil, badRequest("kind must stay %q", t.Kind)
	}
	if u.GetName() != t.Name {
		return nil, badRequest("metadata.name must stay %q (renaming would create a new object)", t.Name)
	}
	switch ns := u.GetNamespace(); {
	case t.Namespace == "" && ns != "":
		return nil, badRequest("%s is cluster-scoped; remove metadata.namespace", t.Kind)
	case t.Namespace != "" && ns == "":
		u.SetNamespace(t.Namespace)
	case ns != t.Namespace:
		return nil, badRequest("metadata.namespace must stay %q", t.Namespace)
	}

	delete(u.Object, "status")
	if meta, ok := u.Object["metadata"].(map[string]any); ok {
		for _, f := range serverOwnedMetadata {
			delete(meta, f)
		}
	}
	if t.isSecret() {
		for _, field := range []string{"data", "stringData"} {
			values, _ := u.Object[field].(map[string]any)
			for k, v := range values {
				if v == MaskPlaceholder {
					return nil, badRequest("%s.%s is still masked; reveal the Secret before editing", field, k)
				}
			}
		}
	}
	return u, nil
}

// apply serves POST /api/clusters/{id}/apply?dryRun=true&force=true.
// Dry runs change nothing and are not audited.
func (h *Handlers) apply(w http.ResponseWriter, r *http.Request) {
	var req applyRequest
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	if err := req.Target.validate(); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	dyn, err := h.Clusters.Dynamic(id)
	if err != nil {
		writeErr(w, err)
		return
	}

	dryRun := r.URL.Query().Get("dryRun") == "true"
	force := r.URL.Query().Get("force") == "true"
	opts := metav1.ApplyOptions{FieldManager: FieldManager, Force: force}
	if dryRun {
		opts.DryRun = []string{metav1.DryRunAll}
	}

	t := req.Target
	res := dyn.Resource(t.GVR()).Namespace(t.Namespace)
	var result *unstructured.Unstructured
	run := func(ctx context.Context) (string, error) {
		// Inside the audited section: a refused edit is a recorded attempt.
		obj, err := prepare(t, req.Object)
		if err != nil {
			return "", err
		}
		out, err := res.Apply(ctx, t.Name, obj, opts)
		if err != nil {
			return "", asConflict(err)
		}
		result = out
		detail := "server-side apply as " + FieldManager
		if force {
			detail += " (forced)"
		}
		return detail, nil
	}

	if dryRun {
		_, err = run(r.Context())
	} else {
		act := "apply"
		if force {
			act = "apply-force"
		}
		err = h.Auditor.Do(r.Context(), t.op(id, act), run)
	}
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"object": result.Object, "dryRun": dryRun})
}
