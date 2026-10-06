package cluster

import (
	"strings"
	"testing"

	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
)

func kubeconfig(ctxName, server string) *clientcmdapi.Config {
	cfg := clientcmdapi.NewConfig()
	cfg.Clusters["c"] = &clientcmdapi.Cluster{Server: server}
	cfg.AuthInfos["u"] = &clientcmdapi.AuthInfo{Token: "test-token"}
	cfg.Contexts[ctxName] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
	cfg.CurrentContext = ctxName
	return cfg
}

func TestCheckLocalAccepts(t *testing.T) {
	for _, server := range []string{
		"https://127.0.0.1:6551",
		"https://localhost:6551",
		"https://[::1]:6551",
	} {
		if err := checkLocal(kubeconfig("k3d-capybara-dev-1", server)); err != nil {
			t.Errorf("%s: unexpected error: %v", server, err)
		}
	}
}

func TestCheckLocalRefuses(t *testing.T) {
	withExec := kubeconfig("k3d-capybara-dev-1", "https://127.0.0.1:6551")
	withExec.AuthInfos["u"].Exec = &clientcmdapi.ExecConfig{Command: "aws"}

	withProxy := kubeconfig("k3d-capybara-dev-1", "https://127.0.0.1:6551")
	withProxy.Clusters["c"].ProxyURL = "http://proxy:3128"

	noContext := kubeconfig("k3d-capybara-dev-1", "https://127.0.0.1:6551")
	noContext.CurrentContext = ""

	cases := map[string]struct {
		cfg  *clientcmdapi.Config
		want string
	}{
		"other context":   {kubeconfig("prod-ocp", "https://127.0.0.1:6443"), "not a local Capybara k3d context"},
		"plain k3d":       {kubeconfig("k3d-other", "https://127.0.0.1:6443"), "not a local Capybara k3d context"},
		"remote server":   {kubeconfig("k3d-capybara-dev-1", "https://api.example.com:6443"), "not loopback"},
		"wildcard server": {kubeconfig("k3d-capybara-dev-1", "https://0.0.0.0:6551"), "not loopback"},
		"exec plugin":     {withExec, "exec and auth-provider"},
		"proxy":           {withProxy, "proxy-url"},
		"no context":      {noContext, "no current context"},
	}
	for name, tc := range cases {
		err := checkLocal(tc.cfg)
		if err == nil || !strings.Contains(err.Error(), tc.want) {
			t.Errorf("%s: got %v, want error containing %q", name, err, tc.want)
		}
	}
}
