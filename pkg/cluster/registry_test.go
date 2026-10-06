package cluster

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"strings"
	"sync"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"

	"github.com/capybara/capybara/api/v1alpha1"
)

var discard = slog.New(slog.NewTextHandler(io.Discard, nil))

func testCluster(id, displayName string) *v1alpha1.Cluster {
	return &v1alpha1.Cluster{
		ObjectMeta: metav1.ObjectMeta{Name: id},
		Spec: v1alpha1.ClusterSpec{DisplayName: displayName, Environment: v1alpha1.EnvDev,
			KubeconfigSecret: v1alpha1.SecretRef{Name: id + "-kubeconfig"}},
	}
}

func testSecret(t *testing.T, version string, raw []byte) *corev1.Secret {
	t.Helper()
	return &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "x", ResourceVersion: version},
		Type:       v1alpha1.KubeconfigSecretType,
		Data:       map[string][]byte{v1alpha1.KubeconfigKey: raw},
	}
}

type recorder struct {
	mu  sync.Mutex
	evs []Event
}

func (r *recorder) add(ev Event) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.evs = append(r.evs, ev)
}

func (r *recorder) kinds() []EventKind {
	r.mu.Lock()
	defer r.mu.Unlock()
	var out []EventKind
	for _, e := range r.evs {
		out = append(out, e.Kind)
	}
	return out
}

func TestRegistryLifecycle(t *testing.T) {
	reg := NewRegistry(ValidateOptions{}, discard)
	rec := &recorder{}
	reg.Subscribe(rec.add)

	reg.Upsert(testCluster("dev-1", "Dev 1"), testSecret(t, "1", good(t, nil)))
	c1, err := reg.Client("dev-1")
	if err != nil || c1 == nil {
		t.Fatalf("client: %v", err)
	}
	ctx1, _ := reg.Context("dev-1")

	// Display name change: same credentials, same clients, same lifetime.
	reg.Upsert(testCluster("dev-1", "Development 1"), testSecret(t, "1", good(t, nil)))
	if c, _ := reg.Client("dev-1"); c != c1 || ctx1.Err() != nil || reg.List()[0].DisplayName != "Development 1" {
		t.Fatal("an info change must not rebuild clients")
	}

	// Rotation: new Secret version rebuilds and ends the old lifetime.
	reg.Upsert(testCluster("dev-1", "Development 1"), testSecret(t, "2", good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"].Token = "rotated-token"
	})))
	if c, _ := reg.Client("dev-1"); c == c1 {
		t.Fatal("rotation must rebuild the client")
	}
	if !errors.Is(context.Cause(ctx1), ErrCredentialsChanged) {
		t.Fatalf("old context cause = %v", context.Cause(ctx1))
	}
	if rc, _ := reg.RESTConfig("dev-1"); rc.BearerToken != "rotated-token" {
		t.Fatal("rest config not rotated")
	}

	ctx2, _ := reg.Context("dev-1")
	reg.Remove("dev-1")
	if !errors.Is(context.Cause(ctx2), ErrClusterRemoved) {
		t.Fatalf("removal cause = %v", context.Cause(ctx2))
	}
	if _, err := reg.Client("dev-1"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("after removal: %v", err)
	}
	if got := rec.kinds(); strings.Join(kindsStr(got), ",") != "Added,InfoChanged,CredentialsChanged,Removed" {
		t.Fatalf("events = %v", got)
	}
}

func kindsStr(ks []EventKind) []string {
	out := make([]string, len(ks))
	for i, k := range ks {
		out[i] = string(k)
	}
	return out
}

func TestRegistryUnusableCredentials(t *testing.T) {
	reg := NewRegistry(ValidateOptions{}, discard)
	reg.Upsert(testCluster("nosecret", ""), nil)
	if _, err := reg.Client("nosecret"); err == nil || !strings.Contains(err.Error(), "not found") {
		t.Errorf("missing secret: %v", err)
	}
	if reg.List()[0].DisplayName != "nosecret" {
		t.Error("display name should default to the id")
	}

	bad := testSecret(t, "1", good(t, func(c *clientcmdapi.Config) {
		c.AuthInfos["u"].Exec = &clientcmdapi.ExecConfig{Command: "aws"}
	}))
	reg.Upsert(testCluster("bad", ""), bad)
	if err := reg.CredentialsError("bad"); err == nil || !strings.Contains(err.Error(), "exec credential plugins") {
		t.Errorf("invalid kubeconfig: %v", err)
	}

	wrongType := testSecret(t, "1", good(t, nil))
	wrongType.Type = corev1.SecretTypeOpaque
	reg.Upsert(testCluster("opaque", ""), wrongType)
	if err := reg.CredentialsError("opaque"); err == nil || !strings.Contains(err.Error(), "type") {
		t.Errorf("wrong secret type: %v", err)
	}
}
