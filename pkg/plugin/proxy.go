package plugin

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/httpjson"
)

// Headers never passed between the browser, Capybara, backends and clusters.
var strippedHeaders = []string{"Authorization", "Cookie", "Set-Cookie", "Proxy-Authorization",
	"Impersonate-User", "Impersonate-Group", "Impersonate-Uid", "X-Remote-User", "X-Remote-Group",
	"X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto", "X-Capybara-User"}

func stripHeaders(h http.Header) {
	for _, k := range strippedHeaders {
		h.Del(k)
	}
	for k := range h {
		if strings.HasPrefix(strings.ToLower(k), "impersonate-extra-") {
			h.Del(k)
		}
	}
}

// BackendProxy forwards /api/plugins/{name}/... from the browser to the
// plugin's backend (a separate process). Plugin code never runs inside
// Capybara; the backend sees the user only through X-Capybara-User.
type BackendProxy struct {
	Backends map[string]string // name → http://127.0.0.1:port
	Logger   *slog.Logger
}

// Register adds the route.
func (p *BackendProxy) Register(mux *http.ServeMux) {
	mux.Handle("/api/plugins/{name}/{rest...}", p)
}

func (p *BackendProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	raw, ok := p.Backends[name]
	if !ok {
		httpjson.Error(w, http.StatusNotFound, "plugin "+name+" has no backend")
		return
	}
	target, err := url.Parse(raw)
	if err != nil {
		httpjson.Error(w, http.StatusBadGateway, "bad backend address")
		return
	}
	userName := "unknown"
	if u, ok := auth.UserFrom(r.Context()); ok {
		userName = u.Name
	}
	rest := "/" + r.PathValue("rest")
	rp := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme, pr.Out.URL.Host = target.Scheme, target.Host
			pr.Out.URL.Path, pr.Out.URL.RawPath = rest, ""
			pr.Out.Host = target.Host
			stripHeaders(pr.Out.Header)
			pr.Out.Header.Set("X-Capybara-User", userName)
			pr.Out.Header.Set("X-Capybara-Prefix", "/api/plugins/"+name)
		},
		ModifyResponse: func(resp *http.Response) error {
			resp.Header.Del("Set-Cookie")
			return nil
		},
		FlushInterval: -1,
		ErrorHandler: func(w http.ResponseWriter, _ *http.Request, err error) {
			p.Logger.Warn("plugin backend unreachable", "plugin", name, "err", err)
			httpjson.Error(w, http.StatusBadGateway, "the "+name+" backend is not answering")
		},
	}
	rp.ServeHTTP(w, r)
}

// BackendCredentials issues each host-process plugin backend its own
// credential at startup: a random token written to <dir>/<name>.token
// (mode 600) for the backend to read; only its hash stays in memory. A
// restart rotates every credential.
type BackendCredentials struct {
	mu     sync.RWMutex
	hashes map[string][32]byte
}

// IssueBackendCredentials creates credentials for the named backends.
func IssueBackendCredentials(dir string, names []string) (*BackendCredentials, error) {
	c := &BackendCredentials{hashes: map[string][32]byte{}}
	if len(names) == 0 {
		return c, nil
	}
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}
	for _, n := range names {
		if !nameRE.MatchString(n) {
			return nil, fmt.Errorf("backend name %q is not a DNS label", n)
		}
		b := make([]byte, 32)
		if _, err := rand.Read(b); err != nil {
			return nil, err
		}
		tok := base64.RawURLEncoding.EncodeToString(b)
		file := filepath.Join(dir, n+".token")
		tmp := file + ".tmp"
		if err := os.WriteFile(tmp, []byte(tok), 0o600); err != nil {
			return nil, err
		}
		if err := os.Rename(tmp, file); err != nil {
			return nil, err
		}
		c.hashes[n] = sha256.Sum256([]byte(tok))
	}
	return c, nil
}

// Check reports whether token is backend name's credential.
func (c *BackendCredentials) Check(name, token string) bool {
	c.mu.RLock()
	want, ok := c.hashes[name]
	c.mu.RUnlock()
	got := sha256.Sum256([]byte(token))
	return ok && subtle.ConstantTimeCompare(want[:], got[:]) == 1
}

// ClusterConfigs gives the base REST config of a cluster (host and CA).
type ClusterConfigs interface {
	RESTConfig(id string) (*rest.Config, error)
}

// ScopedProxy lets a plugin backend reach what its plugin declared, and
// nothing else: /internal/plugins/{name}/clusters/{id}/services/{svc}/{path...}
//
//   - the caller must hold the backend credential Capybara issued to {name};
//   - the plugin must be installed, Ready and enabled on cluster {id};
//   - {svc} must be one of its declared services there, with an allowed
//     method and path prefix;
//   - the request goes to the cluster with the plugin's own Kubernetes
//     token, whose Role allows only those services.
//
// It is not under /api: the browser cannot use it, and no user identity
// applies.
type ScopedProxy struct {
	Mgmt        client.Client
	Credentials *BackendCredentials
	Clusters    ClusterConfigs
	Logger      *slog.Logger
	// AllowExternal permits connect targets outside the cluster (OCP Thanos
	// Querier routes). Only loopback hosts are allowed until Phase 5's host
	// allowlist.
	AllowExternal func(host string) bool

	mu    sync.Mutex
	cache map[string]cachedToken
}

