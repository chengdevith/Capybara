package plugin

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"sort"
	"strings"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

// ClusterLister is what the API needs to know about clusters.
type ClusterLister interface {
	List() []cluster.Info
	Status(id string) (v1alpha1.ClusterStatus, bool)
}

// API serves the plugin catalog and installations. Install rights are
// admin-only once there is authentication (Phase 5); canInstall is the
// hook for that check.
type API struct {
	Mgmt     client.Client // nil when capybara-mgmt is unavailable
	MgmtErr  error
	Clusters ClusterLister
	Auditor  *audit.Auditor
	Logger   *slog.Logger
	// Bundles serves UI bundles (bundle.go); nil disables them.
	Bundles *Bundles
}

// Register adds the routes. The backend proxy (proxy.go) registers
// /api/plugins/{name}/... separately.
func (a *API) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/plugins", a.list)
	mux.HandleFunc("GET /api/plugins/_installations", a.installations)
	mux.HandleFunc("GET /api/plugins/_catalog/{name}", a.get)
	mux.HandleFunc("POST /api/plugins/installations", a.create)
	mux.HandleFunc("GET /api/plugins/installations/{id}", a.getInstallation)
	mux.HandleFunc("PATCH /api/plugins/installations/{id}", a.update)
	mux.HandleFunc("DELETE /api/plugins/installations/{id}", a.remove)
	mux.HandleFunc("POST /api/plugins/installations/{id}/_crd-scan", a.crdScan)
	mux.HandleFunc("PUT /api/plugins/installations/{id}/connect-token", a.setConnectToken)
	if a.Bundles != nil {
		mux.HandleFunc("GET /api/plugins/_ui/{name}/{file}", a.Bundles.ServeHTTP)
	}
}

// canInstall is where Phase 5 checks the user's plugin install rights.
func canInstall(context.Context) bool { return true }

func (a *API) ready(w http.ResponseWriter) bool {
	if a.Mgmt == nil {
		msg := "capybara-mgmt is not available"
		if a.MgmtErr != nil {
			msg += ": " + a.MgmtErr.Error()
		}
		httpjson.Error(w, http.StatusServiceUnavailable, msg)
		return false
	}
	return true
}

type apiError struct {
	status int
	msg    string
	extra  map[string]any
}

func (e *apiError) Error() string { return e.msg }

func errorf(status int, format string, args ...any) error {
	return &apiError{status: status, msg: fmt.Sprintf(format, args...)}
}

func writeErr(w http.ResponseWriter, err error) {
	var (
		ae  *apiError
		ce  *ConfigError
		onr *audit.OutcomeNotRecordedError
	)
	switch {
	case errors.As(err, &onr):
		httpjson.Error(w, http.StatusInternalServerError, onr.Error())
	case errors.Is(err, audit.ErrUnavailable):
		httpjson.Error(w, http.StatusServiceUnavailable, err.Error())
	case errors.As(err, &ae):
		body := map[string]any{"error": ae.msg}
		for k, v := range ae.extra {
			body[k] = v
		}
		httpjson.Write(w, ae.status, body)
	case errors.As(err, &ce):
		httpjson.Write(w, http.StatusBadRequest, map[string]any{"error": ce.Error(), "problems": ce.Problems})
	case errors.Is(err, audit.ErrDenied):
		httpjson.Error(w, http.StatusForbidden, err.Error())
	case apierrors.IsNotFound(err):
		httpjson.Error(w, http.StatusNotFound, "not found")
	case apierrors.IsConflict(err):
		httpjson.Error(w, http.StatusConflict, "the installation changed; reload and try again")
	default:
		httpjson.Error(w, http.StatusBadGateway, err.Error())
	}
}

func decode(w http.ResponseWriter, r *http.Request, v any) error {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		return errorf(http.StatusBadRequest, "invalid request body: %v", err)
	}
	return nil
}

// CatalogEntry is a catalog entry with its installations.
type CatalogEntry struct {
	Name          string                `json:"name"`
	Spec          v1alpha1.PluginSpec   `json:"spec"`
	Status        v1alpha1.PluginStatus `json:"status"`
	Trusted       bool                  `json:"trusted"`
	Installations []InstallationView    `json:"installations"`
	// Rules the installer needs per mode (shown before install); connect
	// mode adds get services/proxy on the connected service.
	InstallerRules map[string]RuleView `json:"installerRules,omitempty"`
}

