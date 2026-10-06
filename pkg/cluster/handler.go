package cluster

import (
	"context"
	"net/http"
	"sync"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/capybara/capybara/pkg/httpjson"
)

// Phase values for Status.
const (
	PhaseConnected = "Connected"
	PhaseError     = "Error"
)

// Status is a cluster's health as seen by the server.
type Status struct {
	Phase       string    `json:"phase"`
	Version     string    `json:"version,omitempty"`
	NodeCount   int       `json:"nodeCount"`
	Message     string    `json:"message,omitempty"`
	LastChecked time.Time `json:"lastChecked"`
}

// View is one entry of GET /api/clusters.
type View struct {
	Info
	Status Status `json:"status"`
}

// CheckHealth asks the cluster for its version and node count.
func CheckHealth(ctx context.Context, client kubernetes.Interface) Status {
	st := Status{Phase: PhaseError, LastChecked: time.Now().UTC()}
	v, err := client.Discovery().ServerVersion()
	if err != nil {
		st.Message = err.Error()
		return st
	}
	nodes, err := client.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		st.Message = err.Error()
		return st
	}
	st.Phase, st.Version, st.NodeCount = PhaseConnected, v.GitVersion, len(nodes.Items)
	return st
}

// ListHandler serves GET /api/clusters: every cluster with a fresh health
// check, run in parallel and bounded by timeout.
func ListHandler(p Provider, timeout time.Duration) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		infos := p.List()
		out := make([]View, len(infos))
		var wg sync.WaitGroup
		for i, info := range infos {
			wg.Add(1)
			go func() {
				defer wg.Done()
				out[i] = View{Info: info, Status: health(r.Context(), p, info.ID, timeout)}
			}()
		}
		wg.Wait()
		httpjson.Write(w, http.StatusOK, out)
	})
}

func health(ctx context.Context, p Provider, id string, timeout time.Duration) Status {
	client, err := p.Client(id)
	if err != nil {
		return Status{Phase: PhaseError, Message: err.Error(), LastChecked: time.Now().UTC()}
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	// Discovery calls don't take a context; bound them by running the whole
	// check in a goroutine and giving up on timeout.
	done := make(chan Status, 1)
	go func() { done <- CheckHealth(ctx, client) }()
	select {
	case st := <-done:
		return st
	case <-ctx.Done():
		return Status{Phase: PhaseError, Message: "health check timed out", LastChecked: time.Now().UTC()}
	}
}
