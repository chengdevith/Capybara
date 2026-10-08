package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Labels, annotations and finalizer the Project controller puts on things.
const (
	// LabelProject marks every remote resource of a Project (value: name).
	LabelProject = "platform.capybara.io/project"
	// AnnotationProjectUID records which Project (by uid) created a remote
	// resource. Label and uid must both match before anything counts as
	// owned; a name reused by a newer Project is not ownership.
	AnnotationProjectUID = "platform.capybara.io/project-uid"
	// LabelManagedBy is the standard managed-by label.
	LabelManagedBy = "app.kubernetes.io/managed-by"
	// ManagedByValue is our value for LabelManagedBy.
	ManagedByValue = "capybara"

	// FinalizerRemoteCleanup keeps a Project until its remote resources are gone.
	FinalizerRemoteCleanup = "platform.capybara.io/remote-cleanup"

	// AnnotationDeleteAuditID links a Project's deletion to the audit
	// entry of the user's delete request.
	AnnotationDeleteAuditID = "platform.capybara.io/delete-audit-id"
	// AnnotationDeletedBy records who asked for the deletion.
	AnnotationDeletedBy = "platform.capybara.io/deleted-by"
)

// Size picks a quota preset. Values come from configuration
// (deploy/project-sizes.yaml), not code.
// +kubebuilder:validation:Enum=S;M;L
type Size string

// Sizes.
const (
	SizeS Size = "S"
	SizeM Size = "M"
	SizeL Size = "L"
)

// ProjectSpec is the desired state of a Project.
type ProjectSpec struct {
	// DisplayName is a human-friendly name.
	// +kubebuilder:validation:MaxLength=128
	// +optional
	DisplayName string `json:"displayName,omitempty"`

	// Description says what the Project is for.
	// +kubebuilder:validation:MaxLength=1024
	// +optional
	Description string `json:"description,omitempty"`

	// Cluster is the id of the managed cluster the Project lives in.
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=63
	// +kubebuilder:validation:Pattern=`^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`
	// +kubebuilder:validation:XValidation:rule="self == oldSelf",message="cluster cannot be changed"
	Cluster string `json:"cluster"`

	// Namespace is created in the cluster for this Project.
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=63
	// +kubebuilder:validation:Pattern=`^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`
	// +kubebuilder:validation:XValidation:rule="self == oldSelf",message="namespace cannot be changed"
	Namespace string `json:"namespace"`

	// Owner is a group name; it gets the admin role in the namespace
	// (RoleBinding with a Group subject).
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=253
	// +kubebuilder:validation:Pattern=`^[A-Za-z0-9][A-Za-z0-9._:@/-]*$`
	Owner string `json:"owner"`

	// Size is the quota preset.
	Size Size `json:"size"`
}

// Phase is a short summary of a Project's state.
// +kubebuilder:validation:Enum=Pending;Ready;Error;Terminating
type Phase string

// Phases.
const (
	PhasePending     Phase = "Pending"
	PhaseReady       Phase = "Ready"
	PhaseError       Phase = "Error"
	PhaseTerminating Phase = "Terminating"
)

// Condition types and reasons.
const (
	ConditionReady            = "Ready"
	ConditionClusterReachable = "ClusterReachable"
	// ConditionPodSecurity: the namespace's Pod Security labels are set;
	// False when pods that existed then violate the enforced level (they
	// keep running, but fail on their next restart or rollout).
	ConditionPodSecurity = "PodSecurity"

	ReasonReconciled         = "Reconciled"
	ReasonClusterUnreachable = "ClusterUnreachable"
	ReasonUnknownCluster     = "UnknownCluster"
	ReasonNamespaceConflict  = "NamespaceConflict"
	ReasonStaleOwner         = "StaleOwner"
	ReasonProtectedNamespace = "ProtectedNamespace"
	ReasonUnknownSize        = "UnknownSize"
	ReasonApplyFailed        = "ApplyFailed"
	ReasonTerminating        = "Terminating"
	ReasonReachable          = "Reachable"
	ReasonEnforced           = "Enforced"
	ReasonExistingViolations = "ExistingPodsViolate"
)

// Pod Security levels every Project namespace gets.
const (
	PodSecurityEnforce = "baseline"
	PodSecurityWarn    = "restricted"
)

// PodSecurityStatus records the Pod Security levels set on the namespace and
// what Kubernetes reported about existing pods when they were set.
type PodSecurityStatus struct {
	Enforce string `json:"enforce"`
	Warn    string `json:"warn"`
	// CheckedAt is when the levels were applied (after a dry run).
	CheckedAt metav1.Time `json:"checkedAt"`
	// Violations are Kubernetes' warnings about pods that existed then and
	// violate the enforced level (at most 50).
	// +optional
	Violations []string `json:"violations,omitempty"`
}

// ManagedResource is one resource the controller created in the cluster.
type ManagedResource struct {
	APIVersion string `json:"apiVersion"`
	Kind       string `json:"kind"`
	Name       string `json:"name"`
	// +optional
	Namespace string `json:"namespace,omitempty"`
}

// ProjectStatus is the observed state of a Project.
type ProjectStatus struct {
	// Phase summarises the conditions.
	// +optional
	Phase Phase `json:"phase,omitempty"`

	// ObservedGeneration is the spec generation the status describes.
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`

	// Conditions: Ready (with a reason) and ClusterReachable.
	// +listType=map
	// +listMapKey=type
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`

	// Resources the controller manages in the cluster.
	// +optional
	Resources []ManagedResource `json:"resources,omitempty"`

	// PodSecurity: the namespace's Pod Security levels and any existing
	// pods that violated them when they were applied.
	// +optional
	PodSecurity *PodSecurityStatus `json:"podSecurity,omitempty"`
}

// Project is a namespace in a managed cluster with a quota preset, limits,
// baseline network policies and an owner group.
//
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster,shortName=proj
// +kubebuilder:subresource:status
// +kubebuilder:validation:XValidation:rule="self.metadata.name.size() <= 63 && self.metadata.name.matches('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$')",message="name must be a DNS label of at most 63 characters"
// +kubebuilder:printcolumn:name="Cluster",type=string,JSONPath=`.spec.cluster`
// +kubebuilder:printcolumn:name="Namespace",type=string,JSONPath=`.spec.namespace`
// +kubebuilder:printcolumn:name="Size",type=string,JSONPath=`.spec.size`
// +kubebuilder:printcolumn:name="Owner",type=string,JSONPath=`.spec.owner`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Age",type=date,JSONPath=`.metadata.creationTimestamp`
type Project struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ProjectSpec   `json:"spec"`
	Status ProjectStatus `json:"status,omitempty"`
}

// ProjectList is a list of Projects.
//
// +kubebuilder:object:root=true
type ProjectList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Project `json:"items"`
}
