package cluster

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/version"
	fakediscovery "k8s.io/client-go/discovery/fake"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
)

// FakeProvider is a Provider backed by fixed clients, for handler tests.
type FakeProvider struct {
	Infos   []Info
	Clients map[string]kubernetes.Interface
}

func (f FakeProvider) List() []Info { return f.Infos }

func (f FakeProvider) Client(id string) (kubernetes.Interface, error) {
	if c, ok := f.Clients[id]; ok {
		return c, nil
	}
	return nil, errors.New("unavailable")
}

func TestListHandler(t *testing.T) {
	healthy := fake.NewClientset(&corev1.Node{ObjectMeta: metav1.ObjectMeta{Name: "n1"}})
	healthy.Discovery().(*fakediscovery.FakeDiscovery).FakedServerVersion = &version.Info{GitVersion: "v1.35.5+k3s1"}

	p := FakeProvider{
		Infos:   []Info{{ID: "dev-1", DisplayName: "Dev 1"}, {ID: "dev-2", DisplayName: "Dev 2"}},
		Clients: map[string]kubernetes.Interface{"dev-1": healthy},
	}

	rec := httptest.NewRecorder()
	ListHandler(p, time.Second).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/clusters", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var got []View
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 {
		t.Fatalf("got %d clusters, want 2", len(got))
	}
	if s := got[0].Status; s.Phase != PhaseConnected || s.Version != "v1.35.5+k3s1" || s.NodeCount != 1 {
		t.Errorf("dev-1 status = %+v", s)
	}
	if s := got[1].Status; s.Phase != PhaseError || s.Message == "" {
		t.Errorf("dev-2 status = %+v, want Error with message", s)
	}
}
