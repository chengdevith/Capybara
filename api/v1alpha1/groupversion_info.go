// Package v1alpha1 holds Capybara's CRD types (group platform.capybara.io).
// It depends only on k8s.io/apimachinery, so anything can import it.
//
// +kubebuilder:object:generate=true
// +groupName=platform.capybara.io
package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

var (
	// GroupVersion is the group and version of these types.
	GroupVersion = schema.GroupVersion{Group: "platform.capybara.io", Version: "v1alpha1"}

	// SchemeBuilder adds the types to a scheme.
	SchemeBuilder = runtime.NewSchemeBuilder(addKnownTypes)

	// AddToScheme adds the types in this group-version to a scheme.
	AddToScheme = SchemeBuilder.AddToScheme
)

func addKnownTypes(s *runtime.Scheme) error {
	s.AddKnownTypes(GroupVersion, &Project{}, &ProjectList{}, &Cluster{}, &ClusterList{},
		&PluginRepository{}, &PluginRepositoryList{}, &Plugin{}, &PluginList{},
		&PluginInstallation{}, &PluginInstallationList{})
	metav1.AddToGroupVersion(s, GroupVersion)
	return nil
}