type cachedToken struct {
	token    string
	services []Service
	expires  time.Time
	at       time.Time
}

// Register adds the route.
func (p *ScopedProxy) Register(mux *http.ServeMux) {
	mux.Handle("/internal/plugins/{name}/clusters/{id}/services/{svc}/{path...}", p)
}

type scopedError struct {
	status int
	msg    string
}

func (e *scopedError) Error() string { return e.msg }

func (p *ScopedProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if err := p.serve(w, r); err != nil {
		var se *scopedError
		if errors.As(err, &se) {
			httpjson.Error(w, se.status, se.msg)
			return
		}
		p.Logger.Warn("scoped plugin request failed", "plugin", r.PathValue("name"), "cluster", r.PathValue("id"), "err", err)
		httpjson.Error(w, http.StatusBadGateway, "the cluster did not answer")
	}
}

func (p *ScopedProxy) serve(w http.ResponseWriter, r *http.Request) error {
	name, id, svc := r.PathValue("name"), r.PathValue("id"), r.PathValue("svc")
	token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
	if !ok || !p.Credentials.Check(name, token) {
		return &scopedError{http.StatusUnauthorized, "plugin backend credential required"}
	}
	var in v1alpha1.PluginInstallation
	if err := p.Mgmt.Get(r.Context(), types.NamespacedName{Name: v1alpha1.InstallationName(name, id)}, &in); err != nil {
		return &scopedError{http.StatusForbidden, name + " is not installed on " + id}
	}
	if in.Status.Phase != v1alpha1.InstallReady || !in.Spec.Enabled || !in.DeletionTimestamp.IsZero() {
		return &scopedError{http.StatusForbidden, name + " is not ready and enabled on " + id}
	}
	tok, err := p.token(r.Context(), name, id)
	if err != nil {
		return &scopedError{http.StatusForbidden, "no token for " + name + " on " + id}
	}
	i := slices.IndexFunc(tok.services, func(s Service) bool { return s.Name == svc })
	if i < 0 {
		return &scopedError{http.StatusForbidden, "service " + svc + " is not declared for " + name}
	}
	s := tok.services[i]
	reqPath, err := cleanPath(r.PathValue("path"))
	if err != nil {
		return &scopedError{http.StatusBadRequest, err.Error()}
	}
	if !slices.Contains(s.Methods, r.Method) {
		return &scopedError{http.StatusMethodNotAllowed, r.Method + " is not allowed for " + svc}
	}
	if !pathAllowed(s.Paths, reqPath) {
		return &scopedError{http.StatusForbidden, reqPath + " is not an allowed path for " + svc}
	}

	cfg := ConfigOf(&in)
	if in.Spec.Mode == v1alpha1.ModeConnect && ConfigString(cfg, "target") == "thanos-querier" {
		return p.thanos(w, r, &in, cfg, reqPath)
	}
	base, err := p.Clusters.RESTConfig(id)
	if err != nil {
		return &scopedError{http.StatusServiceUnavailable, "cluster " + id + " is not available"}
	}
	tc := TokenConfig(base, tok.token)
	transport, err := rest.TransportFor(tc)
	if err != nil {
		return err
	}
	host, err := url.Parse(tc.Host)
	if err != nil {
		return err
	}
	prefix := "/api/v1/namespaces/" + s.Namespace + "/services/" + s.ProxyName() + "/proxy"
	rp := &httputil.ReverseProxy{
		Transport: transport,
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme, pr.Out.URL.Host = host.Scheme, host.Host
			pr.Out.URL.Path, pr.Out.URL.RawPath = prefix+reqPath, ""
			pr.Out.URL.RawQuery = r.URL.RawQuery
			pr.Out.Host = host.Host
			stripHeaders(pr.Out.Header)
		},
		ModifyResponse: func(resp *http.Response) error {
			resp.Header.Del("Set-Cookie")
			return unrewriteHTML(resp, prefix)
		},
		FlushInterval: -1,
		ErrorHandler: func(w http.ResponseWriter, _ *http.Request, err error) {
			p.Logger.Warn("service proxy failed", "plugin", name, "cluster", id, "service", svc, "err", err)
			httpjson.Error(w, http.StatusBadGateway, "the cluster did not answer")
		},
	}
	rp.ServeHTTP(w, r)
	return nil
}

