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
	// Path prefixes allowed (after the service proxy prefix). "*" matches
	// one path segment.
	Paths []string `json:"paths"`
	// WritePaths are the only path prefixes allowed for methods other than
	// GET and HEAD (default: Paths).
	// +optional
	WritePaths []string `json:"writePaths,omitempty"`
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
	// Console is granted to Capybara's own account on the cluster while the
	// plugin is installed (a ClusterRole capybara-plugin-<name>-console), so
	// the console can read the plugin's resources and run its declared
	// actions. Only ClusterRules are used.
	// +optional
	Console RuleSet `json:"console,omitempty"`
	// Project is granted to Capybara's own account in each Project namespace
	// of a cluster where the plugin is installed: a ClusterRole
	// capybara-plugin-<name>-project, bound there by a RoleBinding of the
	// same name. It also creates the listed ServiceAccounts there.
	// +optional
	Project *ProjectAccess `json:"project,omitempty"`
}

// ProjectAccess is what a plugin gets in every Project namespace.
type ProjectAccess struct {
	// Rules granted to Capybara's account in each Project namespace (none:
	// no role or bindings, e.g. a plugin that only generates objects).
	// +optional
	Rules []PolicyRule `json:"rules,omitempty"`
	// ServiceAccounts created in each Project namespace, with no
	// permissions of their own.
	// +optional
	ServiceAccounts []ProjectServiceAccount `json:"serviceAccounts,omitempty"`
	// Objects generated per Project (e.g. an Argo CD AppProject), with the
	// installer credential. In the template, "{{project}}", "{{namespace}}"
	// (the Project's), "{{cluster}}" and "{{pluginNamespace}}" are replaced.
	// +optional
	Objects []ProjectObject `json:"objects,omitempty"`
}

// ProjectObject is a template applied once per Project.
type ProjectObject struct {
	// InPluginNamespace: created in the plugin's namespace (the tool's own,
	// e.g. argocd), not the Project's.
	// +optional
	InPluginNamespace bool `json:"inPluginNamespace,omitempty"`
	// Resource (plural) of the template's kind: the installer's permissions
	// for it are derived from this (get, list, create, patch, delete; in
	// the plugin's namespace when InPluginNamespace).
	Resource string `json:"resource"`
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	Template runtime.RawExtension `json:"template"`
}

// ProjectServiceAccount is a ServiceAccount a plugin creates per Project.
type ProjectServiceAccount struct {
	Name string `json:"name"`
	// AutomountToken: whether pods using it get an API token (default no).
	// +optional
	AutomountToken bool `json:"automountToken,omitempty"`
}

// ObjectVerb is a write the console may make on a plugin object.
// +kubebuilder:validation:Enum=create;update;delete
type ObjectVerb string

// Object verbs.
const (
	ObjectCreate ObjectVerb = "create"
	ObjectUpdate ObjectVerb = "update"
	ObjectDelete ObjectVerb = "delete"
)

// PluginObject is a kind the console may create, update or delete in
// Project namespaces, through core (validated against Policy, dry-run,
// audited). Plugin code never decides what is written.
type PluginObject struct {
	// Name identifies it in the API (usually the plural, e.g. "tasks").
	Name     string       `json:"name"`
	Group    string       `json:"group"`
	Version  string       `json:"version"`
	Resource string       `json:"resource"`
	Kind     string       `json:"kind"`
	Verbs    []ObjectVerb `json:"verbs"`
	// Policy names an entry of the plugin's policies every write must pass.
	// +optional
	Policy string `json:"policy,omitempty"`
	// Audit maps a verb to the audited action name (default: the verb);
	// audited as <plugin>.<action>, e.g. create of pipelineruns as "start".
	// +optional
	Audit map[string]string `json:"audit,omitempty"`
	// References are other plugin objects this one names (same
	// namespace). On create they are loaded and must pass their policy.
	// +optional
	References []ObjectReference `json:"references,omitempty"`
	// Cleanup allows deleting finished objects in bulk, keeping the newest
	// per group (needs the delete verb).
	// +optional
	Cleanup *ObjectCleanup `json:"cleanup,omitempty"`
	// DeleteModes, when declared, must be chosen on delete (e.g. whether the
	// tool also removes what the object deployed).
	// +optional
	DeleteModes []DeleteMode `json:"deleteModes,omitempty"`
	// RequiresStep: writes need this installation step to pass (e.g. the
	// tool accepts objects in Project namespaces).
	// +optional
	RequiresStep string `json:"requiresStep,omitempty"`
}

