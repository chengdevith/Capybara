package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"slices"
	"strings"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/httpjson"
)

// DynamicClients gives Capybara's own dynamic client for a cluster.
type DynamicClients interface {
	Dynamic(id string) (dynamic.Interface, error)
}

// ActionAPI runs plugins' declared actions (manifest `actions`) on their
// resources with Capybara's own account, which holds the plugin's console
// permissions while it is installed. What is written comes only from the
// declaration (a copy of declared fields, or a fixed merge patch), never
// from plugin code or the request. Every run is audited fail-closed.
//
// Before authentication every user may run them; from Phase 5 they must be
// checked against the user's own rights.
type ActionAPI struct {
	Mgmt     client.Client
	Clusters DynamicClients
	Auditor  *audit.Auditor
	Logger   *slog.Logger
	// Objects checks the result of actions that declare a policy (as for
	// plugin objects: policy, Project ServiceAccounts, dry run).
	Objects *ObjectAPI
}

// Register adds the route.
func (a *ActionAPI) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/clusters/{id}/plugin-actions/{plugin}/{action}", a.run)
}

// ActionRequest names the target object.
type ActionRequest struct {
	Namespace string `json:"namespace"`
	Name      string `json:"name"`
	// UID guards against acting on a re-created object.
	UID string `json:"uid"`
	// Inputs the action declares (typed values).
	Inputs map[string]any `json:"inputs,omitempty"`
	// ConfirmName repeats the object's name when the action asks for it.
	ConfirmName string `json:"confirmName,omitempty"`
}

// CopyAnnotation names the original of an object created by a copy action
// (an annotation: names can exceed a label value's 63 characters).
const CopyAnnotation = "platform.capybara.io/copy-of"

func (a *ActionAPI) run(w http.ResponseWriter, r *http.Request) {
	if a.Mgmt == nil {
		httpjson.Error(w, http.StatusServiceUnavailable, "capybara-mgmt is not available")
		return
	}
	id, pluginName, actionName := r.PathValue("id"), r.PathValue("plugin"), r.PathValue("action")
	var b ActionRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: id, Namespace: b.Namespace, Name: b.Name, Kind: "", Action: pluginName + "." + actionName}
	var p v1alpha1.Plugin
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: pluginName}, &p); err != nil {
		writeErr(w, errorf(http.StatusNotFound, "plugin %q is not in the catalog", pluginName))
		return
	}
	i := slices.IndexFunc(p.Spec.Actions, func(x v1alpha1.PluginAction) bool { return x.Name == actionName })
	if i < 0 {
		writeErr(w, errorf(http.StatusNotFound, "plugin %s declares no action %q", pluginName, actionName))
		return
	}
	action := p.Spec.Actions[i]
	op.Kind = action.Kind
	var created string
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !dnsRE.MatchString(b.Name) || (b.Namespace != "" && !dnsRE.MatchString(b.Namespace)) {
			return "", errorf(http.StatusBadRequest, "namespace and name must be Kubernetes names")
		}
		var in v1alpha1.PluginInstallation
		if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: v1alpha1.InstallationName(pluginName, id)}, &in); err != nil || !Usable(&in) {
			return "", fmt.Errorf("%w: %s is not installed and enabled on %s", audit.ErrDenied, p.Spec.DisplayName, id)
		}
		dyn, err := a.Clusters.Dynamic(id)
		if err != nil {
			return "", errorf(http.StatusServiceUnavailable, "cluster %s is not available", id)
		}
		res := dyn.Resource(schema.GroupVersionResource{Group: action.Group, Version: action.Version, Resource: action.Resource}).Namespace(b.Namespace)
		obj, err := res.Get(ctx, b.Name, metav1.GetOptions{})
		if err != nil {
			return "", err
		}
		if b.UID == "" || string(obj.GetUID()) != b.UID {
			return "", errorf(http.StatusConflict, "the %s changed since it was loaded (uid mismatch); reload and try again", action.Kind)
		}
		if why := conditionBlocks(obj, action.When); why != "" {
			return "", errorf(http.StatusConflict, "%s is not possible: %s", action.Title, why)
		}
		if action.RequiresStep != "" && !StepPassed(&in, action.RequiresStep) {
			return "", fmt.Errorf("%w: %s is view-only on %s (step %q has not passed)", audit.ErrDenied, p.Spec.DisplayName, id, action.RequiresStep)
		}
		if needsConfirm(action.ConfirmName, b.Inputs) && b.ConfirmName != b.Name {
			return "", errorf(http.StatusBadRequest, "%s: type the name %s to confirm", action.Title, b.Name)
		}
		if action.ProjectOnly {
			if err := RequireProjectNamespace(ctx, a.Mgmt, id, b.Namespace); err != nil {
				return "", err
			}
		}
		switch action.Type {
		case v1alpha1.ActionCopy:
			copied := copyOf(obj, action, pluginName)
			if action.Policy != "" {
				if err := a.checkPolicy(ctx, &p, action, id, b.Namespace, copied); err != nil {
					return "", err
				}
			}
			out, err := res.Create(ctx, copied, metav1.CreateOptions{FieldManager: "capybara"})
			if err != nil {
				return "", err
			}
			created = out.GetName()
			return fmt.Sprintf("created %s %s from %s", action.Kind, created, b.Name), nil
		case v1alpha1.ActionPatch:
			user, _ := auth.UserFrom(ctx)
			patch, err := RenderPatch(action, b.Inputs, user.Name)
			if err != nil {
				return "", err
			}
			if _, err := res.Patch(ctx, b.Name, types.MergePatchType, patch, metav1.PatchOptions{FieldManager: "capybara"}); err != nil {
				return "", err
			}
			return fmt.Sprintf("%s: applied %s", strings.ToLower(action.Title), string(patch)), nil
		}
		return "", errorf(http.StatusInternalServerError, "unknown action type %q", action.Type)
	})
	if err != nil {
		var status apierrors.APIStatus
		if errors.As(err, &status) && !errors.Is(err, audit.ErrUnavailable) {
			s := status.Status()
			code := int(s.Code)
			if code < 400 || code > 599 {
				code = http.StatusBadGateway
			}
			httpjson.Write(w, code, map[string]any{"error": s.Message})
			return
		}
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"ok": true, "created": created})
}

