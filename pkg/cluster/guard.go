package cluster

import (
	"fmt"
	"net"
	"net/url"
	"strings"

	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

// LocalContextPrefix is the kubeconfig context prefix k3d uses for
// Capybara's clusters. Anything else is refused.
const LocalContextPrefix = "k3d-capybara-"

// checkLocal refuses any kubeconfig that is not one of the local k3d
// clusters. It is the code-level guard for "only target the local k3d
// clusters": the context must be a k3d-capybara-* context, the API server
// must be on loopback, and no exec/auth-provider plugins or proxies may run.
func checkLocal(cfg *clientcmdapi.Config) error {
	ctxName := cfg.CurrentContext
	kctx, ok := cfg.Contexts[ctxName]
	if ctxName == "" || !ok {
		return fmt.Errorf("kubeconfig has no current context")
	}
	if !strings.HasPrefix(ctxName, LocalContextPrefix) {
		return fmt.Errorf("context %q is not a local Capybara k3d context (%s*)", ctxName, LocalContextPrefix)
	}

	c, ok := cfg.Clusters[kctx.Cluster]
	if !ok {
		return fmt.Errorf("context %q references unknown cluster %q", ctxName, kctx.Cluster)
	}
	u, err := url.Parse(c.Server)
	if err != nil {
		return fmt.Errorf("context %q: bad server URL: %w", ctxName, err)
	}
	if !isLoopbackHost(u.Hostname()) {
		return fmt.Errorf("context %q: server host %q is not loopback", ctxName, u.Hostname())
	}
	if c.ProxyURL != "" {
		return fmt.Errorf("context %q: proxy-url is not allowed", ctxName)
	}

	if ai, ok := cfg.AuthInfos[kctx.AuthInfo]; ok {
		if ai.Exec != nil || ai.AuthProvider != nil {
			return fmt.Errorf("context %q: exec and auth-provider credentials are not allowed", ctxName)
		}
	}
	return nil
}

func isLoopbackHost(host string) bool {
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}
