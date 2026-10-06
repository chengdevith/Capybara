package resource

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"

	"github.com/capybara/capybara/pkg/cluster"
)

type fakeProvider map[string]kubernetes.Interface

func (f fakeProvider) List() []cluster.Info { return nil }

func (f fakeProvider) Client(id string) (kubernetes.Interface, error) {
	if c, ok := f[id]; ok {
		return c, nil
	}
	return nil, cluster.ErrNotFound
}

func pod(ns, name string, restarts int32) *corev1.Pod {
	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{Namespace: ns, Name: name},
		Status: corev1.PodStatus{
			Phase:             corev1.PodRunning,
			ContainerStatuses: []corev1.ContainerStatus{{RestartCount: restarts}},
		},
	}
}

func serve(t *testing.T, p cluster.Provider, url string) *httptest.ResponseRecorder {
	t.Helper()
	mux := http.NewServeMux()
	mux.Handle("GET /api/clusters/{id}/pods", PodsHandler(p))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, url, nil))
	return rec
}

func TestPodsHandler(t *testing.T) {
	p := fakeProvider{
		"dev-1": fake.NewClientset(pod("default", "web", 2), pod("kube-system", "dns", 0)),
		"dev-2": fake.NewClientset(pod("default", "other", 0)),
	}

	rec := serve(t, p, "/api/clusters/dev-1/pods?namespace=default")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d: %s", rec.Code, rec.Body)
	}
	var body struct{ Items []PodSummary }
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body.Items) != 1 || body.Items[0].Name != "web" || body.Items[0].Restarts != 2 {
		t.Fatalf("items = %+v, want only dev-1/default/web", body.Items)
	}

	if rec := serve(t, p, "/api/clusters/dev-1/pods"); rec.Code != http.StatusOK || !json.Valid(rec.Body.Bytes()) {
		t.Fatalf("all namespaces: status %d", rec.Code)
	}
	if rec := serve(t, p, "/api/clusters/nope/pods"); rec.Code != http.StatusNotFound {
		t.Fatalf("unknown cluster: status = %d, want 404", rec.Code)
	}
}
