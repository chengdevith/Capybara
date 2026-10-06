package project

import (
	corev1 "k8s.io/api/core/v1"

	"github.com/capybara/capybara/api/v1alpha1"
)

// Ownership says how an existing namespace relates to a Project.
type Ownership int

// Ownership values.
const (
	// Absent: there is no such namespace.
	Absent Ownership = iota
	// Owned: label and uid annotation both point at this Project.
	Owned
	// Foreign: not labelled for this Project (not created by Capybara, or by another Project).
	Foreign
	// Stale: labelled with this Project's name but created for a
	// different (earlier) Project with that name, or the uid is missing.
	Stale
)

// NamespaceOwnership checks label AND uid. Only Owned may ever be changed
// or deleted; everything else is a conflict.
func NamespaceOwnership(ns *corev1.Namespace, p *v1alpha1.Project) Ownership {
	if ns == nil {
		return Absent
	}
	if ns.Labels[v1alpha1.LabelProject] != p.Name {
		return Foreign
	}
	if uid := ns.Annotations[v1alpha1.AnnotationProjectUID]; uid == "" || uid != string(p.UID) {
		return Stale
	}
	return Owned
}