// RuleView is a RuleSet for display.
type RuleView struct {
	ClusterRules   []v1alpha1.PolicyRule `json:"clusterRules,omitempty"`
	NamespaceRules []v1alpha1.PolicyRule `json:"namespaceRules,omitempty"`
}

// InstallationView is an installation as the console sees it.
type InstallationView struct {
	ID       string                            `json:"id"`
	UID      string                            `json:"uid"`
	Spec     v1alpha1.PluginInstallationSpec   `json:"spec"`
	Status   v1alpha1.PluginInstallationStatus `json:"status"`
	Config   map[string]any                    `json:"config"`
	Deleting bool                              `json:"deleting,omitempty"`
}

func viewOf(in *v1alpha1.PluginInstallation) InstallationView {
	return InstallationView{ID: in.Name, UID: string(in.UID), Spec: in.Spec, Status: in.Status, Config: ConfigOf(in), Deleting: !in.DeletionTimestamp.IsZero()}
}

func (a *API) trusted(ctx context.Context) map[string]bool {
	out := map[string]bool{}
	var repos v1alpha1.PluginRepositoryList
	if err := a.Mgmt.List(ctx, &repos); err == nil {
		for _, r := range repos.Items {
			out[r.Name] = r.Spec.Trusted
		}
	}
	return out
}

func (a *API) list(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var plugins v1alpha1.PluginList
	if err := a.Mgmt.List(r.Context(), &plugins); err != nil {
		writeErr(w, err)
		return
	}
	var ins v1alpha1.PluginInstallationList
	if err := a.Mgmt.List(r.Context(), &ins); err != nil {
		writeErr(w, err)
		return
	}
	trusted := a.trusted(r.Context())
	out := make([]CatalogEntry, 0, len(plugins.Items))
	for _, p := range plugins.Items {
		v := CatalogEntry{Name: p.Name, Spec: p.Spec, Status: p.Status, Trusted: trusted[p.Spec.Repository], Installations: []InstallationView{}}
		for i := range ins.Items {
			if ins.Items[i].Spec.Plugin == p.Name {
				v.Installations = append(v.Installations, viewOf(&ins.Items[i]))
			}
		}
		out = append(out, v)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	httpjson.Write(w, http.StatusOK, out)
}

// installations is the console's per-cluster view: which plugins are
// installed (and enabled) where, for loading UI bundles.
func (a *API) installations(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var ins v1alpha1.PluginInstallationList
	if err := a.Mgmt.List(r.Context(), &ins); err != nil {
		writeErr(w, err)
		return
	}
	out := make([]InstallationView, 0, len(ins.Items))
	for i := range ins.Items {
		out = append(out, viewOf(&ins.Items[i]))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	httpjson.Write(w, http.StatusOK, out)
}

func (a *API) get(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var p v1alpha1.Plugin
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: r.PathValue("name")}, &p); err != nil {
		writeErr(w, err)
		return
	}
	v := CatalogEntry{Name: p.Name, Spec: p.Spec, Status: p.Status, Trusted: a.trusted(r.Context())[p.Spec.Repository], Installations: []InstallationView{}}
	v.InstallerRules = map[string]RuleView{
		string(v1alpha1.ModeInstall): {ClusterRules: p.Spec.Permissions.Install.ClusterRules, NamespaceRules: p.Spec.Permissions.Install.NamespaceRules},
		string(v1alpha1.ModeConnect): {ClusterRules: p.Spec.Permissions.Connect.ClusterRules, NamespaceRules: p.Spec.Permissions.Connect.NamespaceRules},
	}
	var ins v1alpha1.PluginInstallationList
	if err := a.Mgmt.List(r.Context(), &ins); err == nil {
		for i := range ins.Items {
			if ins.Items[i].Spec.Plugin == p.Name {
				v.Installations = append(v.Installations, viewOf(&ins.Items[i]))
			}
		}
	}
	httpjson.Write(w, http.StatusOK, v)
}

func (a *API) getInstallation(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: r.PathValue("id")}, &in); err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, viewOf(&in))
}

// CreateRequest is POST /api/plugins/installations.
type CreateRequest struct {
	Plugin  string               `json:"plugin"`
	Cluster string               `json:"cluster"`
	Mode    v1alpha1.InstallMode `json:"mode"`
	Config  map[string]any       `json:"config,omitempty"`
	// Enabled defaults to true.
	Enabled *bool `json:"enabled,omitempty"`
}

