// Package resource holds aggregated views built on the server.
package resource

import (
	"errors"
	"net/http"
	"regexp"
	"sort"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

// SecretSummary is what the Secrets list may show: type and key names.
// It is built field by field (never by copying the Secret), so values and
// value-bearing metadata cannot leak into it.
type SecretSummary struct {
	Namespace       string   `json:"namespace"`
	Name            string   `json:"name"`
	UID             string   `json:"uid"`
	ResourceVersion string   `json:"resourceVersion"`
	Type            string   `json:"type"`
	Keys            []string `json:"keys"`
	// Protected: a Capybara kubeconfig Secret; even its key names are hidden.
	Protected bool `json:"protected,omitempty"`
}

var dnsName = regexp.MustCompile(`^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$`)

// SecretSummaryHandler serves GET /api/clusters/{id}/secrets/summary?namespace=.
// Values are read on the server (they come with the list) and dropped here.
func SecretSummaryHandler(clusters cluster.Provider) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ns := r.URL.Query().Get("namespace")
		if ns != "" && !dnsName.MatchString(ns) {
			httpjson.Error(w, http.StatusBadRequest, "invalid namespace")
			return
		}
		client, err := clusters.Client(r.PathValue("id"))
		if errors.Is(err, cluster.ErrNotFound) {
			httpjson.Error(w, http.StatusNotFound, err.Error())
			return
		}
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}
		list, err := client.CoreV1().Secrets(ns).List(r.Context(), metav1.ListOptions{})
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}
		out := make([]SecretSummary, 0, len(list.Items))
		for i := range list.Items {
			s := &list.Items[i]
			protected := string(s.Type) == v1alpha1.KubeconfigSecretType
			keys := make([]string, 0, len(s.Data))
			for k := range s.Data {
				if !protected {
					keys = append(keys, k)
				}
			}
			sort.Strings(keys)
			out = append(out, SecretSummary{
				Namespace: s.Namespace, Name: s.Name, UID: string(s.UID),
				ResourceVersion: s.ResourceVersion, Type: string(s.Type), Keys: keys, Protected: protected,
			})
		}
		w.Header().Set("Cache-Control", "no-store")
		httpjson.Write(w, http.StatusOK, map[string]any{"items": out})
	})
}