// DeleteMode is one way of deleting an object: finalizers set or removed
// first (merge patch), then the delete.
type DeleteMode struct {
	Name  string `json:"name"`
	Title string `json:"title"`
	// +optional
	EnsureFinalizers []string `json:"ensureFinalizers,omitempty"`
	// +optional
	RemoveFinalizers []string `json:"removeFinalizers,omitempty"`
}

// ObjectCleanup says how objects are grouped and when one is finished.
type ObjectCleanup struct {
	// GroupLabel: objects with the same value of this label form a group.
	GroupLabel string `json:"groupLabel"`
	// FinishedCondition: an object is finished once this status condition
	// is True or False (not Unknown).
	FinishedCondition string `json:"finishedCondition"`
}

// Tool is one web UI in the tools launcher. Exactly one of URL, URLKey
// and Service says where it is.
type Tool struct {
	Name  string `json:"name"`
	Title string `json:"title"`
	// Icon: a name the console knows (grafana, argocd); a generic icon
	// otherwise.
	// +optional
	Icon string `json:"icon,omitempty"`
	// Modes it applies to (default: all).
	// +optional
	Modes []InstallMode `json:"modes,omitempty"`
	// URL: a path Capybara already serves for the plugin, under
	// /api/plugins/<name>/; "{{cluster}}" is replaced.
	// +optional
	URL string `json:"url,omitempty"`
	// URLKey: the installation config key holding the tool's own https://
	// address (e.g. an OpenShift route in connect mode).
	// +optional
	URLKey string `json:"urlKey,omitempty"`
	// Service: a Service in the cluster, served by Capybara at
	// /api/plugins/<name>/tools/<tool>/<cluster>/ through the Kubernetes
	// service proxy with Capybara's own account. The tool must expect that
	// path as its root.
	// +optional
	Service *ToolService `json:"service,omitempty"`
	// Cookies the tool sets for its own login (e.g. argocd.token): only
	// these pass through, and only under the tool's path.
	// +optional
	Cookies []string `json:"cookies,omitempty"`
}

// ToolService is where a proxied tool runs.
type ToolService struct {
	// Namespace, or "" for the plugin's namespace (the chart's, or the
	// connect config's).
	// +optional
	Namespace string `json:"namespace,omitempty"`
	Service   string `json:"service"`
	// Port name or number.
	Port string `json:"port"`
}

// UninstallBlocker is a kind whose objects must be gone before uninstall.
type UninstallBlocker struct {
	Group    string `json:"group"`
	Version  string `json:"version"`
	Resource string `json:"resource"`
	Kind     string `json:"kind"`
	// Message: what to do instead.
	Message string `json:"message"`
	// FlagFinalizer: objects carrying it are marked (e.g. cascade).
	// +optional
	FlagFinalizer string `json:"flagFinalizer,omitempty"`
}

// ObjectReference says the value at Path names an Object in the same namespace.
type ObjectReference struct {
	Path   string `json:"path"`
	Object string `json:"object"`
}

// ObjectPolicy is a closed set of rules over an object's fields.
type ObjectPolicy struct {
	// Include other policies' rules first.
	// +optional
	Include []string     `json:"include,omitempty"`
	Rules   []ObjectRule `json:"rules"`
}

// ObjectRule applies to every value matching Path: dotted segments, "*"
// any map key or list element, "**" any depth (zero or more levels).
// Exactly one of Deny, Allow, Default, AllowKeys/ExactlyOneOf, WithinQuota
// or CountQuota is set.
type ObjectRule struct {
	Path string `json:"path"`
	// Deny: a match is a violation (only when it equals Equals, if set).
	// +optional
	Deny bool `json:"deny,omitempty"`
	// +optional
	Equals string `json:"equals,omitempty"`
	// Allow: a match must be one of these values.
	// +optional
	Allow []string `json:"allow,omitempty"`
	// Default: set this value when the (exact) path is absent.
	// +optional
	Default string `json:"default,omitempty"`
	// AllowKeys/ExactlyOneOf: a match is a map with only these keys, and
	// exactly one of ExactlyOneOf.
	// +optional
	AllowKeys []string `json:"allowKeys,omitempty"`
	// +optional
	ExactlyOneOf []string `json:"exactlyOneOf,omitempty"`
	// WithinQuota: the matches (quantities) must sum to within what the
	// namespace's ResourceQuotas still allow for this resource.
	// +optional
	WithinQuota string `json:"withinQuota,omitempty"`
	// CountQuota: the number of matches must fit within this quota resource.
	// +optional
	CountQuota string `json:"countQuota,omitempty"`
	// Match: a match must match this regular expression (Go syntax,
	// anchored by the author).
	// +optional
	Match string `json:"match,omitempty"`
	// Message shown for a violation.
	// +optional
	Message string `json:"message,omitempty"`
}

