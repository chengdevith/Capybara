package stream

import (
	"context"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	dynamicfake "k8s.io/client-go/dynamic/fake"
	"k8s.io/client-go/metadata"
	metadatafake "k8s.io/client-go/metadata/fake"
	k8stesting "k8s.io/client-go/testing"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
	"github.com/capybara/capybara/pkg/sensitive"
)

func TestSecretWatchIsMetadataOnlyAndScrubbed(t *testing.T) {
	const value = "capybara-demo-not-a-real-password"

	meta := metadatafake.NewSimpleMetadataClient(metadatafake.NewTestScheme())
	fakes := make(chan *watch.FakeWatcher, 1)
	meta.PrependWatchReactor("secrets", func(k8stesting.Action) (bool, watch.Interface, error) {
		fw := watch.NewFake()
		fakes <- fw
		return true, fw, nil
	})
	dyn := dynamicfake.NewSimpleDynamicClient(runtime.NewScheme())
	dyn.PrependReactor("*", "*", func(a k8stesting.Action) (bool, runtime.Object, error) {
		t.Errorf("dynamic client used for secrets: %v", a)
		return true, nil, nil
	})
	dyn.PrependWatchReactor("*", func(a k8stesting.Action) (bool, watch.Interface, error) {
		t.Errorf("dynamic client used for a secret watch: %v", a)
		return true, watch.NewFake(), nil
	})

	p := &clustertest.Provider{
		Infos:    []cluster.Info{{ID: "dev-1"}},
		Dynamics: map[string]dynamic.Interface{"dev-1": dyn},
		Metas:    map[string]metadata.Interface{"dev-1": meta},
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/watch", WatchHandler(p, slog.New(slog.DiscardHandler)))
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	conn, resp, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(srv.URL, "http")+"/api/clusters/dev-1/watch?version=v1&resource=secrets&namespace=demo", nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.Body != nil {
		_ = resp.Body.Close()
	}
	defer conn.CloseNow() //nolint:errcheck

	fw := <-fakes
	fw.Add(&metav1.PartialObjectMetadata{
		TypeMeta: metav1.TypeMeta{Kind: "PartialObjectMetadata", APIVersion: "meta.k8s.io/v1"},
		ObjectMeta: metav1.ObjectMeta{
			Name: "db", Namespace: "demo", UID: "u1",
			Annotations:   map[string]string{sensitive.LastAppliedAnnotation: `{"stringData":{"password":"` + value + `"}}`, "team": "a"},
			ManagedFields: []metav1.ManagedFieldsEntry{{Manager: "kubectl"}},
		},
	})

	_, msg, err := conn.Read(ctx)
	if err != nil {
		t.Fatal(err)
	}
	body := string(msg)
	for _, leak := range []string{value, `"data"`, "last-applied-configuration", "managedFields"} {
		if strings.Contains(body, leak) {
			t.Errorf("watch event contains %q: %s", leak, body)
		}
	}
	if !strings.Contains(body, `"ADDED"`) || !strings.Contains(body, `"team":"a"`) {
		t.Errorf("event = %s", body)
	}
}
