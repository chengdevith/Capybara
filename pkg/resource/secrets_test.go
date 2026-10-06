package resource

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
	"github.com/capybara/capybara/pkg/sensitive"
)

const value = "capybara-demo-not-a-real-password"

func TestSecretSummaryHasTypeAndKeysButNoValues(t *testing.T) {
	secret := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: "demo", Name: "db", UID: "u1", ResourceVersion: "7",
			Annotations: map[string]string{sensitive.LastAppliedAnnotation: `{"stringData":{"password":"` + value + `"}}`},
			Labels:      map[string]string{"team": value}, // even a value hidden in a label must not leak
		},
		Type: corev1.SecretTypeOpaque,
		Data: map[string][]byte{"username": []byte("demo"), "password": []byte(value)},
	}
	p := &clustertest.Provider{
		Infos:   []cluster.Info{{ID: "dev-1"}},
		Clients: map[string]kubernetes.Interface{"dev-1": fake.NewClientset(secret)},
	}
	mux := http.NewServeMux()
	mux.Handle("GET /api/clusters/{id}/secrets/summary", SecretSummaryHandler(p))

	for _, url := range []string{"/api/clusters/dev-1/secrets/summary?namespace=demo", "/api/clusters/dev-1/secrets/summary"} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, url, nil))
		body := rec.Body.String()
		if rec.Code != http.StatusOK {
			t.Fatalf("%s: status %d: %s", url, rec.Code, body)
		}
		for _, leak := range []string{value, base64.StdEncoding.EncodeToString([]byte(value)), "ZGVtbw==", `"demo"`, "last-applied", "annotations", "data"} {
			if leak == `"demo"` {
				// the namespace is "demo"; the username value is "demo" too, so check the key/value shape instead
				if strings.Contains(body, `"username":"demo"`) {
					t.Errorf("%s: username value leaked: %s", url, body)
				}
				continue
			}
			if strings.Contains(body, leak) {
				t.Errorf("%s: response contains %q: %s", url, leak, body)
			}
		}
		var got struct{ Items []SecretSummary }
		if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
			t.Fatal(err)
		}
		s := got.Items[0]
		if s.Type != "Opaque" || strings.Join(s.Keys, ",") != "password,username" || s.UID != "u1" {
			t.Errorf("%s: summary = %+v", url, s)
		}
		if rec.Header().Get("Cache-Control") != "no-store" {
			t.Errorf("%s: missing no-store", url)
		}
	}
}

func TestSecretSummaryRejectsBadInput(t *testing.T) {
	p := &clustertest.Provider{Infos: []cluster.Info{{ID: "dev-1"}}}
	mux := http.NewServeMux()
	mux.Handle("GET /api/clusters/{id}/secrets/summary", SecretSummaryHandler(p))
	for url, want := range map[string]int{
		"/api/clusters/dev-1/secrets/summary?namespace=Bad_NS": http.StatusBadRequest,
		"/api/clusters/prod/secrets/summary":                   http.StatusNotFound,
		"/api/clusters/dev-1/secrets/summary":                  http.StatusBadGateway,
	} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, url, nil))
		if rec.Code != want {
			t.Errorf("%s: status %d, want %d", url, rec.Code, want)
		}
	}
}
