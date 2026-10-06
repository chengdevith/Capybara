// Package stream is the websocket hub: live watches and log streams (exec
// comes in Phase 2). Each websocket owns exactly one upstream stream, which
// is cancelled as soon as the browser disconnects.
package stream

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"regexp"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

const (
	pingInterval = 30 * time.Second
	writeTimeout = 10 * time.Second
)

// Event is one message on the watch websocket.
//
//	ADDED | MODIFIED | DELETED | BOOKMARK: Object is the Kubernetes object.
//	ERROR: Status explains why the watch stopped (410 = re-list needed).
//
// When the upstream watch ends normally the socket closes with
// StatusNormalClosure; clients resume from the last resourceVersion.
type Event struct {
	Type   string         `json:"type"`
	Object runtime.Object `json:"object,omitempty"`
	Status *metav1.Status `json:"status,omitempty"`
}

var (
	dnsName = regexp.MustCompile(`^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$`)
	version = regexp.MustCompile(`^v[0-9]+((alpha|beta)[0-9]+)?$`)
)

// watchRequest is parsed from the query string.
type watchRequest struct {
	gvr                                        schema.GroupVersionResource
	namespace, resourceVersion, labels, fields string
}

func parseWatch(r *http.Request) (watchRequest, string) {
	q := r.URL.Query()
	req := watchRequest{
		gvr:             schema.GroupVersionResource{Group: q.Get("group"), Version: q.Get("version"), Resource: q.Get("resource")},
		namespace:       q.Get("namespace"),
		resourceVersion: q.Get("resourceVersion"),
		labels:          q.Get("labelSelector"),
		fields:          q.Get("fieldSelector"),
	}
	switch {
	case !dnsName.MatchString(req.gvr.Resource):
		return req, "resource is required (plural, e.g. pods)"
	case !version.MatchString(req.gvr.Version):
		return req, "version is required (e.g. v1)"
	case req.gvr.Group != "" && !dnsName.MatchString(req.gvr.Group):
		return req, "invalid group"
	case req.namespace != "" && !dnsName.MatchString(req.namespace):
		return req, "invalid namespace"
	}
	return req, ""
}

// WatchHandler serves WS /api/clusters/{id}/watch.
//
// Query: group, version, resource (plural), namespace (empty = all),
// resourceVersion (from the list), labelSelector, fieldSelector.
func WatchHandler(clusters cluster.Provider, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		req, problem := parseWatch(r)
		if problem != "" {
			httpjson.Error(w, http.StatusBadRequest, problem)
			return
		}
		id := r.PathValue("id")
		dyn, err := clusters.Dynamic(id)
		if !clusterOK(w, err) {
			return
		}

		// Errors before this point are plain HTTP; after it, websocket messages.
		conn, err := websocket.Accept(w, r, nil) // same-origin only (default)
		if err != nil {
			return // Accept already wrote the response
		}
		defer conn.CloseNow() //nolint:errcheck // best effort on exit

		// We never read client messages; CloseRead handles pongs/close and
		// cancels ctx when the browser goes away, which stops the watch.
		ctx := conn.CloseRead(r.Context())
		log := logger.With("cluster", id, "gvr", req.gvr.String(), "namespace", req.namespace)

		res := dyn.Resource(req.gvr)
		var ri interface {
			Watch(context.Context, metav1.ListOptions) (watch.Interface, error)
		} = res
		if req.namespace != "" {
			ri = res.Namespace(req.namespace)
		}
		wi, err := ri.Watch(ctx, metav1.ListOptions{
			ResourceVersion:     req.resourceVersion,
			LabelSelector:       req.labels,
			FieldSelector:       req.fields,
			AllowWatchBookmarks: true,
		})
		if err != nil {
			sendStatusAndClose(ctx, conn, statusOf(err), log)
			return
		}
		defer wi.Stop()
		log.Debug("watch started")

		ping := time.NewTicker(pingInterval)
		defer ping.Stop()
		for {
			select {
			case <-ctx.Done():
				log.Debug("watch client gone")
				return
			case <-ping.C:
				if err := pingWithTimeout(ctx, conn); err != nil {
					return
				}
			case ev, ok := <-wi.ResultChan():
				if !ok {
					_ = conn.Close(websocket.StatusNormalClosure, "watch ended")
					return
				}
				if ev.Type == watch.Error {
					sendStatusAndClose(ctx, conn, statusFromObject(ev.Object), log)
					return
				}
				if err := writeJSON(ctx, conn, Event{Type: string(ev.Type), Object: ev.Object}); err != nil {
					return
				}
			}
		}
	})
}

// clusterOK writes the HTTP error for a failed cluster lookup.
func clusterOK(w http.ResponseWriter, err error) bool {
	switch {
	case err == nil:
		return true
	case errors.Is(err, cluster.ErrNotFound):
		httpjson.Error(w, http.StatusNotFound, err.Error())
	default:
		httpjson.Error(w, http.StatusBadGateway, err.Error())
	}
	return false
}

func statusOf(err error) *metav1.Status {
	var se apierrors.APIStatus
	if errors.As(err, &se) {
		st := se.Status()
		return &st
	}
	return &metav1.Status{Status: metav1.StatusFailure, Code: http.StatusBadGateway, Message: err.Error()}
}

func statusFromObject(obj runtime.Object) *metav1.Status {
	return statusOf(apierrors.FromObject(obj))
}

func sendStatusAndClose(ctx context.Context, conn *websocket.Conn, st *metav1.Status, log *slog.Logger) {
	log.Debug("watch error", "code", st.Code, "reason", st.Reason)
	if err := writeJSON(ctx, conn, Event{Type: string(watch.Error), Status: st}); err != nil {
		return
	}
	_ = conn.Close(websocket.StatusNormalClosure, "watch error")
}

func writeJSON(ctx context.Context, conn *websocket.Conn, v any) error {
	ctx, cancel := context.WithTimeout(ctx, writeTimeout)
	defer cancel()
	return wsjson.Write(ctx, conn, v)
}

func pingWithTimeout(ctx context.Context, conn *websocket.Conn) error {
	ctx, cancel := context.WithTimeout(ctx, writeTimeout)
	defer cancel()
	return conn.Ping(ctx)
}