func user(ctx context.Context) string {
	if u, ok := auth.UserFrom(ctx); ok {
		return u.Name
	}
	return "unknown"
}

// installerState returns whether plugin installs are enabled on a cluster.
func (a *API) installerState(id string) (bool, string, error) {
	st, ok := a.Clusters.Status(id)
	if !ok {
		return false, "", errorf(http.StatusNotFound, "cluster %q is not registered", id)
	}
	view := cluster.ToView(cluster.Info{ID: id}, st)
	return view.Status.PluginInstalls == "Enabled", view.Status.InstallerMessage, nil
}

func (a *API) create(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b CreateRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	action := "install"
	if b.Mode == v1alpha1.ModeConnect {
		action = "connect"
	}
	op := audit.Op{Cluster: b.Cluster, Kind: "PluginInstallation", Name: v1alpha1.InstallationName(b.Plugin, b.Cluster), Action: action}
	var created *v1alpha1.PluginInstallation
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !canInstall(ctx) {
			return "", fmt.Errorf("%w: only administrators may install plugins", audit.ErrDenied)
		}
		var p v1alpha1.Plugin
		if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: b.Plugin}, &p); err != nil {
			if apierrors.IsNotFound(err) {
				return "", errorf(http.StatusNotFound, "plugin %q is not in the catalog", b.Plugin)
			}
			return "", err
		}
		if !a.trusted(ctx)[p.Spec.Repository] {
			return "", fmt.Errorf("%w: plugin %s comes from an untrusted repository", audit.ErrDenied, p.Name)
		}
		if !p.Status.Available {
			return "", errorf(http.StatusConflict, "plugin %s cannot be installed: %s", p.Name, p.Status.Problem)
		}
		if !slices.Contains(p.Spec.Modes, b.Mode) {
			return "", errorf(http.StatusBadRequest, "plugin %s does not support %s mode", p.Name, b.Mode)
		}
		enabled, msg, err := a.installerState(b.Cluster)
		if err != nil {
			return "", err
		}
		if !enabled {
			return "", errorf(http.StatusConflict, "plugin installs are disabled on %s: %s", b.Cluster, msg)
		}
		schema := []byte(nil)
		if p.Spec.ConfigSchema != nil {
			schema = p.Spec.ConfigSchema.Raw
		}
		cfg, err := ValidateConfig(schema, b.Config)
		if err != nil {
			return "", err
		}
		if _, err := Namespace(&p.Spec, b.Mode, cfg); err != nil {
			return "", errorf(http.StatusBadRequest, "%v", err)
		}
		raw, _ := json.Marshal(cfg)
		in := &v1alpha1.PluginInstallation{
			ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.InstallationName(b.Plugin, b.Cluster), Annotations: map[string]string{
				v1alpha1.AnnotationRequestedBy: user(ctx), v1alpha1.AnnotationRequestAuditID: audit.IDFrom(ctx),
			}},
			Spec: v1alpha1.PluginInstallationSpec{Plugin: p.Name, Cluster: b.Cluster, Mode: b.Mode, Version: p.Spec.Version,
				Enabled: b.Enabled == nil || *b.Enabled, Config: &runtime.RawExtension{Raw: raw}},
		}
		if err := a.Mgmt.Create(ctx, in); err != nil {
			if apierrors.IsAlreadyExists(err) {
				return "", errorf(http.StatusConflict, "%s is already installed on %s", b.Plugin, b.Cluster)
			}
			return "", err
		}
		created = in
		return fmt.Sprintf("%s %s on %s (%s mode)", p.Name, p.Spec.Version, b.Cluster, b.Mode), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusCreated, viewOf(created))
}

// UpdateRequest is PATCH /api/plugins/installations/{id}.
type UpdateRequest struct {
	Enabled *bool          `json:"enabled,omitempty"`
	Config  map[string]any `json:"config,omitempty"`
	// Version upgrades to the catalog's version (the only one available).
	Version string `json:"version,omitempty"`
	// UID guards against acting on a re-created installation.
	UID string `json:"uid"`
}