// ActionType is what a declared plugin action does.
// +kubebuilder:validation:Enum=copy;patch
type ActionType string

// Action types.
const (
	// ActionCopy creates a new object from an existing one, copying only
	// the declared fields (generateName from the original's name).
	ActionCopy ActionType = "copy"
	// ActionPatch applies a fixed JSON merge patch.
	ActionPatch ActionType = "patch"
)

// ActionCondition limits an action to objects whose status condition has
// one of the given statuses (e.g. Succeeded=Unknown: still running), none
// of whose Absent fields and all of whose Present fields are set. Every
// part is optional.
type ActionCondition struct {
	// +optional
	Type string `json:"type,omitempty"`
	// +optional
	Status []string `json:"status,omitempty"`
	// Absent: dotted paths that must not be set (e.g. no automated sync).
	// +optional
	Absent []string `json:"absent,omitempty"`
	// Present: dotted paths that must be set.
	// +optional
	Present []string `json:"present,omitempty"`
}

// ActionInput is a typed value a patch action takes from the request: the
// patch's "$(inputs.<name>)" string values are replaced by it (a missing
// optional input removes that field). "$(user)" is the requesting user.
type ActionInput struct {
	Name  string `json:"name"`
	Title string `json:"title,omitempty"`
	// +kubebuilder:validation:Enum=string;bool
	Type string `json:"type"`
	// Pattern a string must match (anchored).
	// +optional
	Pattern string `json:"pattern,omitempty"`
	// +optional
	Optional bool `json:"optional,omitempty"`
}

// ActionConfirm requires typing the object's name (always, or when an
// input equals a value).
type ActionConfirm struct {
	// +optional
	Input string `json:"input,omitempty"`
	// +optional
	Equals string `json:"equals,omitempty"`
}

// PluginAction is an operation on one of the plugin's resources that core
// carries out with Capybara's account (holding the console permissions)
// and audits; plugin code never decides what is written.
type PluginAction struct {
	// Name is the action id (audited as <plugin>.<name>).
	Name  string `json:"name"`
	Title string `json:"title"`
	// The target resource.
	Group    string     `json:"group"`
	Version  string     `json:"version"`
	Resource string     `json:"resource"`
	Kind     string     `json:"kind"`
	Type     ActionType `json:"type"`
	// Copy: dotted field paths copied from the original when present.
	// +optional
	CopyFields []string `json:"copyFields,omitempty"`
	// Patch: the JSON merge patch.
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	Patch *runtime.RawExtension `json:"patch,omitempty"`
	// When: only for objects matching this condition.
	// +optional
	When *ActionCondition `json:"when,omitempty"`
	// Policy the result of a copy must pass (as for objects). Copies are
	// then allowed only in Project namespaces.
	// +optional
	Policy string `json:"policy,omitempty"`
	// ProjectOnly: only in Project namespaces.
	// +optional
	ProjectOnly bool `json:"projectOnly,omitempty"`
	// Inputs a patch takes from the request.
	// +optional
	Inputs []ActionInput `json:"inputs,omitempty"`
	// ConfirmName: the request must repeat the object's name.
	// +optional
	ConfirmName *ActionConfirm `json:"confirmName,omitempty"`
	// RequiresStep, as for objects.
	// +optional
	RequiresStep string `json:"requiresStep,omitempty"`
	// Danger: shown in red and confirmed.
	// +optional
	Danger bool `json:"danger,omitempty"`
}

