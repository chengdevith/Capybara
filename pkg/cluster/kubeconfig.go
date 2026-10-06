package cluster

import (
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

// MaxKubeconfigBytes bounds an uploaded kubeconfig.
const MaxKubeconfigBytes = 256 << 10

// ValidateOptions tune kubeconfig validation.
type ValidateOptions struct {
	// AllowInsecure accepts insecure-skip-tls-verify (dev only; the server
	// flag --allow-insecure-kubeconfig, off by default).
	AllowInsecure bool
}

// Summary describes a kubeconfig without any of its secrets.
type Summary struct {
	Context    string     `json:"context"`
	Server     string     `json:"server"`
	AuthMethod string     `json:"authMethod"` // "client certificate" or "token"
	CAIncluded bool       `json:"caIncluded"`
	Insecure   bool       `json:"insecureSkipTLSVerify"`
	Identity   string     `json:"identity,omitempty"` // certificate CN or token subject
	ExpiresAt  *time.Time `json:"expiresAt,omitempty"`
	Warnings   []string   `json:"warnings,omitempty"`
}

// ValidationError lists every problem found. Messages never quote the
// kubeconfig's content.
type ValidationError struct{ Problems []string }

func (e *ValidationError) Error() string {
	return "kubeconfig rejected: " + strings.Join(e.Problems, "; ")
}

var yamlLine = regexp.MustCompile(`line (\d+)`)

// ParseKubeconfig validates an uploaded kubeconfig and summarises it:
//   - exactly one context, cluster and user
//   - no exec credential plugins or auth-provider entries (they would run
//     commands or call out from the Capybara server)
//   - certificates, keys and tokens inline; no file paths
//   - no basic auth, impersonation or proxy-url
//   - https server on loopback (local k3d clusters only)
//   - no insecure-skip-tls-verify unless opts.AllowInsecure
func ParseKubeconfig(raw []byte, opts ValidateOptions) (*clientcmdapi.Config, *Summary, error) {
	if len(raw) == 0 {
		return nil, nil, &ValidationError{Problems: []string{"kubeconfig is empty"}}
	}
	if len(raw) > MaxKubeconfigBytes {
		return nil, nil, &ValidationError{Problems: []string{"kubeconfig is too large"}}
	}
	cfg, err := clientcmd.Load(raw)
	if err != nil {
		// Parser errors can quote the input; keep only the line number.
		msg := "kubeconfig is not valid YAML or JSON"
		if m := yamlLine.FindStringSubmatch(err.Error()); m != nil {
			msg += " (line " + m[1] + ")"
		}
		return nil, nil, &ValidationError{Problems: []string{msg}}
	}

	var problems []string
	add := func(format string, args ...any) { problems = append(problems, fmt.Sprintf(format, args...)) }

	if len(cfg.Contexts) != 1 {
		add("must contain exactly one context (found %d)", len(cfg.Contexts))
	}
	if len(cfg.Clusters) != 1 {
		add("must contain exactly one cluster (found %d)", len(cfg.Clusters))
	}
	if len(cfg.AuthInfos) != 1 {
		add("must contain exactly one user (found %d)", len(cfg.AuthInfos))
	}
	if len(problems) > 0 {
		return nil, nil, &ValidationError{Problems: problems}
	}

	var ctxName string
	var kctx *clientcmdapi.Context
	for name, c := range cfg.Contexts {
		ctxName, kctx = name, c
	}
	if cfg.CurrentContext != "" && cfg.CurrentContext != ctxName {
		add("current-context does not name the only context")
	}
	cl, ok := cfg.Clusters[kctx.Cluster]
	if !ok {
		add("the context refers to a cluster that is not in the file")
	}
	ai, ok2 := cfg.AuthInfos[kctx.AuthInfo]
	if !ok2 {
		add("the context refers to a user that is not in the file")
	}
	if !ok || !ok2 {
		return nil, nil, &ValidationError{Problems: problems}
	}

	s := &Summary{Context: ctxName, Server: cl.Server, CAIncluded: len(cl.CertificateAuthorityData) > 0, Insecure: cl.InsecureSkipTLSVerify}

	// Cluster.
	u, err := url.Parse(cl.Server)
	switch {
	case err != nil || u.Host == "":
		add("server is not a valid URL")
	case u.Scheme != "https":
		add("server must use https")
	case !isLoopbackHost(u.Hostname()):
		add("server %s is not on this machine; only local clusters can be registered", u.Hostname())
	}
	if cl.CertificateAuthority != "" {
		add("certificate-authority must be inline (certificate-authority-data), not a file path")
	}
	if cl.ProxyURL != "" {
		add("proxy-url is not allowed")
	}
	if cl.InsecureSkipTLSVerify && !opts.AllowInsecure {
		add("insecure-skip-tls-verify is not allowed")
	}
	if !cl.InsecureSkipTLSVerify && !s.CAIncluded {
		add("certificate-authority-data is required to verify the server")
	}

	// User.
	if ai.Exec != nil {
		add("exec credential plugins are not allowed (they would run commands on the Capybara server)")
	}
	if ai.AuthProvider != nil {
		add("auth-provider entries are not allowed")
	}
	if ai.ClientCertificate != "" || ai.ClientKey != "" {
		add("client certificate and key must be inline (client-certificate-data, client-key-data), not file paths")
	}
	if ai.TokenFile != "" {
		add("token must be inline, not a token file")
	}
	if ai.Username != "" || ai.Password != "" {
		add("basic auth (username/password) is not allowed")
	}
	if ai.Impersonate != "" || ai.ImpersonateUID != "" || len(ai.ImpersonateGroups) > 0 || len(ai.ImpersonateUserExtra) > 0 {
		add("impersonation settings are not allowed")
	}
	hasCert := len(ai.ClientCertificateData) > 0 && len(ai.ClientKeyData) > 0
	switch {
	case ai.Token != "":
		s.AuthMethod = "token"
		if sub, exp, ok := jwtClaims(ai.Token); ok {
			s.Identity, s.ExpiresAt = sub, exp
		}
	case hasCert:
		s.AuthMethod = "client certificate"
		if cn, notAfter, ok := certInfo(ai.ClientCertificateData); ok {
			s.Identity, s.ExpiresAt = cn, &notAfter
		} else {
			add("client-certificate-data is not a valid PEM certificate")
		}
	default:
		add("the user needs an inline token or an inline client certificate and key")
	}
	if s.ExpiresAt != nil && s.ExpiresAt.Before(time.Now()) {
		s.Warnings = append(s.Warnings, "the credentials have expired")
	}
	if cl.InsecureSkipTLSVerify {
		s.Warnings = append(s.Warnings, "TLS verification is disabled (dev only)")
	}

	if len(problems) > 0 {
		return nil, nil, &ValidationError{Problems: problems}
	}
	cfg.CurrentContext = ctxName
	return cfg, s, nil
}

// RESTConfigFromKubeconfig validates raw and builds a REST config from it
// alone (never KUBECONFIG, ~/.kube/config or in-cluster config).
func RESTConfigFromKubeconfig(raw []byte, opts ValidateOptions) (*rest.Config, *Summary, error) {
	cfg, s, err := ParseKubeconfig(raw, opts)
	if err != nil {
		return nil, nil, err
	}
	rc, err := clientcmd.NewNonInteractiveClientConfig(*cfg, cfg.CurrentContext, &clientcmd.ConfigOverrides{}, nil).ClientConfig()
	if err != nil {
		return nil, nil, &ValidationError{Problems: []string{"kubeconfig cannot be turned into a client configuration"}}
	}
	rc.UserAgent = "capybara"
	return rc, s, nil
}

// certInfo reads the subject CN and expiry of a PEM certificate.
func certInfo(pemData []byte) (string, time.Time, bool) {
	block, _ := pem.Decode(pemData)
	if block == nil {
		return "", time.Time{}, false
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return "", time.Time{}, false
	}
	return cert.Subject.CommonName, cert.NotAfter, true
}

// jwtClaims reads sub and exp from a JWT without verifying it: the values
// are only displayed (the cluster verifies the token itself).
func jwtClaims(token string) (string, *time.Time, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", nil, false
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", nil, false
	}
	var claims struct {
		Sub string `json:"sub"`
		Exp int64  `json:"exp"`
	}
	if json.Unmarshal(payload, &claims) != nil {
		return "", nil, false
	}
	var exp *time.Time
	if claims.Exp > 0 {
		t := time.Unix(claims.Exp, 0).UTC()
		exp = &t
	}
	return claims.Sub, exp, true
}

// IsValidationError reports whether err is a kubeconfig validation problem.
func IsValidationError(err error) bool {
	var v *ValidationError
	return errors.As(err, &v)
}
