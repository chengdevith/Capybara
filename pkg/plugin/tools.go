package plugin

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"slices"
	"strings"

	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/httpjson"
)

// ToolLink is one entry of the console's tools launcher.
type ToolLink struct {
	Plugin string `json:"plugin"`
	Name   string `json:"name"`
	Title  string `json:"title"`
	Icon   string `json:"icon,omitempty"`
	URL    string `json:"url"`
}

// ToolPath is where Capybara serves a proxied tool (its root path).
func ToolPath(plugin, tool, clusterID string) string {
	return "/api/plugins/" + plugin + "/tools/" + tool + "/" + clusterID
}

// ToolURL is where a tool opens for an installation ("" when it has no
// address there, e.g. connect mode without the config key).
func ToolURL(p *v1alpha1.Plugin, t v1alpha1.Tool, in *v1alpha1.PluginInstallation) string {
	if !applies(t.Modes, in.Spec.Mode) {
		return ""
	}
	switch {
	case t.URL != "":
		return strings.ReplaceAll(t.URL, "{{cluster}}", in.Spec.Cluster)
	case t.URLKey != "":
		u := ConfigString(ConfigOf(in), t.URLKey)
		if pu, err := url.Parse(u); err != nil || pu.Scheme != "https" || pu.Host == "" {
			return ""
		}
		return u
	case t.Service != nil:
		return ToolPath(p.Name, t.Name, in.Spec.Cluster) + "/"
	}
	return ""
}

// ConsoleRules are the console permissions granted to Capybara's account
// while the plugin is installed: the declared ones, plus reaching each
// proxied tool's Service (any method: the tool's own UI writes through it).
func ConsoleRules(spec *v1alpha1.PluginSpec) []rbacv1.PolicyRule {
	rules := toRBAC(spec.Permissions.Console.ClusterRules)
	var names []string
	for _, t := range spec.Tools {
		if t.Service != nil {
			names = append(names, t.Service.Service+":"+t.Service.Port)
		}
	}
	if len(names) > 0 {
		rules = append(rules, rbacv1.PolicyRule{APIGroups: []string{""}, Resources: []string{"services/proxy"}, ResourceNames: names,
			Verbs: []string{"get", "create", "update", "patch", "delete"}})
	}
	return rules
}

// tools answers GET /api/clusters/{id}/tools: the launcher's entries for
// a cluster, from plugins installed (or connected) and enabled there.
func (a *API) tools(w http.ResponseWriter, r *http.Request) {
	if !a.ready(w) {
		return
	}
	id := r.PathValue("id")
	var list v1alpha1.PluginInstallationList
	if err := a.Mgmt.List(r.Context(), &list); err != nil {
		writeErr(w, err)
		return
	}
	out := []ToolLink{}
	for i := range list.Items {
		in := &list.Items[i]
		if in.Spec.Cluster != id || !Usable(in) {
			continue
		}
		var p v1alpha1.Plugin
		if err := a.Mgmt.Get(r.Context(), types.NamespacedName{Name: in.Spec.Plugin}, &p); err != nil {
			continue
		}
		for _, t := range p.Spec.Tools {
			if u := ToolURL(&p, t, in); u != "" {
				out = append(out, ToolLink{Plugin: p.Name, Name: t.Name, Title: t.Title, Icon: t.Icon, URL: u})
			}
		}
	}
	slices.SortFunc(out, func(x, y ToolLink) int { return strings.Compare(x.Title, y.Title) })
	httpjson.Write(w, http.StatusOK, out)
}

// ToolProxy serves a plugin's web UI that runs as a Service in the cluster:
// /api/plugins/{name}/tools/{tool}/{id}/{path...} goes to that Service
// through the Kubernetes service proxy, with Capybara's own account (its
// console grant allows exactly those Services). Only the tool's declared
// cookies pass, under its own path; every write (any method but GET and
// HEAD) is audited as <plugin>.tool-request.
type ToolProxy struct {
	Mgmt     client.Client
	Clusters ClusterConfigs
	Auditor  *audit.Auditor
	Logger   *slog.Logger
}

// Register adds the route.
func (p *ToolProxy) Register(mux *http.ServeMux) {
	mux.Handle("/api/plugins/{name}/tools/{tool}/{id}/{path...}", p)
}