func (a *API) update(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b UpdateRequest
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	var actions []string
	if b.Version != "" {
		actions = append(actions, "upgrade")
	}
	if b.Config != nil {
		actions = append(actions, "configure")
	}
	if b.Enabled != nil {
		actions = append(actions, map[bool]string{true: "enable", false: "disable"}[*b.Enabled])
	}
	if len(actions) == 0 {
		writeErr(w, errorf(http.StatusBadRequest, "nothing to change"))
		return
	}
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: id}, &in); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: in.Spec.Cluster, Kind: "PluginInstallation", Name: id, Action: strings.Join(actions, "+")}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !canInstall(ctx) {
			return "", fmt.Errorf("%w: only administrators may change plugins", audit.ErrDenied)
		}
		if b.UID == "" || b.UID != string(in.UID) {
			return "", errorf(http.StatusConflict, "the installation changed since it was loaded (uid mismatch); reload and try again")
		}
		if !in.DeletionTimestamp.IsZero() {
			return "", errorf(http.StatusConflict, "the installation is being removed")
		}
		var p v1alpha1.Plugin
		if err := a.Mgmt.Get(ctx, types.NamespacedName{Name: in.Spec.Plugin}, &p); err != nil {
			return "", err
		}
		var details []string
		if b.Version != "" {
			if b.Version != p.Spec.Version || !p.Status.Available {
				return "", errorf(http.StatusConflict, "the catalog offers %s %s (available: %v)", p.Name, p.Spec.Version, p.Status.Available)
			}
			if p.Spec.ExtensionAPI != ExtensionAPIVersion {
				return "", errorf(http.StatusConflict, "%s %s needs extension API %d; this Capybara provides %d", p.Name, b.Version, p.Spec.ExtensionAPI, ExtensionAPIVersion)
			}
			details = append(details, fmt.Sprintf("version %s → %s", in.Spec.Version, b.Version))
			in.Spec.Version = b.Version
		}
		if b.Config != nil {
			schema := []byte(nil)
			if p.Spec.ConfigSchema != nil {
				schema = p.Spec.ConfigSchema.Raw
			}
			cfg, err := ValidateConfig(schema, b.Config)
			if err != nil {
				return "", err
			}
			raw, _ := json.Marshal(cfg)
			in.Spec.Config = &runtime.RawExtension{Raw: raw}
			keys := make([]string, 0, len(cfg))
			for k := range cfg {
				keys = append(keys, k)
			}
			sort.Strings(keys)
			details = append(details, "config "+strings.Join(keys, ", "))
		}
		if b.Enabled != nil {
			in.Spec.Enabled = *b.Enabled
			details = append(details, map[bool]string{true: "UI shown", false: "UI hidden; the tool keeps running"}[*b.Enabled])
		}
		if in.Annotations == nil {
			in.Annotations = map[string]string{}
		}
		in.Annotations[v1alpha1.AnnotationRequestedBy] = user(ctx)
		in.Annotations[v1alpha1.AnnotationRequestAuditID] = audit.IDFrom(ctx)
		if err := a.Mgmt.Update(ctx, &in); err != nil {
			return "", err
		}
		return strings.Join(details, "; "), nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, viewOf(&in))
}

// remove uninstalls. ?confirm must repeat the id and ?uid match;
// ?keepData=true keeps PersistentVolumeClaims; ?removeCRDs=<hash> removes
// the chart's CRDs, confirming exactly the foreign objects a CRD scan listed.
func (a *API) remove(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	id := r.PathValue("id")
	q := r.URL.Query()
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: id}, &in); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: in.Spec.Cluster, Kind: "PluginInstallation", Name: id, Action: "uninstall"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !canInstall(ctx) {
			return "", fmt.Errorf("%w: only administrators may uninstall plugins", audit.ErrDenied)
		}
		if q.Get("confirm") != id {
			return "", errorf(http.StatusBadRequest, "confirm must repeat the installation id")
		}
		if q.Get("uid") != string(in.UID) {
			return "", errorf(http.StatusConflict, "the installation changed since it was loaded (uid mismatch); reload and try again")
		}
		keep := q.Get("keepData") == "true"
		crds := q.Get("removeCRDs")
		detail := "data removed"
		if keep {
			detail = "data kept"
		}
		if crds != "" {
			scan := in.Status.CRDScan
			if scan == nil || scan.Hash != crds || scan.Error != "" {
				return "", errorf(http.StatusConflict, "CRD removal must confirm the latest CRD scan; scan again and review the list")
			}
			detail += fmt.Sprintf("; remove CRDs %s (confirmed %d object(s) not from this plugin)", strings.Join(scan.CRDs, ", "), len(scan.Foreign))
		} else if in.Spec.Mode == v1alpha1.ModeInstall {
			detail += "; CRDs kept"
		}
		patch := client.MergeFrom(in.DeepCopy())
		if in.Annotations == nil {
			in.Annotations = map[string]string{}
		}
		in.Annotations[v1alpha1.AnnotationRequestedBy] = user(ctx)
		in.Annotations[v1alpha1.AnnotationRequestAuditID] = audit.IDFrom(ctx)
		in.Annotations[v1alpha1.AnnotationUninstallKeepData] = fmt.Sprint(keep)
		if crds != "" {
			in.Annotations[v1alpha1.AnnotationUninstallRemoveCRDs] = crds
		} else {
			delete(in.Annotations, v1alpha1.AnnotationUninstallRemoveCRDs)
		}
		if err := a.Mgmt.Patch(ctx, &in, patch); err != nil {
			return "", err
		}
		if err := a.Mgmt.Delete(ctx, &in, client.Preconditions{UID: &in.UID}); err != nil && !apierrors.IsNotFound(err) {
			return "", err
		}
		return detail, nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"uninstalling": true})
}

