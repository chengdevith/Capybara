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
	"github.com/capybara/capybara/pkg/sensitive"
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
		watchFn, err := watcherFor(clusters, id, req)
		if !clusterOK(w, err) {
			return
		}
		var filter func(runtime.Object) bool
		if sensitive.IsSecrets(req.gvr) {
			filter = scrubSecretEvent
		}
		log := logger.With("cluster", id, "gvr", req.gvr.String(), "namespace", req.namespace)
		lifetime, _ := clusters.Context(id)
		ServeWatch(w, r, log, lifetime, func(ctx context.Context) (watch.Interface, error) {
			return watchFn(ctx, metav1.ListOptions{
				ResourceVersion:     req.resourceVersion,
				LabelSelector:       req.labels,
				FieldSelector:       req.fields,
				AllowWatchBookmarks: true,
			})
		}, filter)
	})
}

// ServeWatch upgrades to a websocket and streams one watch with the
// protocol described on Event. The watch stops when the browser leaves.
// filter, if set, may scrub an event in place; returning false refuses to
// send it and closes the socket (policy violation).
//
// lifetime (optional) is the cluster's: when it ends (credentials changed,
// cluster removed) the socket closes with that reason.
func ServeWatch(w http.ResponseWriter, r *http.Request, log *slog.Logger, lifetime context.Context,
	start func(context.Context) (watch.Interface, error), filter func(runtime.Object) bool) {
	// Errors before this point are plain HTTP; after it, websocket messages.
	conn, err := websocket.Accept(w, r, nil) // same-origin only (default)
	if err != nil {
		return // Accept already wrote the response
	}
	defer conn.CloseNow() //nolint:errcheck // best effort on exit

	// We never read client messages; CloseRead handles pongs/close and
	// cancels ctx when the browser goes away, which stops the watch.
	ctx, stop := bindLifetime(conn.CloseRead(r.Context()), lifetime)
	defer stop()

	wi, err := start(ctx)
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
			if !lifetimeEnded(ctx, lifetime, conn) {
				log.Debug("watch client gone")
			}
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
			if filter != nil && !filter(ev.Object) {
				log.Error("refusing to stream an event that failed the filter")
				_ = conn.Close(websocket.StatusPolicyViolation, "event refused")
				return
			}
			if err := writeJSON(ctx, conn, Event{Type: string(ev.Type), Object: ev.Object}); err != nil {
				return
			}
		}
	}
}

type watchFunc func(context.Context, metav1.ListOptions) (watch.Interface, error)

// watcherFor picks the client for a watch. Secrets are always watched
// through the metadata client, so their values are never even fetched.
func watcherFor(clusters cluster.Provider, id string, req watchRequest) (watchFunc, error) {
	if sensitive.IsSecrets(req.gvr) {
		mc, err := clusters.Metadata(id)
		if err != nil {
			return nil, err
		}
		if req.namespace != "" {
			return mc.Resource(req.gvr).Namespace(req.namespace).Watch, nil
		}
		return mc.Resource(req.gvr).Watch, nil
	}
	dyn, err := clusters.Dynamic(id)
	if err != nil {
		return nil, err
	}
	if req.namespace != "" {
		return dyn.Resource(req.gvr).Namespace(req.namespace).Watch, nil
	}
	return dyn.Resource(req.gvr).Watch, nil
}

// scrubSecretEvent strips value-bearing metadata from a Secret watch event.
// It returns false for anything that is not metadata (never sent).
func scrubSecretEvent(obj runtime.Object) bool {
	switch o := obj.(type) {
	case *metav1.PartialObjectMetadata:
		sensitive.ScrubMeta(&o.ObjectMeta)
		return true
	default:
		return false
	}
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
