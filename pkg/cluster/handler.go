package cluster

import (
	"net/http"
	"time"

	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/httpjson"
)

// StatusView is a cluster's health as the controller last recorded it.
type StatusView struct {
	Phase               string     `json:"phase"`
	Reason              string     `json:"reason,omitempty"`
	Message             string     `json:"message,omitempty"`
	Version             string     `json:"version,omitempty"`
	NodeCount           *int32     `json:"nodeCount,omitempty"`
	Identity            string     `json:"identity,omitempty"`
	CredentialsExpireAt *time.Time `json:"credentialsExpireAt,omitempty"`
	LastChecked         *time.Time `json:"lastChecked,omitempty"`
	// PluginInstalls is Enabled, Disabled (no installer credential) or
	// Error (it does not work); InstallerMessage says why.
	PluginInstalls    string `json:"pluginInstalls"`
	InstallerMessage  string `json:"installerMessage,omitempty"`
	InstallerIdentity string `json:"installerIdentity,omitempty"`
}

// View is one entry of GET /api/clusters.
type View struct {
	Info
	Status StatusView `json:"status"`
}

// Lister is what ListHandler needs (the Registry).
type Lister interface {
	List() []Info
	Status(id string) (v1alpha1.ClusterStatus, bool)
}

// ToView converts a recorded status for the API.
func ToView(info Info, st v1alpha1.ClusterStatus) View {
	v := View{Info: info, Status: StatusView{
		Phase: string(st.Phase), Reason: st.Reason, Message: st.Message,
		Version: st.KubernetesVersion, NodeCount: st.NodeCount, Identity: st.Identity,
	}}
	if v.Status.Phase == "" {
		v.Status.Phase = string(v1alpha1.ClusterPending)
	}
	v.Status.PluginInstalls = "Disabled"
	if c := meta.FindStatusCondition(st.Conditions, v1alpha1.ConditionInstallerReady); c != nil {
		v.Status.InstallerMessage = c.Message
		switch {
		case c.Status == metav1.ConditionTrue:
			v.Status.PluginInstalls, v.Status.InstallerIdentity = "Enabled", st.InstallerIdentity
		case c.Reason != "NotConfigured":
			v.Status.PluginInstalls = "Error"
		}
	}
	if st.CredentialsExpireAt != nil {
		t := st.CredentialsExpireAt.Time
		v.Status.CredentialsExpireAt = &t
	}
	if st.LastChecked != nil {
		t := st.LastChecked.Time
		v.Status.LastChecked = &t
	}
	return v
}

// ListHandler serves GET /api/clusters from the registry. Health comes from
// the Cluster controller's status, so this never calls the clusters.
func ListHandler(l Lister) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		infos := l.List()
		out := make([]View, 0, len(infos))
		for _, info := range infos {
			st, _ := l.Status(info.ID)
			out = append(out, ToView(info, st))
		}
		httpjson.Write(w, http.StatusOK, out)
	})
}
