// Package resource holds aggregated views (cluster overview, project
// summary). Phase 0 only has the temporary pod list below.
package resource

import (
	"errors"
	"net/http"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

// TEMPORARY (Phase 0 only): GET /api/clusters/{id}/pods proves the server can
// reach a cluster. Remove this file and its route in Phase 1, when the
// passthrough proxy (/api/clusters/{id}/k8s/...) replaces it.

// PodSummary is one row of the temporary pod list.
type PodSummary struct {
	Namespace string    `json:"namespace"`
	Name      string    `json:"name"`
	Phase     string    `json:"phase"`
	Node      string    `json:"node,omitempty"`
	Restarts  int32     `json:"restarts"`
	Created   time.Time `json:"created"`
}

// PodsHandler serves the temporary pod list. ?namespace= narrows it.
func PodsHandler(p cluster.Provider) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		client, err := p.Client(r.PathValue("id"))
		if errors.Is(err, cluster.ErrNotFound) {
			httpjson.Error(w, http.StatusNotFound, err.Error())
			return
		}
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}

		pods, err := client.CoreV1().Pods(r.URL.Query().Get("namespace")).List(r.Context(), metav1.ListOptions{})
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}

		out := make([]PodSummary, 0, len(pods.Items))
		for _, p := range pods.Items {
			var restarts int32
			for _, cs := range p.Status.ContainerStatuses {
				restarts += cs.RestartCount
			}
			out = append(out, PodSummary{
				Namespace: p.Namespace,
				Name:      p.Name,
				Phase:     string(p.Status.Phase),
				Node:      p.Spec.NodeName,
				Restarts:  restarts,
				Created:   p.CreationTimestamp.UTC(),
			})
		}
		httpjson.Write(w, http.StatusOK, map[string]any{"items": out})
	})
}