// crdScan asks the controller to list objects of the plugin's CRDs that do
// not belong to its release; the answer appears in status.crdScan.
func (a *API) crdScan(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: r.PathValue("id")}, &in); err != nil {
		writeErr(w, err)
		return
	}
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	req := hex.EncodeToString(b)
	patch := client.MergeFrom(in.DeepCopy())
	if in.Annotations == nil {
		in.Annotations = map[string]string{}
	}
	in.Annotations[v1alpha1.AnnotationCRDScanRequest] = req
	if err := a.Mgmt.Patch(r.Context(), &in, patch); err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusAccepted, map[string]string{"request": req})
}

// ConnectTokenSecretName is the mgmt Secret with an installation's
// connect-mode bearer token.
func ConnectTokenSecretName(id string) string {
	return "plugin-connect-" + strings.ReplaceAll(id, ".", "-")
}

// setConnectToken stores a bearer token for connect mode (e.g. OCP Thanos
// Querier). Write-only: no API returns it.
func (a *API) setConnectToken(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	var b struct {
		Token string `json:"token"`
	}
	if err := decode(w, r, &b); err != nil {
		writeErr(w, err)
		return
	}
	id := r.PathValue("id")
	var in v1alpha1.PluginInstallation
	if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: id}, &in); err != nil {
		writeErr(w, err)
		return
	}
	op := audit.Op{Cluster: in.Spec.Cluster, Kind: "PluginInstallation", Name: id, Action: "set-connect-token"}
	err := a.Auditor.Do(r.Context(), op, func(ctx context.Context) (string, error) {
		if !canInstall(ctx) {
			return "", fmt.Errorf("%w: only administrators may configure plugins", audit.ErrDenied)
		}
		tok := strings.TrimSpace(b.Token)
		if tok == "" || len(tok) > 16<<10 || strings.ContainsAny(tok, " \n\r\t") {
			return "", errorf(http.StatusBadRequest, "the token must be a single line without spaces")
		}
		name := ConnectTokenSecretName(id)
		s := &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: name}}
		if _, err := controllerutil.CreateOrUpdate(ctx, a.Mgmt, s, func() error {
			if s.Type != "" && s.Type != v1alpha1.PluginConnectSecretType {
				return fmt.Errorf("secret %s has another type", name)
			}
			s.Type = v1alpha1.PluginConnectSecretType
			s.Labels = pluginLabels(in.Spec.Plugin, in.Spec.Cluster)
			s.Data = map[string][]byte{TokenKey: []byte(tok)}
			return controllerutil.SetOwnerReference(&in, s, a.Mgmt.Scheme())
		}); err != nil {
			return "", err
		}
		if in.Spec.ConnectSecret == nil || in.Spec.ConnectSecret.Name != name {
			in.Spec.ConnectSecret = &v1alpha1.SecretRef{Name: name}
			if err := a.Mgmt.Update(ctx, &in); err != nil {
				return "", err
			}
		}
		return "bearer token stored", nil
	})
	if err != nil {
		writeErr(w, err)
		return
	}
	httpjson.Write(w, http.StatusOK, map[string]any{"stored": true})
}
