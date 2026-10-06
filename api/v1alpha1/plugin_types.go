package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

// Plugin system constants.
const (
	// InstallerSecretType marks a cluster's optional installer kubeconfig.
	// Only the plugin controller loads it; the API server's cache never
	// sees this type, so the console proxy cannot use it.
	InstallerSecretType = "platform.capybara.io/installer-kubeconfig"
	// PluginTokenSecretType holds a plugin's short-lived Kubernetes token for
	// one cluster (minted by the controller, used by the scoped proxy).
	PluginTokenSecretType = "platform.capybara.io/plugin-token"
	// PluginBackendSecretType holds the hash of a plugin backend's
	// Capybara-issued credential.
	PluginBackendSecretType = "platform.capybara.io/plugin-backend"
	// PluginConnectSecretType holds a Connect-existing bearer token
	// (e.g. for OCP Thanos Querier). Write-only through the API.
	PluginConnectSecretType = "platform.capybara.io/plugin-connect"

	// ConditionInstallerReady on a Cluster: the installer credential works.
	ConditionInstallerReady = "InstallerReady"

	// Uninstall options, set by the API on a PluginInstallation before it is deleted.
	AnnotationUninstallKeepData   = "platform.capybara.io/uninstall-keep-data"
	AnnotationUninstallRemoveCRDs = "platform.capybara.io/uninstall-remove-crds"
	// AnnotationCRDScanRequest asks the controller to list objects of the
	// plugin's CRDs that do not belong to its release (value: a request id).
	AnnotationCRDScanRequest = "platform.capybara.io/crd-scan-request"
	// AnnotationRequestAuditID links controller work to the user's request.
	AnnotationRequestAuditID = "platform.capybara.io/request-audit-id"
	// AnnotationRequestedBy is the user who made that request.
	AnnotationRequestedBy = "platform.capybara.io/requested-by"

	// LabelPlugin and LabelPluginCluster mark objects Capybara creates for a plugin.
	LabelPlugin        = "platform.capybara.io/plugin"
	LabelPluginCluster = "platform.capybara.io/plugin-cluster"

	// FinalizerPluginUninstall uninstalls a plugin from its cluster.
	FinalizerPluginUninstall = "platform.capybara.io/plugin-uninstall"
)

// IsCredentialSecretType reports whether a Secret type is one of
// Capybara's own credential types. Reveal, edit and delete refuse them on
// every cluster, and summaries hide their keys.
func IsCredentialSecretType(t string) bool {
	switch t {
	case KubeconfigSecretType, InstallerSecretType, PluginTokenSecretType, PluginBackendSecretType, PluginConnectSecretType:
		return true
	}
	return false
}

// RepositoryType is where a catalog comes from.
// +kubebuilder:validation:Enum=builtin;helm;oci
type RepositoryType string

// Repository types. Only builtin syncs in this phase.
const (
	RepositoryBuiltin RepositoryType = "builtin"
	RepositoryHelm    RepositoryType = "helm"
	RepositoryOCI     RepositoryType = "oci"
)

// PluginRepositorySpec is a catalog source.
type PluginRepositorySpec struct {
	Type RepositoryType `json:"type"`
	// URL of a helm or oci repository; empty for builtin (the plugins/
	// directory shipped with Capybara).
	// +optional
	URL string `json:"url,omitempty"`
	// Trusted repositories are the only ones whose plugins can be installed
	// and whose UI bundles are served.
	Trusted bool `json:"trusted"`
}

// PluginRepositoryStatus is the result of the last sync.
type PluginRepositoryStatus struct {
	// +optional
	Phase string `json:"phase,omitempty"` // Synced, Error, Unsupported
	// +optional
	Message string `json:"message,omitempty"`
	// +optional
	Plugins []string `json:"plugins,omitempty"`
	// +optional
	LastSynced *metav1.Time `json:"lastSynced,omitempty"`
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
}

// PluginRepository is a plugin catalog source.
//
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Type",type=string,JSONPath=`.spec.type`
// +kubebuilder:printcolumn:name="Trusted",type=boolean,JSONPath=`.spec.trusted`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
type PluginRepository struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   PluginRepositorySpec   `json:"spec"`
	Status PluginRepositoryStatus `json:"status,omitempty"`
}

