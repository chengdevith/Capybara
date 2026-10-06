package cluster

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"math/big"
	"strings"
	"testing"
	"time"

	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

const secretToken = "SUPER-SECRET-TOKEN-VALUE"

func testCert(t *testing.T, cn string, notAfter time.Time) (certPEM, keyPEM []byte) {
	t.Helper()
	key, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	tmpl := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: cn}, NotBefore: time.Now().Add(-time.Hour), NotAfter: notAfter}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	kb, _ := x509.MarshalECPrivateKey(key)
	return pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der}), pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: kb})
}

func jwt(sub string, exp time.Time) string {
	enc := base64.RawURLEncoding.EncodeToString
	return enc([]byte(`{"alg":"RS256"}`)) + "." + enc([]byte(fmt.Sprintf(`{"sub":%q,"exp":%d}`, sub, exp.Unix()))) + "." + enc([]byte(secretToken))
}

// good is a valid, token-based kubeconfig; mutate tweaks it before encoding.
func good(t *testing.T, mutate func(*clientcmdapi.Config)) []byte {
	t.Helper()
	ca, _ := testCert(t, "ca", time.Now().Add(time.Hour))
	cfg := clientcmdapi.NewConfig()
	cfg.Clusters["c"] = &clientcmdapi.Cluster{Server: "https://127.0.0.1:6552", CertificateAuthorityData: ca}
	cfg.AuthInfos["u"] = &clientcmdapi.AuthInfo{Token: jwt("system:serviceaccount:capybara-system:capybara", time.Now().Add(30*24*time.Hour))}
	cfg.Contexts["capybara"] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
	cfg.CurrentContext = "capybara"
	if mutate != nil {
		mutate(cfg)
	}
	raw, err := clientcmd.Write(*cfg)
	if err != nil {
		t.Fatal(err)
	}
	return raw
}

func TestParseKubeconfigAcceptsTokenAndSummarises(t *testing.T) {
	_, s, err := ParseKubeconfig(good(t, nil), ValidateOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if s.AuthMethod != "token" || s.Identity != "system:serviceaccount:capybara-system:capybara" || !s.CAIncluded ||
		s.ExpiresAt == nil || time.Until(*s.ExpiresAt) < 29*24*time.Hour || s.Server != "https://127.0.0.1:6552" {
		t.Fatalf("summary = %+v", s)
	}
}

func TestParseKubeconfigAcceptsClientCertificate(t *testing.T) {
	notAfter := time.Now().Add(5 * 24 * time.Hour).Truncate(time.Second)
	cert, key := testCert(t, "capybara-admin", notAfter)
	_, s, err := ParseKubeconfig(good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"] = &clientcmdapi.AuthInfo{ClientCertificateData: cert, ClientKeyData: key}
	}), ValidateOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if s.AuthMethod != "client certificate" || s.Identity != "capybara-admin" || !s.ExpiresAt.Equal(notAfter.UTC()) {
		t.Fatalf("summary = %+v", s)
	}
}

func TestParseKubeconfigRejects(t *testing.T) {
	cases := map[string]struct {
		mutate func(*clientcmdapi.Config)
		want   string
	}{
		"exec plugin": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"].Exec = &clientcmdapi.ExecConfig{Command: "aws", APIVersion: "client.authentication.k8s.io/v1"}
		}, "exec credential plugins"},
		"auth provider": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"].AuthProvider = &clientcmdapi.AuthProviderConfig{Name: "oidc"}
		}, "auth-provider"},
		"two contexts": {func(c *clientcmdapi.Config) {
			c.Contexts["other"] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
		}, "exactly one context"},
		"two users": {func(c *clientcmdapi.Config) {
			c.AuthInfos["v"] = &clientcmdapi.AuthInfo{Token: "x"}
		}, "exactly one user"},
		"token file": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"] = &clientcmdapi.AuthInfo{TokenFile: "/var/run/token"}
		}, "token must be inline"},
		"cert files": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"] = &clientcmdapi.AuthInfo{ClientCertificate: "/tmp/c.crt", ClientKey: "/tmp/c.key"}
		}, "not file paths"},
		"CA file": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].CertificateAuthority = "/tmp/ca.crt"
		}, "certificate-authority must be inline"},
		"no CA": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].CertificateAuthorityData = nil
		}, "certificate-authority-data is required"},
		"insecure": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].InsecureSkipTLSVerify = true
			c.Clusters["c"].CertificateAuthorityData = nil
		}, "insecure-skip-tls-verify is not allowed"},
		"basic auth": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"] = &clientcmdapi.AuthInfo{Username: "admin", Password: "pw"}
		}, "basic auth"},
		"impersonation": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"].Impersonate = "system:admin"
		}, "impersonation"},
		"proxy": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].ProxyURL = "http://proxy:3128"
		}, "proxy-url"},
		"remote server": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].Server = "https://api.prod.example.com:6443"
		}, "not on this machine"},
		"plain http": {func(c *clientcmdapi.Config) {
			c.Clusters["c"].Server = "http://127.0.0.1:6552"
		}, "https"},
		"no credentials": {func(c *clientcmdapi.Config) {
			c.AuthInfos["u"] = &clientcmdapi.AuthInfo{}
		}, "needs an inline token"},
	}
	for name, tc := range cases {
		_, _, err := ParseKubeconfig(good(t, tc.mutate), ValidateOptions{})
		if err == nil || !strings.Contains(err.Error(), tc.want) {
			t.Errorf("%s: got %v, want an error containing %q", name, err, tc.want)
		}
		if err != nil && strings.Contains(err.Error(), secretToken) {
			t.Errorf("%s: error quotes the token", name)
		}
	}
}

func TestInsecureOnlyWithDevFlag(t *testing.T) {
	raw := good(t, func(c *clientcmdapi.Config) {
		c.Clusters["c"].InsecureSkipTLSVerify = true
		c.Clusters["c"].CertificateAuthorityData = nil
	})
	_, s, err := ParseKubeconfig(raw, ValidateOptions{AllowInsecure: true})
	if err != nil || !s.Insecure || len(s.Warnings) == 0 {
		t.Fatalf("with the dev flag: %v, %+v", err, s)
	}
}

func TestErrorsNeverQuoteContent(t *testing.T) {
	cert, key := testCert(t, "x", time.Now().Add(time.Hour))
	inputs := [][]byte{
		[]byte("apiVersion: v1\nusers:\n- name: u\n  user:\n    token: " + secretToken + "\n  : : broken"),
		[]byte("{\"token\": \"" + secretToken + "\", "),
		good(t, func(c *clientcmdapi.Config) {
			c.AuthInfos["u"] = &clientcmdapi.AuthInfo{ClientCertificateData: cert, ClientKeyData: key, Exec: &clientcmdapi.ExecConfig{Command: "x"}}
			c.Contexts["second"] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
		}),
	}
	for i, raw := range inputs {
		_, _, err := ParseKubeconfig(raw, ValidateOptions{})
		if err == nil {
			t.Fatalf("input %d: expected an error", i)
		}
		for _, secret := range []string{secretToken, string(key[30:60]), string(cert[30:60])} {
			if strings.Contains(err.Error(), secret) {
				t.Errorf("input %d: error quotes kubeconfig content: %v", i, err)
			}
		}
	}
}

func TestRESTConfigFromKubeconfig(t *testing.T) {
	rc, _, err := RESTConfigFromKubeconfig(good(t, nil), ValidateOptions{})
	if err != nil || rc.Host != "https://127.0.0.1:6552" || rc.BearerToken == "" {
		t.Fatalf("rest config: %+v, %v", rc, err)
	}
}
