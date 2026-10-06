package proxy

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"k8s.io/client-go/rest"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
	"github.com/capybara/capybara/pkg/sensitive"
)

const value = "capybara-demo-not-a-real-password"

// lastApplied is what `kubectl apply` leaves on a Secret: the full object.
const lastApplied = `"kubectl.kubernetes.io/last-applied-configuration":"{\"stringData\":{\"password\":\"` + value + `\"}}"`

// secretUpstream answers like a kube-apiserver. If honest, it respects the
// metadata Accept header; otherwise it returns full Secrets regardless.
func secretUpstream(t *testing.T, honest bool) (*httptest.Server, *string) {
	t.Helper()
	accept := new(string)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		*accept = r.Header.Get("Accept")
		w.Header().Set("Content-Type", "application/json")
		single := !strings.HasSuffix(r.URL.Path, "/secrets")
		meta := `{"name":"db","namespace":"demo","uid":"u1","annotations":{` + lastApplied + `,"team":"a"},"managedFields":[{"manager":"kubectl"}]}`
		switch {
		case !honest:
			_, _ = io.WriteString(w, `{"kind":"SecretList","items":[{"metadata":`+meta+`,"data":{"password":"c2VjcmV0"}}]}`)
		case single:
			_, _ = io.WriteString(w, `{"kind":"PartialObjectMetadata","apiVersion":"meta.k8s.io/v1","metadata":`+meta+`}`)
		default:
			_, _ = io.WriteString(w, `{"kind":"PartialObjectMetadataList","apiVersion":"meta.k8s.io/v1","metadata":{"resourceVersion":"9"},"items":[{"metadata":`+meta+`}]}`)
		}
	}))
	t.Cleanup(srv.Close)
	return srv, accept
}

func serveSecrets(t *testing.T, srv *httptest.Server, path string) *httptest.ResponseRecorder {
	t.Helper()
	p := &clustertest.Provider{
		Infos:   []cluster.Info{{ID: "dev-1"}},
		Configs: map[string]*rest.Config{"dev-1": {Host: srv.URL}},
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/k8s/{path...}", Handler(p, slog.New(slog.DiscardHandler)))
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	req.Header.Set("Accept", "application/json") // the browser asks for full objects
	mux.ServeHTTP(rec, req)
	return rec
}

func TestSecretsAreMetadataOnlyAndScrubbed(t *testing.T) {
	srv, accept := secretUpstream(t, true)
	for path, wantAccept := range map[string]string{
		"/api/clusters/dev-1/k8s/api/v1/namespaces/demo/secrets":    sensitive.AcceptMetadataList,
		"/api/clusters/dev-1/k8s/api/v1/secrets":                    sensitive.AcceptMetadataList,
		"/api/clusters/dev-1/k8s/api/v1/namespaces/demo/secrets/db": sensitive.AcceptMetadata,
	} {
		rec := serveSecrets(t, srv, path)
		body := rec.Body.String()
		if rec.Code != http.StatusOK {
			t.Fatalf("%s: status %d: %s", path, rec.Code, body)
		}
		if *accept != wantAccept {
			t.Errorf("%s: upstream Accept = %q, want %q", path, *accept, wantAccept)
		}
		for _, leak := range []string{value, `"data"`, "last-applied-configuration", "managedFields"} {
			if strings.Contains(body, leak) {
				t.Errorf("%s: response contains %q: %s", path, leak, body)
			}
		}
		if !strings.Contains(body, `"team":"a"`) {
			t.Errorf("%s: ordinary annotations should survive: %s", path, body)
		}
	}
}

func TestSecretsRefusedIfClusterIgnoresMetadataAccept(t *testing.T) {
	srv, _ := secretUpstream(t, false)
	rec := serveSecrets(t, srv, "/api/clusters/dev-1/k8s/api/v1/namespaces/demo/secrets")
	if rec.Code != http.StatusBadGateway || strings.Contains(rec.Body.String(), "c2VjcmV0") {
		t.Fatalf("status %d body %s", rec.Code, rec.Body)
	}
}

func TestSecretSubresourcesRefused(t *testing.T) {
	srv, _ := secretUpstream(t, true)
	if rec := serveSecrets(t, srv, "/api/clusters/dev-1/k8s/api/v1/namespaces/demo/secrets/db/anything"); rec.Code != http.StatusForbidden {
		t.Fatalf("status %d", rec.Code)
	}
}