// PluginRepositoryList is a list of PluginRepositories.
//
// +kubebuilder:object:root=true
type PluginRepositoryList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []PluginRepository `json:"items"`
}

// PolicyRule mirrors an RBAC rule (kept here so this package depends only
// on apimachinery).
type PolicyRule struct {
	// +optional
	APIGroups []string `json:"apiGroups,omitempty"`
	// +optional
	Resources []string `json:"resources,omitempty"`
	// +optional
	ResourceNames []string `json:"resourceNames,omitempty"`
	Verbs         []string `json:"verbs"`
}

// RuleSet is the permissions one mode needs from the installer credential.
type RuleSet struct {
	// Cluster-wide rules (a ClusterRole).
	// +optional
	ClusterRules []PolicyRule `json:"clusterRules,omitempty"`
	// Rules in the plugin's namespace (a Role there).
	// +optional
	NamespaceRules []PolicyRule `json:"namespaceRules,omitempty"`
}

// ServiceAccess is one cluster service a plugin's backend (or its UI,
// through the backend) may reach via the Kubernetes service proxy.
type ServiceAccess struct {
	// Name the backend uses for it, e.g. "prometheus".
	Name string `json:"name"`
	// Namespace and Service in install mode. In connect mode they come from
	// the installation's config (keys namespaceKey/serviceKey).
	// +optional
	Namespace string `json:"namespace,omitempty"`
	// +optional
	Service string `json:"service,omitempty"`
	// Port name or number ("http-web", "9090"); "https:<port>" for TLS.
	// +optional
	Port string `json:"port,omitempty"`
	// Config keys holding namespace, service and port in connect mode.
	// +optional
	NamespaceKey string `json:"namespaceKey,omitempty"`
	// +optional
	ServiceKey string `json:"serviceKey,omitempty"`
	// +optional
	PortKey string `json:"portKey,omitempty"`
	// HTTP methods allowed.
	Methods []string `json:"methods"`
	// Path prefixes allowed (after the service proxy prefix).
	Paths []string `json:"paths"`
	// Modes this access applies to (default: all).
	// +optional
	Modes []InstallMode `json:"modes,omitempty"`
}

// PluginPermissions are everything a plugin may do, shown before install.
type PluginPermissions struct {
	// Installer credential, install mode (deploying the chart).
	// +optional
	Install RuleSet `json:"install,omitempty"`
	// Installer credential, connect mode (only the backend's account).
	// +optional
	Connect RuleSet `json:"connect,omitempty"`
	// What the plugin backend may reach in a cluster where the plugin is
	// installed and enabled.
	// +optional
	Services []ServiceAccess `json:"services,omitempty"`
}

// InstallMode is how a plugin is attached to a cluster.
// +kubebuilder:validation:Enum=install;connect
type InstallMode string

// Install modes.
const (
	ModeInstall InstallMode = "install"
	ModeConnect InstallMode = "connect"
)

// GeneratedSecret is a Secret Capybara creates in the plugin's namespace
// before installing (e.g. an admin password), so secrets never appear in
// chart values, the installation, audit entries or API responses.
type GeneratedSecret struct {
	Name string         `json:"name"`
	Keys []GeneratedKey `json:"keys"`
}

// GeneratedKey is one key of a generated Secret: a literal value, or a
// random one (32 bytes, base64url) created once and kept.
type GeneratedKey struct {
	Name string `json:"name"`
	// +optional
	Value string `json:"value,omitempty"`
	// +optional
	Random bool `json:"random,omitempty"`
}

// ChartRef is a plugin's Helm chart.
type ChartRef struct {
	// Archive path inside the plugin directory.
	Archive string `json:"archive"`
	// SHA256 of the archive (hex). Verified before every use.
	SHA256 string `json:"sha256"`
	// Values file inside the plugin directory (the preset).
	// +optional
	Values      string `json:"values,omitempty"`
	ReleaseName string `json:"releaseName"`
	Namespace   string `json:"namespace"`
	// Version of the chart, for display and upgrades.
	Version string `json:"version"`
	// InstallValues are merged over the preset per installation; the
	// string "{{cluster}}" is replaced by the cluster id.
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	InstallValues *runtime.RawExtension `json:"installValues,omitempty"`
	// GeneratedSecrets are created before the chart is installed.
	// +optional
	GeneratedSecrets []GeneratedSecret `json:"generatedSecrets,omitempty"`
	// RefuseInstallOn lists platforms where install mode is refused
	// (connect instead), e.g. openshift.
	// +optional
	RefuseInstallOn []string `json:"refuseInstallOn,omitempty"`
}

