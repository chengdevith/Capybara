package action

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/types"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/httpjson"
	"github.com/capybara/capybara/pkg/sensitive"
)

const maxReplicas = 10000

// RestartAnnotation is the pod template annotation kubectl rollout restart sets.
const RestartAnnotation = "kubectl.kubernetes.io/restartedAt"

// Kinds that can be restarted by touching their pod template.
var restartable = map[string]bool{"deployments": true, "statefulsets": true, "daemonsets": true}

// scale serves POST /api/clusters/{id}/actions/scale {target, replicas}.
// It goes through the scale subresource, so it works for any scalable kind.
func (h *Handlers) scale(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Target   Target `json:"target"`
		Replicas *int   `json:"replicas"`
	}
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	if err := req.Target.validate(); err != nil {
		writeErr(w, err)
		return
	}
	id, t := r.PathValue("id"), req.Target
	n := -1
	if req.Replicas != nil {
		n = *req.Replicas
	}
	dyn, err := h.Clusters.Dynamic(id)
	if err != nil {
		writeErr(w, err)
		return
	}
	res := dyn.Resource(t.GVR()).Namespace(t.Namespace)

	err = h.Auditor.Do(r.Context(), t.op(id, "scale"), func(ctx context.Context) (string, error) {
		if n < 0 || n > maxReplicas {
			return "", badRequest("replicas must be between 0 and %d", maxReplicas)
		}
		before := "?"
		if cur, err := res.Get(ctx, t.Name, metav1.GetOptions{}, "scale"); err == nil {
			if v, found, _ := unstructured.NestedInt64(cur.Object, "spec", "replicas"); found {
				before = fmt.Sprint(v)
			}
		}
		patch, _ := json.Marshal(map[string]any{"spec": map[string]any{"replicas": n}})
		if _, err := res.Patch(ctx, t.Name, types.MergePatchType, patch, metav1.PatchOptions{FieldManager: FieldManager}, "scale"); err != nil {
			return "", err
		}
		return fmt.Sprintf("replicas %s → %d", before, n), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"replicas": n})
}

// restart serves POST /api/clusters/{id}/actions/restart {target}, the
// same way `kubectl rollout restart` does: a new restartedAt annotation on
// the pod template triggers a rolling update.
func (h *Handlers) restart(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Target Target `json:"target"`
	}
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	if err := req.Target.validate(); err != nil {
		writeErr(w, err)
		return
	}
	t, id := req.Target, r.PathValue("id")
	dyn, err := h.Clusters.Dynamic(id)
	if err != nil {
		writeErr(w, err)
		return
	}
	at := time.Now().Format(time.RFC3339)
	err = h.Auditor.Do(r.Context(), t.op(id, "restart"), func(ctx context.Context) (string, error) {
		if t.Group != "apps" || !restartable[t.Resource] {
			return "", badRequest("only Deployments, StatefulSets and DaemonSets can be restarted")
		}
		patch, _ := json.Marshal(map[string]any{"spec": map[string]any{"template": map[string]any{
			"metadata": map[string]any{"annotations": map[string]string{RestartAnnotation: at}},
		}}})
		_, err := dyn.Resource(t.GVR()).Namespace(t.Namespace).
			Patch(ctx, t.Name, types.StrategicMergePatchType, patch, metav1.PatchOptions{FieldManager: FieldManager})
		if err != nil {
			return "", err
		}
		return "restartedAt " + at, nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"restartedAt": at})
}

// delete serves POST /api/clusters/{id}/actions/delete {target, uid}.
// The uid precondition guarantees we delete the object the user saw, not
// a newer one with the same name. Protected namespaces are refused (and
// the refusal is audited).
func (h *Handlers) delete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Target Target `json:"target"`
		UID    string `json:"uid"`
	}
	if err := decode(w, r, &req); err != nil {
		writeErr(w, err)
		return
	}
	if err := req.Target.validate(); err != nil {
		writeErr(w, err)
		return
	}
	id, t := r.PathValue("id"), req.Target
	dyn, err := h.Clusters.Dynamic(id)
	if err != nil {
		writeErr(w, err)
		return
	}
	isNamespace := t.Group == "" && t.Resource == "namespaces"

	err = h.Auditor.Do(r.Context(), t.op(id, "delete"), func(ctx context.Context) (string, error) {
		if req.UID == "" {
			return "", badRequest("uid is required")
		}
		if err := h.guardKubeconfigSecret(ctx, id, t, ""); err != nil {
			return "", err
		}
		if isNamespace && IsProtected(t.Name, h.Protected) {
			return "", fmt.Errorf("%w: namespace %q is protected and cannot be deleted", audit.ErrDenied, t.Name)
		}
		uid := types.UID(req.UID)
		policy := metav1.DeletePropagationBackground
		err := dyn.Resource(t.GVR()).Namespace(t.Namespace).Delete(ctx, t.Name, metav1.DeleteOptions{
			Preconditions:     &metav1.Preconditions{UID: &uid},
			PropagationPolicy: &policy,
		})
		if err != nil {
			return "", err
		}
		return "deleted (uid " + req.UID + ")", nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"deleted": true})
}

// revealSecret serves GET /api/clusters/{id}/secrets/{namespace}/{name}:
// the only way Secret values reach the browser. Each reveal is audited.
func (h *Handlers) revealSecret(w http.ResponseWriter, r *http.Request) {
	id, ns, name := r.PathValue("id"), r.PathValue("namespace"), r.PathValue("name")
	t := Target{Version: "v1", Resource: "secrets", Kind: "Secret", Namespace: ns, Name: name}
	if err := t.validate(); err != nil {
		writeErr(w, err)
		return
	}
	client, err := h.Clusters.Client(id)
	if err != nil {
		writeErr(w, err)
		return
	}
	var secret *corev1.Secret
	err = h.Auditor.Do(r.Context(), t.op(id, "reveal"), func(ctx context.Context) (string, error) {
		s, err := client.CoreV1().Secrets(ns).Get(ctx, name, metav1.GetOptions{})
		if err != nil {
			return "", err
		}
		if v1alpha1.IsCredentialSecretType(string(s.Type)) {
			return "", errKubeconfigSecret // never returned, not even on reveal
		}
		secret = s
		return fmt.Sprintf("%d keys revealed", len(s.Data)), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	sensitive.ScrubMeta(&secret.ObjectMeta) // values are in data; no second copy
	secret.APIVersion, secret.Kind = "v1", "Secret"
	w.Header().Set("Cache-Control", "no-store")
	httpjson.Write(w, http.StatusOK, secret)
}
