package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Where and how Capybara keeps managed clusters' kubeconfigs in capybara-mgmt.
const (
	// SystemNamespace holds Capybara's own state in capybara-mgmt.
	SystemNamespace = "capybara-system"
	// KubeconfigSecretType marks kubeconfig Secrets. No API ever returns
	// them, and reveal/summary/edit/delete refuse this type everywhere.
	KubeconfigSecretType = "platform.capybara.io/kubeconfig"
	// KubeconfigKey is the data key holding the kubeconfig.
	KubeconfigKey = "kubeconfig"
	// LabelCluster names the cluster a kubeconfig Secret belongs to.
	LabelCluster = "platform.capybara.io/cluster"

	// AnnotationAbandonRemote on a Project being deleted tells the
	// finalizer to leave its remote resources in place (cluster removed).
	AnnotationAbandonRemote = "platform.capybara.io/abandon-remote"
)

// Environment labels a cluster; prod is shown with a warning style.
// +kubebuilder:validation:Enum=dev;uat;prod
type Environment string

// Environments.
const (
	EnvDev  Environment = "dev"
	EnvUAT  Environment = "uat"
	EnvProd Environment = "prod"
)

// SecretRef names a Secret in capybara-system.
type SecretRef struct {
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=253
	// +kubebuilder:validation:Pattern=`^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$`
	Name string `json:"name"`
}

// ClusterSpec is a managed cluster Capybara can reach.
type ClusterSpec struct {
	// DisplayName is a human-friendly name.
	// +kubebuilder:validation:MaxLength=128
	// +optional
	DisplayName string `json:"displayName,omitempty"`

	// Environment is dev, uat or prod.
	Environment Environment `json:"environment"`

	// KubeconfigSecret is the Secret (type platform.capybara.io/kubeconfig,
	// in capybara-system) holding this cluster's kubeconfig.
	KubeconfigSecret SecretRef `json:"kubeconfigSecret"`
}

// ClusterPhase summarises a cluster's health.
// +kubebuilder:validation:Enum=Pending;Connected;Error
type ClusterPhase string

// Cluster phases.
const (
	ClusterPending   ClusterPhase = "Pending"
	ClusterConnected ClusterPhase = "Connected"
	ClusterError     ClusterPhase = "Error"
)

// Cluster condition types and reasons.
const (
	ConditionReachable           = "Reachable"
	ConditionAuthenticated       = "Authenticated"
	ConditionCredentialsExpiring = "CredentialsExpiring"

	ReasonConnected          = "Connected"
	ReasonUnreachable        = "Unreachable"
	ReasonAuthFailed         = "AuthFailed"
	ReasonCredentialsExpired = "CredentialsExpired"
	ReasonInvalidKubeconfig  = "InvalidKubeconfig"
	ReasonSecretMissing      = "SecretMissing"
	ReasonPermissionsLimited = "PermissionsLimited"
	ReasonExpiresSoon        = "ExpiresSoon"
	ReasonNotExpiring        = "NotExpiring"
)

// ClusterStatus is the cluster's health as last checked by the controller.
type ClusterStatus struct {
	// Phase is Connected, Error or Pending (not checked yet).
	// +optional
	Phase ClusterPhase `json:"phase,omitempty"`
	// Reason is the most important condition reason (e.g. Unreachable, AuthFailed).
	// +optional
	Reason string `json:"reason,omitempty"`
	// Message explains Reason.
	// +optional
	Message string `json:"message,omitempty"`

	// KubernetesVersion is the cluster's git version.
	// +optional
	KubernetesVersion string `json:"kubernetesVersion,omitempty"`
	// NodeCount is unset when nodes cannot be listed.
	// +optional
	NodeCount *int32 `json:"nodeCount,omitempty"`
	// Identity is who Capybara is authenticated as.
	// +optional
	Identity string `json:"identity,omitempty"`
	// CredentialsExpireAt is when the client certificate or token expires.
	// +optional
	CredentialsExpireAt *metav1.Time `json:"credentialsExpireAt,omitempty"`
	// LastChecked is when the health check last ran.
	// +optional
	LastChecked *metav1.Time `json:"lastChecked,omitempty"`

	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
	// Conditions: Ready, Reachable, Authenticated, CredentialsExpiring.
	// +listType=map
	// +listMapKey=type
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// Cluster is a managed cluster registered by kubeconfig. Its name is the
// cluster id used in URLs (/c/{id}/...).
//
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster
// +kubebuilder:subresource:status
// +kubebuilder:validation:XValidation:rule="self.metadata.name.size() <= 63 && self.metadata.name.matches('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$')",message="name must be a DNS label of at most 63 characters"
// +kubebuilder:printcolumn:name="Environment",type=string,JSONPath=`.spec.environment`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Reason",type=string,JSONPath=`.status.reason`
// +kubebuilder:printcolumn:name="Version",type=string,JSONPath=`.status.kubernetesVersion`
// +kubebuilder:printcolumn:name="Nodes",type=integer,JSONPath=`.status.nodeCount`
// +kubebuilder:printcolumn:name="Age",type=date,JSONPath=`.metadata.creationTimestamp`
type Cluster struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ClusterSpec   `json:"spec"`
	Status ClusterStatus `json:"status,omitempty"`
}

// ClusterList is a list of Clusters.
//
// +kubebuilder:object:root=true
type ClusterList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Cluster `json:"items"`
}