// thanos forwards to an OpenShift Thanos Querier route with the stored
// bearer token: port 9091 (needs cluster-monitoring-view), or the
// tenancy endpoint with ?namespace= (needs view in that namespace).
// UNTESTED on real OpenShift; refused for non-loopback hosts until Phase 5.
func (p *ScopedProxy) thanos(w http.ResponseWriter, r *http.Request, in *v1alpha1.PluginInstallation, cfg map[string]any, reqPath string) error {
	req, err := ThanosRequest(r.Context(), ConfigString(cfg, "thanosURL"), ConfigString(cfg, "tenancyNamespace"), reqPath, r.URL.Query(), "")
	if err != nil {
		return &scopedError{http.StatusBadRequest, err.Error()}
	}
	allow := p.AllowExternal
	if allow == nil {
		allow = isLoopbackHost
	}
	if !allow(req.URL.Hostname()) {
		return &scopedError{http.StatusForbidden, "Thanos Querier at " + req.URL.Host + " is outside the local clusters; external hosts need the Phase 5 host allowlist"}
	}
	if in.Spec.ConnectSecret == nil {
		return &scopedError{http.StatusForbidden, "no bearer token stored for this connection"}
	}
	var s corev1.Secret
	if err := p.Mgmt.Get(r.Context(), types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: in.Spec.ConnectSecret.Name}, &s); err != nil || s.Type != v1alpha1.PluginConnectSecretType {
		return &scopedError{http.StatusForbidden, "the stored bearer token is missing"}
	}
	req.Header.Set("Authorization", "Bearer "+string(s.Data[TokenKey]))
	resp, err := http.DefaultClient.Do(req) //nolint:gosec // host checked above
	if err != nil {
		return err
	}
	defer resp.Body.Close() //nolint:errcheck
	resp.Header.Del("Set-Cookie")
	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = io.Copy(w, resp.Body)
	return nil
}

// ThanosRequest builds a GET to a Thanos Querier: base is the route URL
// (https only); tenancy namespaces add the required namespace parameter.
func ThanosRequest(ctx context.Context, base, tenancyNS, reqPath string, query url.Values, token string) (*http.Request, error) {
	u, err := url.Parse(base)
	if err != nil || u.Scheme != "https" || u.Host == "" || u.User != nil {
		return nil, errors.New("thanosURL must be an https:// URL without credentials")
	}
	q := url.Values{}
	for k, v := range query {
		if k != "namespace" {
			q[k] = v
		}
	}
	if tenancyNS != "" {
		if !dnsRE.MatchString(tenancyNS) {
			return nil, errors.New("tenancyNamespace must be a namespace name")
		}
		q.Set("namespace", tenancyNS)
	}
	u.Path = strings.TrimRight(u.Path, "/") + reqPath
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	return req, nil
}

func (p *ScopedProxy) token(ctx context.Context, name, id string) (cachedToken, error) {
	key := name + "/" + id
	p.mu.Lock()
	if p.cache == nil {
		p.cache = map[string]cachedToken{}
	}
	c, ok := p.cache[key]
	p.mu.Unlock()
	if ok && time.Since(c.at) < 30*time.Second && time.Until(c.expires) > time.Minute {
		return c, nil
	}
	var s corev1.Secret
	if err := p.Mgmt.Get(ctx, types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: TokenSecretName(name, id)}, &s); err != nil {
		return cachedToken{}, err
	}
	if s.Type != v1alpha1.PluginTokenSecretType {
		return cachedToken{}, errors.New("wrong secret type")
	}
	c = cachedToken{token: string(s.Data[TokenKey]), at: time.Now()}
	c.expires, _ = time.Parse(time.RFC3339, string(s.Data[ExpiresKey]))
	if err := json.Unmarshal(s.Data[ServicesKey], &c.services); err != nil {
		return cachedToken{}, err
	}
	p.mu.Lock()
	p.cache[key] = c
	p.mu.Unlock()
	return c, nil
}

// cleanPath normalises a request path and refuses traversal and encoded
// separators.
func cleanPath(p string) (string, error) {
	if strings.Contains(p, "..") || strings.Contains(p, "%") || strings.Contains(p, "\\") {
		return "", errors.New("invalid path")
	}
	return path.Clean("/" + p), nil
}

func pathAllowed(prefixes []string, p string) bool {
	for _, pre := range prefixes {
		if pre == "/" || p == pre || strings.HasPrefix(p, strings.TrimSuffix(pre, "/")+"/") {
			return true
		}
	}
	return false
}

// unrewriteHTML undoes the kube-apiserver's service proxy rewriting of
// absolute links in HTML (it prefixes them with its proxy path), so a UI
// served under Capybara's own path (Grafana's sub path) keeps working.
func unrewriteHTML(resp *http.Response, prefix string) error {
	if !strings.HasPrefix(resp.Header.Get("Content-Type"), "text/html") {
		return nil
	}
	var r io.Reader = resp.Body
	gz := resp.Header.Get("Content-Encoding") == "gzip"
	if gz {
		zr, err := gzip.NewReader(resp.Body)
		if err != nil {
			return err
		}
		r = zr
	}
	body, err := readLimited(r, 8<<20)
	_ = resp.Body.Close()
	if err != nil {
		return err
	}
	body = bytes.ReplaceAll(body, []byte(prefix), nil)
	resp.Header.Del("Content-Encoding")
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	resp.ContentLength = int64(len(body))
	resp.Body = io.NopCloser(bytes.NewReader(body))
	return nil
}

func isLoopbackHost(h string) bool {
	if h == "localhost" {
		return true
	}
	ip := net.ParseIP(h)
	return ip != nil && ip.IsLoopback()
}