// UIBundle is a plugin's browser code.
type UIBundle struct {
	// Bundle path inside the plugin directory (an ES module).
	Bundle string `json:"bundle"`
	// SHA256 of the bundle (hex). Bundles are served only when it matches.
	SHA256 string `json:"sha256"`
}

// StepCheck is how the controller decides a step is done.
type StepCheck struct {
	// helm (the release is deployed), workload (a Deployment/StatefulSet/
	// DaemonSet is ready), service (a declared service answers a path).
	// +kubebuilder:validation:Enum=helm;workload;service
	Type string `json:"type"`
	// workload: kind and name (in the plugin namespace).
	// +optional
	Kind string `json:"kind,omitempty"`
	// +optional
	Name string `json:"name,omitempty"`
	// service: the ServiceAccess name, a GET path, and a substring the
	// response must contain.
	// +optional
	Service string `json:"service,omitempty"`
	// +optional
	Path string `json:"path,omitempty"`
	// +optional
	Contains string `json:"contains,omitempty"`
}

// InstallStep is one stage shown while installing.
type InstallStep struct {
	Name  string    `json:"name"`
	Title string    `json:"title"`
	Check StepCheck `json:"check"`
	// Modes the step applies to (default: all).
	// +optional
	Modes []InstallMode `json:"modes,omitempty"`
}

// PluginSpec is a catalog entry, written by the catalog sync from the
// plugin's manifest (plugins/<name>/plugin.yaml).
type PluginSpec struct {
	Repository  string `json:"repository"`
	DisplayName string `json:"displayName"`
	Version     string `json:"version"`
	// +optional
	Description string `json:"description,omitempty"`
	// Icon is a small SVG (data URI).
	// +optional
	Icon string `json:"icon,omitempty"`
	// ExtensionAPI the UI bundle was written for.
	ExtensionAPI int `json:"extensionApi"`
	// +kubebuilder:validation:Enum=per-cluster;global
	Scope string `json:"scope"`
	// +kubebuilder:validation:MinItems=1
	Modes []InstallMode `json:"modes"`
	// +optional
	ExtensionPoints []string `json:"extensionPoints,omitempty"`
	// +optional
	Chart *ChartRef `json:"chart,omitempty"`
	// +optional
	UI *UIBundle `json:"ui,omitempty"`
	// Backend is the plugin backend's name, if it has one.
	// +optional
	Backend string `json:"backend,omitempty"`
	// +optional
	Permissions PluginPermissions `json:"permissions,omitempty"`
	// ConfigSchema is a JSON Schema (subset) for the installation's config.
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	ConfigSchema *runtime.RawExtension `json:"configSchema,omitempty"`
	// +optional
	Dependencies []string `json:"dependencies,omitempty"`
	// +optional
	Steps []InstallStep `json:"steps,omitempty"`
	// Namespace for connect mode's backend account when the config does not
	// name one (the namespace of the connected service).
	// +optional
	ConnectNamespaceKey string `json:"connectNamespaceKey,omitempty"`
}

// PluginStatus says whether the entry can be installed.
type PluginStatus struct {
	// Available is false when the manifest, an archive or a hash is wrong,
	// or the repository is untrusted; Problem says why.
	// +optional
	Available bool `json:"available"`
	// +optional
	Problem string `json:"problem,omitempty"`
	// +optional
	SyncedAt *metav1.Time `json:"syncedAt,omitempty"`
}

// Plugin is an entry in the plugin catalog.
//
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Version",type=string,JSONPath=`.spec.version`
// +kubebuilder:printcolumn:name="Repository",type=string,JSONPath=`.spec.repository`
// +kubebuilder:printcolumn:name="Available",type=boolean,JSONPath=`.status.available`
type Plugin struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   PluginSpec   `json:"spec"`
	Status PluginStatus `json:"status,omitempty"`
}

// PluginList is a list of Plugins.
//
// +kubebuilder:object:root=true
type PluginList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Plugin `json:"items"`
}