// checkPolicy holds an action's result to its policy, like a plugin object
// write: policy, Project ServiceAccounts, references, dry run.
func (a *ActionAPI) checkPolicy(ctx context.Context, p *v1alpha1.Plugin, action v1alpha1.PluginAction, clusterID, ns string, u *unstructured.Unstructured) error {
	if a.Objects == nil {
		return errorf(http.StatusServiceUnavailable, "policy checks are not available")
	}
	decl := v1alpha1.PluginObject{Name: action.Resource, Group: action.Group, Version: action.Version, Resource: action.Resource, Kind: action.Kind}
	if i := slices.IndexFunc(p.Spec.Objects, func(o v1alpha1.PluginObject) bool { return o.Group == action.Group && o.Resource == action.Resource }); i >= 0 {
		decl = p.Spec.Objects[i]
	}
	decl.Policy = action.Policy
	dyn, err := a.Objects.Clusters.Dynamic(clusterID)
	if err != nil {
		return errorf(http.StatusServiceUnavailable, "cluster %s is not available", clusterID)
	}
	cs, err := a.Objects.Clusters.Client(clusterID)
	if err != nil {
		return errorf(http.StatusServiceUnavailable, "cluster %s is not available", clusterID)
	}
	project, err := ProjectOf(ctx, a.Mgmt, clusterID, ns)
	if err != nil {
		return err
	}
	t := &target{plugin: p, object: decl, cluster: clusterID, ns: ns, project: project, dyn: dyn, cs: cs}
	checked, err := a.Objects.check(ctx, t, u, v1alpha1.ObjectCreate)
	if err != nil {
		return err
	}
	if len(checked.Problems) > 0 {
		return fmt.Errorf("%w: %w", audit.ErrDenied, problemsError(checked))
	}
	return nil
}

// conditionBlocks says why `when` does not hold for obj ("" when it does).
func conditionBlocks(obj *unstructured.Unstructured, when *v1alpha1.ActionCondition) string {
	if when == nil {
		return ""
	}
	for _, f := range when.Absent {
		if v, ok, _ := unstructured.NestedFieldNoCopy(obj.Object, strings.Split(f, ".")...); ok && v != nil {
			return f + " is set"
		}
	}
	if when.Type == "" {
		return ""
	}
	conds, _, _ := unstructured.NestedSlice(obj.Object, "status", "conditions")
	status := "Unknown" // no condition yet: not finished
	for _, c := range conds {
		m, _ := c.(map[string]any)
		if m["type"] == when.Type {
			status, _ = m["status"].(string)
		}
	}
	if slices.Contains(when.Status, status) {
		return ""
	}
	return fmt.Sprintf("%s is %s", when.Type, status)
}

