package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/dynamic"
	"k8s.io/utils/ptr"

	"github.com/capybara/capybara/api/v1alpha1"
)

// LabelProjectObject marks an object generated for one Project (value: the
// Project's name), so objects of Projects that are gone can be removed.
const LabelProjectObject = "platform.capybara.io/project-object"

// ProjectRef is a Ready Project on a cluster.
type ProjectRef struct {
	Name      string
	Namespace string
}

// RenderProjectObject fills one template for one Project. Placeholders
// ({{project}}, {{namespace}}, {{cluster}}, {{pluginNamespace}}) are
// replaced inside JSON strings, so a value can never break out of one.
func RenderProjectObject(tpl v1alpha1.ProjectObject, pr ProjectRef, clusterID, pluginNamespace string) (*unstructured.Unstructured, error) {
	raw := string(tpl.Template.Raw)
	for k, v := range map[string]string{"project": pr.Name, "namespace": pr.Namespace, "cluster": clusterID, "pluginNamespace": pluginNamespace} {
		b, _ := json.Marshal(v)
		raw = strings.ReplaceAll(raw, "{{"+k+"}}", string(b[1:len(b)-1]))
	}
	obj := &unstructured.Unstructured{}
	if err := json.Unmarshal([]byte(raw), &obj.Object); err != nil {
		return nil, fmt.Errorf("project object template: %w", err)
	}
	if obj.GetAPIVersion() == "" || obj.GetKind() == "" || obj.GetName() == "" {
		return nil, fmt.Errorf("project object template needs apiVersion, kind and metadata.name")
	}
	if !dnsRE.MatchString(tpl.Resource) {
		return nil, fmt.Errorf("project object %s needs its resource (plural)", obj.GetKind())
	}
	ns := pr.Namespace
	if tpl.InPluginNamespace {
		ns = pluginNamespace
	}
	obj.SetNamespace(ns)
	return obj, nil
}

// projectObjectAPIVersion reads a template's apiVersion ("" if invalid).
func projectObjectAPIVersion(tpl v1alpha1.ProjectObject) string {
	var head struct {
		APIVersion string `json:"apiVersion"`
	}
	_ = json.Unmarshal(tpl.Template.Raw, &head)
	return head.APIVersion
}

// projectObjectGVR is a template's resource.
func projectObjectGVR(tpl v1alpha1.ProjectObject, obj *unstructured.Unstructured) schema.GroupVersionResource {
	gv, _ := schema.ParseGroupVersion(obj.GetAPIVersion())
	return gv.WithResource(tpl.Resource)
}

// syncProjectObjects makes the plugin's generated per-Project objects
// exactly those of the given Projects: applied (server-side, labelled) for
// each, and removed for Projects that are gone. An existing object Capybara
// did not create is never adopted; it is reported instead.
func syncProjectObjects(ctx context.Context, dyn dynamic.Interface, plugin, clusterID, pluginNamespace string,
	templates []v1alpha1.ProjectObject, projects []ProjectRef) ([]string, error) {
	var problems []string
	type key struct {
		gvr       schema.GroupVersionResource
		namespace string
		name      string
	}
	type scope struct {
		gvr       schema.GroupVersionResource
		namespace string // "": every namespace
	}
	want := map[key]bool{}
	var scopes []scope
	opts := metav1.PatchOptions{FieldManager: "capybara-controller", Force: ptr.To(true)}
	for _, tpl := range templates {
		probe, err := RenderProjectObject(tpl, ProjectRef{Name: "x", Namespace: "x"}, clusterID, pluginNamespace)
		if err != nil {
			return nil, err
		}
		gvr := projectObjectGVR(tpl, probe)
		sc := scope{gvr: gvr}
		if tpl.InPluginNamespace {
			sc.namespace = pluginNamespace
		}
		if !slices.Contains(scopes, sc) {
			scopes = append(scopes, sc)
		}
		for _, pr := range projects {
			obj, err := RenderProjectObject(tpl, pr, clusterID, pluginNamespace)
			if err != nil {
				return nil, err
			}
			labels := obj.GetLabels()
			if labels == nil {
				labels = map[string]string{}
			}
			for k, v := range pluginLabels(plugin, clusterID) {
				labels[k] = v
			}
			labels[LabelProjectObject] = pr.Name
			obj.SetLabels(labels)
			res := dyn.Resource(gvr).Namespace(obj.GetNamespace())
			existing, err := res.Get(ctx, obj.GetName(), metav1.GetOptions{})
			if err == nil && existing.GetLabels()[LabelProjectObject] != pr.Name {
				problems = append(problems, fmt.Sprintf("%s %s/%s exists and was not created by Capybara for Project %s (never adopted)",
					obj.GetKind(), obj.GetNamespace(), obj.GetName(), pr.Name))
				continue
			}
			if err != nil && !apierrors.IsNotFound(err) {
				return nil, err
			}
			body, _ := json.Marshal(obj.Object)
			if _, err := res.Patch(ctx, obj.GetName(), types.ApplyPatchType, body, opts); err != nil {
				return nil, fmt.Errorf("%s %s/%s: %w", obj.GetKind(), obj.GetNamespace(), obj.GetName(), err)
			}
			want[key{gvr, obj.GetNamespace(), obj.GetName()}] = true
		}
	}

	// Remove what no longer belongs to a Project.
	selector := metav1.ListOptions{LabelSelector: v1alpha1.LabelPlugin + "=" + plugin + "," + LabelProjectObject}
	for _, sc := range scopes {
		list, err := dyn.Resource(sc.gvr).Namespace(sc.namespace).List(ctx, selector)
		if apierrors.IsNotFound(err) || meta.IsNoMatchError(err) {
			continue // the kind is not served (e.g. its CRD was removed)
		}
		if err != nil {
			return nil, fmt.Errorf("list generated %s: %w", sc.gvr.Resource, err)
		}
		for _, o := range list.Items {
			if want[key{sc.gvr, o.GetNamespace(), o.GetName()}] {
				continue
			}
			if err := dyn.Resource(sc.gvr).Namespace(o.GetNamespace()).Delete(ctx, o.GetName(), metav1.DeleteOptions{}); err != nil && !apierrors.IsNotFound(err) {
				return nil, err
			}
		}
	}
	return problems, nil
}