// PluginInstallationSpec attaches a plugin to one cluster.
type PluginInstallationSpec struct {
	Plugin  string      `json:"plugin"`
	Cluster string      `json:"cluster"`
	Mode    InstallMode `json:"mode"`
	// Enabled shows the plugin's UI for this cluster. Disabling keeps
	// everything running.
	Enabled bool `json:"enabled"`
	// Version of the plugin to run; changing it upgrades.
	Version string `json:"version"`
	// Config values (non-secret) validated against the plugin's schema.
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	Config *runtime.RawExtension `json:"config,omitempty"`
	// ConnectSecret names a Secret (type platform.capybara.io/plugin-connect,
	// in capybara-system) with a bearer token for connect mode.
	// +optional
	ConnectSecret *SecretRef `json:"connectSecret,omitempty"`
}

// InstallationPhase summarises an installation.
// +kubebuilder:validation:Enum=Pending;Installing;Ready;Error;Disabled;Uninstalling
type InstallationPhase string

// Installation phases.
const (
	InstallPending      InstallationPhase = "Pending"
	InstallInstalling   InstallationPhase = "Installing"
	InstallReady        InstallationPhase = "Ready"
	InstallError        InstallationPhase = "Error"
	InstallDisabled     InstallationPhase = "Disabled"
	InstallUninstalling InstallationPhase = "Uninstalling"
)

// StepState is a step's progress.
// +kubebuilder:validation:Enum=Pending;Running;Done;Failed
type StepState string

// Step states.
const (
	StepPending StepState = "Pending"
	StepRunning StepState = "Running"
	StepDone    StepState = "Done"
	StepFailed  StepState = "Failed"
)

// StepStatus is one step's progress.
type StepStatus struct {
	Name  string    `json:"name"`
	Title string    `json:"title"`
	State StepState `json:"state"`
	// +optional
	Message string `json:"message,omitempty"`
}

// PluginInstallationStatus is the installation's progress and health.
type PluginInstallationStatus struct {
	// +optional
	Phase InstallationPhase `json:"phase,omitempty"`
	// +optional
	Message string `json:"message,omitempty"`
	// CurrentStep is the first step not done.
	// +optional
	CurrentStep string `json:"currentStep,omitempty"`
	// +optional
	Steps []StepStatus `json:"steps,omitempty"`
	// InstalledVersion is the plugin version last deployed successfully.
	// +optional
	InstalledVersion string `json:"installedVersion,omitempty"`
	// AppliedHash identifies the version, mode and config last applied;
	// enabling or disabling never re-applies.
	// +optional
	AppliedHash string `json:"appliedHash,omitempty"`
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
	// CRDScan answers the last CRD scan request (for uninstall with CRD cleanup).
	// +optional
	CRDScan *CRDScan `json:"crdScan,omitempty"`
	// +listType=map
	// +listMapKey=type
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// CRDScan lists the plugin's CRDs and the objects of those kinds that do
// not belong to its release (removing the CRDs would delete them too).
type CRDScan struct {
	Request   string      `json:"request"`
	ScannedAt metav1.Time `json:"scannedAt"`
	// +optional
	CRDs []string `json:"crds,omitempty"`
	// Foreign objects as "<kind> <namespace>/<name>".
	// +optional
	Foreign []string `json:"foreign,omitempty"`
	// Hash of Foreign (sha256 hex); the user confirms exactly this list.
	Hash string `json:"hash"`
	// +optional
	Error string `json:"error,omitempty"`
}

// PluginInstallation is a plugin installed in (or connected to) a cluster.
// Its name is "<plugin>.<cluster>".
//
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Plugin",type=string,JSONPath=`.spec.plugin`
// +kubebuilder:printcolumn:name="Cluster",type=string,JSONPath=`.spec.cluster`
// +kubebuilder:printcolumn:name="Mode",type=string,JSONPath=`.spec.mode`
// +kubebuilder:printcolumn:name="Enabled",type=boolean,JSONPath=`.spec.enabled`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Step",type=string,JSONPath=`.status.currentStep`
type PluginInstallation struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   PluginInstallationSpec   `json:"spec"`
	Status PluginInstallationStatus `json:"status,omitempty"`
}

// PluginInstallationList is a list of PluginInstallations.
//
// +kubebuilder:object:root=true
type PluginInstallationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []PluginInstallation `json:"items"`
}

// InstallationName is the PluginInstallation name for a plugin on a cluster.
func InstallationName(plugin, cluster string) string { return plugin + "." + cluster }