// needsConfirm: the action asks for the name (always, or for one input value).
func needsConfirm(c *v1alpha1.ActionConfirm, inputs map[string]any) bool {
	if c == nil {
		return false
	}
	return c.Input == "" || fmt.Sprint(inputs[c.Input]) == c.Equals
}

// RenderPatch fills an action's merge patch: each string value
// "$(inputs.<name>)" becomes that input's typed value (a missing optional
// input removes the field) and "$(user)" the requesting user. Inputs are
// checked against their declarations; undeclared ones are refused.
func RenderPatch(action v1alpha1.PluginAction, inputs map[string]any, user string) ([]byte, error) {
	decl := map[string]v1alpha1.ActionInput{}
	for _, in := range action.Inputs {
		decl[in.Name] = in
	}
	for k, v := range inputs {
		d, ok := decl[k]
		if !ok {
			return nil, errorf(http.StatusBadRequest, "%s takes no input %q", action.Title, k)
		}
		switch d.Type {
		case "bool":
			if _, ok := v.(bool); !ok {
				return nil, errorf(http.StatusBadRequest, "%s: %s must be true or false", action.Title, k)
			}
		default:
			s, ok := v.(string)
			if !ok {
				return nil, errorf(http.StatusBadRequest, "%s: %s must be a string", action.Title, k)
			}
			if d.Pattern != "" && !regexp.MustCompile(`^(?:`+d.Pattern+`)$`).MatchString(s) {
				return nil, errorf(http.StatusBadRequest, "%s: %s %q is not valid", action.Title, k, s)
			}
		}
	}
	for _, d := range action.Inputs {
		if _, ok := inputs[d.Name]; !ok && !d.Optional {
			return nil, errorf(http.StatusBadRequest, "%s: %s is required", action.Title, d.Name)
		}
	}
	var patch any
	if err := json.Unmarshal(action.Patch.Raw, &patch); err != nil {
		return nil, err
	}
	var fill func(v any) (any, bool)
	fill = func(v any) (any, bool) {
		switch v := v.(type) {
		case string:
			if v == "$(user)" {
				return user, true
			}
			if name, ok := strings.CutPrefix(v, "$(inputs."); ok && strings.HasSuffix(name, ")") {
				val, ok := inputs[strings.TrimSuffix(name, ")")]
				return val, ok
			}
			return v, true
		case map[string]any:
			for k, x := range v {
				if nv, keep := fill(x); keep {
					v[k] = nv
				} else {
					delete(v, k)
				}
			}
			return v, true
		case []any:
			out := v[:0]
			for _, x := range v {
				if nv, keep := fill(x); keep {
					out = append(out, nv)
				}
			}
			return out, true
		}
		return v, true
	}
	patch, _ = fill(patch)
	return json.Marshal(patch)
}

// copyOf builds the new object of a copy action: same kind and namespace,
// generateName from the original, the original's labels except those the
// tool itself sets (its API group's prefix), and only the declared fields.
func copyOf(orig *unstructured.Unstructured, action v1alpha1.PluginAction, plugin string) *unstructured.Unstructured {
	out := &unstructured.Unstructured{Object: map[string]any{}}
	out.SetAPIVersion(orig.GetAPIVersion())
	out.SetKind(orig.GetKind())
	out.SetNamespace(orig.GetNamespace())
	base := orig.GetName()
	if len(base) > 50 {
		base = base[:50]
	}
	out.SetGenerateName(strings.TrimRight(base, "-.") + "-")
	labels := map[string]string{}
	for k, v := range orig.GetLabels() {
		if action.Group != "" && strings.Contains(k, action.Group+"/") {
			continue
		}
		labels[k] = v
	}
	labels[v1alpha1.LabelPlugin] = plugin
	out.SetLabels(labels)
	out.SetAnnotations(map[string]string{CopyAnnotation: orig.GetName()})
	for _, f := range action.CopyFields {
		path := strings.Split(f, ".")
		if v, ok, _ := unstructured.NestedFieldCopy(orig.Object, path...); ok {
			_ = unstructured.SetNestedField(out.Object, v, path...)
		}
	}
	return out
}
