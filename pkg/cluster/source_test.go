package cluster

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/envtest"

	"github.com/capybara/capybara/api/v1alpha1"
)

func TestSyncFollowsClustersAndSecrets(t *testing.T) {
	if os.Getenv("KUBEBUILDER_ASSETS") == "" {
		t.Skip("envtest not available (run `make test`)")
	}
	env := &envtest.Environment{CRDDirectoryPaths: []string{filepath.Join("..", "..", "deploy", "crds")}, ErrorIfCRDPathMissing: true}
	cfg, err := env.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = env.Stop() })

	scheme := runtime.NewScheme()
	_ = clientgoscheme.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)
	k, err := client.New(cfg, client.Options{Scheme: scheme})
	if err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	_ = k.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.SystemNamespace}})

	c, err := cache.New(cfg, cache.Options{Scheme: scheme, ByObject: CacheOptions()})
	if err != nil {
		t.Fatal(err)
	}
	go func() { _ = c.Start(ctx) }()
	reg := NewRegistry(ValidateOptions{}, discard)
	events := make(chan Event, 16)
	reg.Subscribe(func(e Event) { events <- e })
	if err := Sync(ctx, c, reg, discard); err != nil {
		t.Fatal(err)
	}

	wait := func(want EventKind) {
		t.Helper()
		select {
		case e := <-events:
			if e.Kind != want || e.ID != "dev-9" {
				t.Fatalf("event %+v, want %s dev-9", e, want)
			}
		case <-time.After(10 * time.Second):
			t.Fatalf("no %s event", want)
		}
	}

	secret := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "dev-9-kubeconfig"},
		Type:       v1alpha1.KubeconfigSecretType,
		Data:       map[string][]byte{v1alpha1.KubeconfigKey: good(t, nil)},
	}
	if err := k.Create(ctx, secret); err != nil {
		t.Fatal(err)
	}
	// An unrelated Opaque Secret in the same namespace is not even cached.
	_ = k.Create(ctx, &corev1.Secret{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "other"}, StringData: map[string]string{"k": "v"}})

	if err := k.Create(ctx, testCluster("dev-9", "Dev 9")); err != nil {
		t.Fatal(err)
	}
	wait(Added)
	if _, err := reg.Client("dev-9"); err != nil {
		t.Fatalf("client: %v", err)
	}
	lifetime, _ := reg.Context("dev-9")

	secret.Data[v1alpha1.KubeconfigKey] = good(t, func(c *clientcmdapi.Config) { c.AuthInfos["u"].Token = "rotated" })
	if err := k.Update(ctx, secret); err != nil {
		t.Fatal(err)
	}
	wait(CredentialsChanged)
	if !errors.Is(context.Cause(lifetime), ErrCredentialsChanged) {
		t.Fatal("old lifetime not ended on rotation")
	}

	if err := k.Delete(ctx, testCluster("dev-9", "")); err != nil {
		t.Fatal(err)
	}
	wait(Removed)
	var cached corev1.SecretList
	_ = c.List(ctx, &cached)
	for _, s := range cached.Items {
		if s.Type != v1alpha1.KubeconfigSecretType {
			t.Errorf("the cache holds a Secret it should not: %s (%s)", s.Name, s.Type)
		}
	}
}