func (p *ToolProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	name, toolName, id := r.PathValue("name"), r.PathValue("tool"), r.PathValue("id")
	if p.Mgmt == nil {
		httpjson.Error(w, http.StatusServiceUnavailable, "capybara-mgmt is not available")
		return
	}
	var in v1alpha1.PluginInstallation
	if err := p.Mgmt.Get(r.Context(), types.NamespacedName{Name: v1alpha1.InstallationName(name, id)}, &in); err != nil || !Usable(&in) {
		httpjson.Error(w, http.StatusNotFound, name+" is not installed and enabled on "+id)
		return
	}
	var pl v1alpha1.Plugin
	if err := p.Mgmt.Get(r.Context(), types.NamespacedName{Name: name}, &pl); err != nil {
		httpjson.Error(w, http.StatusNotFound, "plugin "+name+" is not in the catalog")
		return
	}
	i := slices.IndexFunc(pl.Spec.Tools, func(t v1alpha1.Tool) bool {
		return t.Name == toolName && t.Service != nil && applies(t.Modes, in.Spec.Mode)
	})
	if i < 0 {
		httpjson.Error(w, http.StatusNotFound, name+" has no tool "+toolName+" here")
		return
	}
	tool := pl.Spec.Tools[i]
	ns := tool.Service.Namespace
	if ns == "" {
		var err error
		if ns, err = Namespace(&pl.Spec, in.Spec.Mode, ConfigOf(&in)); err != nil || ns == "" {
			httpjson.Error(w, http.StatusNotFound, name+" has no namespace for "+toolName)
			return
		}
	}
	reqPath, err := cleanPath(r.PathValue("path"))
	if err != nil {
		httpjson.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	root := ToolPath(name, toolName, id)
	fwd := root + reqPath
	if strings.HasSuffix(r.URL.Path, "/") && !strings.HasSuffix(fwd, "/") {
		fwd += "/"
	}
	base, err := p.Clusters.RESTConfig(id)
	if err != nil {
		httpjson.Error(w, http.StatusServiceUnavailable, "cluster "+id+" is not available")
		return
	}
	rp, err := toolReverseProxy(base, ns, tool, root, fwd, r.URL.RawQuery, p.Logger)
	if err != nil {
		httpjson.Error(w, http.StatusBadGateway, "the cluster did not answer")
		return
	}
	if r.Method == http.MethodGet || r.Method == http.MethodHead {
		rp.ServeHTTP(w, r)
		return
	}
	// Writes are audited (fail-closed: not sent if they cannot be recorded).
	op := audit.Op{Cluster: id, Namespace: ns, Kind: "Tool", Name: toolName, Action: name + ".tool-request"}
	rec := &statusRecorder{ResponseWriter: w}
	err = p.Auditor.Do(r.Context(), op, func(context.Context) (string, error) {
		rp.ServeHTTP(rec, r)
		detail := fmt.Sprintf("%s %s → %d", r.Method, reqPath, rec.code())
		if rec.code() >= 400 {
			return "", fmt.Errorf("%s", detail)
		}
		return detail, nil
	})
	if err != nil && !rec.wrote {
		httpjson.Error(w, http.StatusServiceUnavailable, err.Error())
	}
}

func toolReverseProxy(base *rest.Config, ns string, tool v1alpha1.Tool, root, fwd, rawQuery string, logger *slog.Logger) (*httputil.ReverseProxy, error) {
	transport, err := rest.TransportFor(base)
	if err != nil {
		return nil, err
	}
	host, err := url.Parse(base.Host)
	if err != nil {
		return nil, err
	}
	prefix := "/api/v1/namespaces/" + ns + "/services/" + tool.Service.Service + ":" + tool.Service.Port + "/proxy"
	return &httputil.ReverseProxy{
		Transport: transport,
		Rewrite: func(pr *httputil.ProxyRequest) {
			cookies := pr.In.Cookies()
			pr.Out.URL.Scheme, pr.Out.URL.Host = host.Scheme, host.Host
			pr.Out.URL.Path, pr.Out.URL.RawPath = prefix+fwd, ""
			pr.Out.URL.RawQuery = rawQuery
			pr.Out.Host = host.Host
			stripHeaders(pr.Out.Header)
			for _, c := range cookies {
				if slices.Contains(tool.Cookies, c.Name) {
					pr.Out.AddCookie(c)
				}
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			// Only the tool's own cookies, and only under its path.
			setCookies := resp.Cookies()
			resp.Header.Del("Set-Cookie")
			for _, c := range setCookies {
				if !slices.Contains(tool.Cookies, c.Name) {
					continue
				}
				if c.Path == "" || !strings.HasPrefix(c.Path, root) {
					c.Path = root
				}
				resp.Header.Add("Set-Cookie", c.String())
			}
			if loc := resp.Header.Get("Location"); loc != "" {
				resp.Header.Set("Location", strings.Replace(loc, prefix, "", 1))
			}
			return unrewriteHTML(resp, prefix)
		},
		FlushInterval: -1,
		ErrorHandler: func(w http.ResponseWriter, _ *http.Request, err error) {
			logger.Warn("tool proxy failed", "tool", tool.Name, "err", err)
			httpjson.Error(w, http.StatusBadGateway, "the cluster did not answer")
		},
	}, nil
}

// statusRecorder notes the status a handler wrote.
type statusRecorder struct {
	http.ResponseWriter
	status int
	wrote  bool
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status, s.wrote = code, true
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	s.wrote = true
	return s.ResponseWriter.Write(b)
}

func (s *statusRecorder) Flush() {
	if f, ok := s.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

func (s *statusRecorder) code() int {
	if s.status == 0 {
		return http.StatusOK
	}
	return s.status
}