// Detect says what indicates an existing installation of the tool: install
// mode is refused when found (connect to it instead); connect mode needs it.
type Detect struct {
	// API resources served by the cluster, as "<group>/<resource>".
	// +optional
	APIResources []string `json:"apiResources,omitempty"`
	// Namespaces that only an existing (e.g. operator-managed) install has.
	// They only refuse install mode.
	// +optional
	Namespaces []string `json:"namespaces,omitempty"`
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
	// NamespaceLabels are set on the release namespace when the controller
	// creates it (or added when it exists), e.g. a Pod Security level the
	// upstream manifest's own Namespace object carried.
	// +optional
	NamespaceLabels map[string]string `json:"namespaceLabels,omitempty"`
	// Version of the chart, for display and upgrades.
	Version string `json:"version"`
	// InstallValues are merged over the preset per installation; the
	// string "{{cluster}}" is replaced by the cluster id, and
	// "{{config.<key>}}" by that installation config value.
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
	// DaemonSet is ready), service (a declared service answers a path),
	// apiResource (the cluster serves "<group>/<resource>", e.g. after its
	// CRD is established), dryRun (the API server accepts Object in a
	// server-side dry run, e.g. through the plugin's webhooks).
	// +kubebuilder:validation:Enum=helm;workload;service;apiResource;dryRun;field
	Type string `json:"type"`
	// workload: kind and name; apiResource: "<group>/<resource>" in Name.
	// +optional
	Kind string `json:"kind,omitempty"`
	// +optional
	Name string `json:"name,omitempty"`
	// workload/dryRun: namespace (default: the plugin namespace).
	// +optional
	Namespace string `json:"namespace,omitempty"`
	// dryRun: the object to create (dry run, with Capybara's account).
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	// +kubebuilder:validation:Schemaless
	// +kubebuilder:validation:Type=object
	Object *runtime.RawExtension `json:"object,omitempty"`
	// field: passes when any of Fields matches (an object's field contains
	// a value).
	// +optional
	Fields []FieldCheck `json:"fields,omitempty"`
	// service: the ServiceAccess name, a GET path, and a substring the
	// response must contain.
	// +optional
	Service string `json:"service,omitempty"`
	// +optional
	Path string `json:"path,omitempty"`
	// +optional
	Contains string `json:"contains,omitempty"`
}

// FieldCheck reads one object with Capybara's account.
type FieldCheck struct {
	Group    string `json:"group,omitempty"`
	Version  string `json:"version"`
	Resource string `json:"resource"`
	// Namespace, or NamespaceKey: the config key naming it.
	// +optional
	Namespace string `json:"namespace,omitempty"`
	// +optional
	NamespaceKey string `json:"namespaceKey,omitempty"`
	// Name, or "" for every object of the resource in the namespace.
	// +optional
	Name string `json:"name,omitempty"`
	// Path (dotted; "\." for a dot inside a key) whose value (a string,
	// a comma-separated list, or a list's items) must contain Contains.
	Path     string `json:"path"`
	Contains string `json:"contains"`
}

// InstallStep is one stage shown while installing.
type InstallStep struct {
	Name  string    `json:"name"`
	Title string    `json:"title"`
	Check StepCheck `json:"check"`
	// Informational: shown and recorded, but does not keep the installation
	// from Ready (e.g. which mode a connected tool supports).
	// +optional
	Informational bool `json:"informational,omitempty"`
	// Modes the step applies to (default: all).
	// +optional
	Modes []InstallMode `json:"modes,omitempty"`
}

// PluginSpec is a catalog entry, written by the catalog sync from the
// plugin's manifest (plugins/<name>/plugin.yaml).
type PluginSpec struct {
	// Name is the plugin's name (the Plugin object's name).
	// +optional
	Name        string `json:"name,omitempty"`
	Repository  string `json:"repository"`
	DisplayName string `json:"displayName"`
	Version     string `json:"version"`
	// +optional
	Description string `json:"description,omitempty"`
	// Icon is a small SVG (data URI).
	// +optional
	Icon string `json:"icon,omitempty"`
	// ExtensionAPI is the major extension API version the UI bundle uses.
	ExtensionAPI int `json:"extensionApi"`
	// MinExtensionAPI is the lowest "1.M" the plugin works with; Capybara
	// refuses it when it provides an older minor version.
	// +optional
	MinExtensionAPI string `json:"minExtensionApi,omitempty"`
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
	// +optional
	Actions []PluginAction `json:"actions,omitempty"`
	// Objects the console may write in Project namespaces.
	// +optional
	Objects []PluginObject `json:"objects,omitempty"`
	// Policies referenced by objects (and actions), by name.
	// +optional
	Policies map[string]ObjectPolicy `json:"policies,omitempty"`
	// Uninstall is refused while objects of these kinds exist anywhere on
	// the cluster (e.g. Applications whose deletion would cascade).
	// +optional
	UninstallBlockers []UninstallBlocker `json:"uninstallBlockers,omitempty"`
	// Tools are web UIs the plugin brings (e.g. Grafana, Argo CD), listed
	// in the console's tools launcher for clusters where it is installed
	// and enabled, and opened in a new tab.
	// +optional
	Tools []Tool `json:"tools,omitempty"`
	// +optional
	Detect *Detect `json:"detect,omitempty"`
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
// +kubebuilder:validation:Enum=Pending;Running;Done;Failed;Off
type StepState string

// Step states.
const (
	StepPending StepState = "Pending"
	StepRunning StepState = "Running"
	StepDone    StepState = "Done"
	StepFailed  StepState = "Failed"
	// StepOff: an informational step that does not hold (not a failure).
	StepOff StepState = "Off"
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
