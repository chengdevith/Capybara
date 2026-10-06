package cluster

import (
	"context"
	"crypto/x509"
	"encoding/pem"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
	metricsserver "sigs.k8s.io/controller-runtime/pkg/metrics/server"

	"github.com/capybara/capybara/api/v1alpha1"
)

// kubeconfigFor turns an envtest user's REST config into kubeconfig bytes.
func kubeconfigFor(t *testing.T, rc *rest.Config, mutate func(*clientcmdapi.Config)) []byte {
	t.Helper()
	server := rc.Host
	if !strings.HasPrefix(server, "https://") {
		server = "https://" + server
	}
	cfg := clientcmdapi.NewConfig()
	cfg.Clusters["c"] = &clientcmdapi.Cluster{Server: server, CertificateAuthorityData: rc.CAData}
	cfg.AuthInfos["u"] = &clientcmdapi.AuthInfo{ClientCertificateData: rc.CertData, ClientKeyData: rc.KeyData, Token: rc.BearerToken}
	cfg.Contexts["ctx"] = &clientcmdapi.Context{Cluster: "c", AuthInfo: "u"}
	cfg.CurrentContext = "ctx"
	if mutate != nil {
		mutate(cfg)
	}
	raw, err := clientcmd.Write(*cfg)
	if err != nil {
		t.Fatal(err)
	}
	return raw
}

func certNotAfter(t *testing.T, pemData []byte) time.Time {
	t.Helper()
	b, _ := pem.Decode(pemData)
	c, err := x509.ParseCertificate(b.Bytes)
	if err != nil {
		t.Fatal(err)
	}
	return c.NotAfter
}

func TestHealthReasons(t *testing.T) {
	if os.Getenv("KUBEBUILDER_ASSETS") == "" {
		t.Skip("envtest not available (run `make test`)")
	}
	env := &envtest.Environment{CRDDirectoryPaths: []string{filepath.Join("..", "..", "deploy", "crds")}, ErrorIfCRDPathMissing: true}
	cfg, err := env.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = env.Stop() })
	admin, err := env.AddUser(envtest.User{Name: "capybara-test", Groups: []string{"system:masters"}}, nil)
	if err != nil {
		t.Fatal(err)
	}
	userCfg := admin.Config()

	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	mgmt, _ := client.New(cfg, client.Options{Scheme: scheme})
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	reg := NewRegistry(ValidateOptions{}, discard)
	notAfter := certNotAfter(t, userCfg.CertData)
	clock := notAfter.Add(-2 * 24 * time.Hour) // two days before the user cert expires
	if clock.Before(time.Now()) {
		clock = time.Now()
	}
	installers := NewInstallers(ValidateOptions{}, discard)
	h := &HealthReconciler{Client: mgmt, Registry: reg, Interval: time.Hour, Timeout: 3 * time.Second,
		ExpiryWarning: 7 * 24 * time.Hour, Now: func() time.Time { return clock }, Installers: installers}
	mgr, err := ctrl.NewManager(cfg, ctrl.Options{Scheme: scheme, Metrics: metricsserver.Options{BindAddress: "0"}})
	if err != nil {
		t.Fatal(err)
	}
	if err := h.SetupWithManager(mgr); err != nil {
		t.Fatal(err)
	}
	go func() { _ = mgr.Start(ctx) }()

	register := func(id string, raw []byte) {
		t.Helper()
		cl := testCluster(id, "")
		if id == "healthy" {
			// The same credentials double as its installer credential.
			cl.Spec.InstallerSecret = &v1alpha1.SecretRef{Name: InstallerSecretName(id)}
			inst := testSecret(t, "1", raw)
			inst.Type = v1alpha1.InstallerSecretType
			installers.Set(id, inst)
		}
		if err := mgmt.Create(ctx, cl); err != nil {
			t.Fatal(err)
		}
		var secret *corev1.Secret
		if raw != nil {
			secret = testSecret(t, "1", raw)
		}
		reg.Upsert(cl, secret)
	}
	register("healthy", kubeconfigFor(t, userCfg, nil))
	register("badtoken", kubeconfigFor(t, userCfg, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"] = &clientcmdapi.AuthInfo{Token: "not-a-valid-token"}
	}))
	register("down", kubeconfigFor(t, userCfg, func(c *clientcmdapi.Config) {
		c.Clusters["c"].Server = "https://127.0.0.1:1"
	}))
	register("nosecret", nil)

	status := func(id string) v1alpha1.ClusterStatus {
		var cl v1alpha1.Cluster
		_ = mgmt.Get(ctx, types.NamespacedName{Name: id}, &cl)
		return cl.Status
	}
	waitReason := func(id, reason string) v1alpha1.ClusterStatus {
		t.Helper()
		deadline := time.Now().Add(20 * time.Second)
		for time.Now().Before(deadline) {
			if st := status(id); st.Reason == reason {
				return st
			}
			time.Sleep(100 * time.Millisecond)
		}
		t.Fatalf("%s: reason %q (status %+v), want %s", id, status(id).Reason, status(id), reason)
		return v1alpha1.ClusterStatus{}
	}

	ok := waitReason("healthy", v1alpha1.ReasonConnected)
	if ok.Phase != v1alpha1.ClusterConnected || ok.Identity != "capybara-test" || ok.KubernetesVersion == "" || ok.NodeCount == nil {
		t.Errorf("healthy status = %+v", ok)
	}
	if c := meta.FindStatusCondition(ok.Conditions, v1alpha1.ConditionCredentialsExpiring); c == nil || c.Reason != v1alpha1.ReasonExpiresSoon {
		t.Errorf("expiry condition = %+v (cert expires %s, clock %s)", c, notAfter, clock)
	}

	if c := meta.FindStatusCondition(ok.Conditions, v1alpha1.ConditionInstallerReady); c == nil || c.Status != "True" || ok.InstallerIdentity != "capybara-test" {
		t.Errorf("installer condition = %+v (identity %q)", c, ok.InstallerIdentity)
	}

	bad := waitReason("badtoken", v1alpha1.ReasonAuthFailed)
	if c := meta.FindStatusCondition(bad.Conditions, v1alpha1.ConditionInstallerReady); c == nil || c.Reason != "NotConfigured" {
		t.Errorf("no installer: condition = %+v", c)
	}
	if c := meta.FindStatusCondition(bad.Conditions, v1alpha1.ConditionReachable); c == nil || c.Status != "True" {
		t.Errorf("auth failure must still count as reachable: %+v", c)
	}
	down := waitReason("down", v1alpha1.ReasonUnreachable)
	if down.Phase != v1alpha1.ClusterError || !strings.Contains(down.Message, "connection refused") {
		t.Errorf("down status = %+v", down)
	}
	waitReason("nosecret", v1alpha1.ReasonSecretMissing)
}
