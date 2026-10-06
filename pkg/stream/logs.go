package stream

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/coder/websocket"
	corev1 "k8s.io/api/core/v1"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

const (
	defaultTailLines = 500
	maxTailLines     = 10000
	logChunkSize     = 32 * 1024
)

// LogMessage is one message on the logs websocket.
//
//	log:   Data is a chunk of log output (may end mid-line).
//	end:   the stream finished (container exited or previous=true).
//	error: Message says why the stream could not start or broke.
type LogMessage struct {
	Type    string `json:"type"`
	Data    string `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
}

type logsRequest struct {
	namespace, pod string
	opts           corev1.PodLogOptions
}

func parseLogs(r *http.Request) (logsRequest, string) {
	q := r.URL.Query()
	req := logsRequest{namespace: q.Get("namespace"), pod: q.Get("pod")}
	if !dnsName.MatchString(req.namespace) || !dnsName.MatchString(req.pod) {
		return req, "namespace and pod are required"
	}
	if c := q.Get("container"); c != "" {
		if !dnsName.MatchString(c) {
			return req, "invalid container"
		}
		req.opts.Container = c
	}
	tail := int64(defaultTailLines)
	if v := q.Get("tailLines"); v != "" {
		n, err := strconv.ParseInt(v, 10, 64)
		if err != nil || n < 0 || n > maxTailLines {
			return req, "tailLines must be 0-" + strconv.Itoa(maxTailLines)
		}
		tail = n
	}
	req.opts.TailLines = &tail
	req.opts.Previous = q.Get("previous") == "true"
	req.opts.Timestamps = q.Get("timestamps") == "true"
	req.opts.Follow = !req.opts.Previous
	return req, ""
}

// LogsHandler serves WS /api/clusters/{id}/logs.
//
// Query: namespace, pod, container (optional for single-container pods),
// tailLines (default 500), previous, timestamps. Follows unless previous.
func LogsHandler(clusters cluster.Provider, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		req, problem := parseLogs(r)
		if problem != "" {
			httpjson.Error(w, http.StatusBadRequest, problem)
			return
		}
		id := r.PathValue("id")
		client, err := clusters.Client(id)
		if !clusterOK(w, err) {
			return
		}

		conn, err := websocket.Accept(w, r, nil)
		if err != nil {
			return
		}
		defer conn.CloseNow() //nolint:errcheck // best effort on exit
		lifetime, _ := clusters.Context(id)
		ctx, stop := bindLifetime(conn.CloseRead(r.Context()), lifetime)
		defer stop()
		log := logger.With("cluster", id, "namespace", req.namespace, "pod", req.pod, "container", req.opts.Container)

		// The stream is bound to ctx: when the browser disconnects, the
		// request to the kubelet is cancelled and Read below returns.
		rc, err := client.CoreV1().Pods(req.namespace).GetLogs(req.pod, &req.opts).Stream(ctx)
		if err != nil {
			_ = writeJSON(ctx, conn, LogMessage{Type: "error", Message: err.Error()})
			_ = conn.Close(websocket.StatusNormalClosure, "logs unavailable")
			return
		}
		defer rc.Close() //nolint:errcheck // read side
		log.Debug("logs started")

		go keepAlive(ctx, conn)

		buf := make([]byte, logChunkSize)
		for {
			n, err := rc.Read(buf)
			if n > 0 {
				if werr := writeJSON(ctx, conn, LogMessage{Type: "log", Data: string(buf[:n])}); werr != nil {
					return
				}
			}
			switch {
			case err == nil:
				continue
			case lifetimeEnded(ctx, lifetime, conn):
				return
			case ctx.Err() != nil:
				log.Debug("logs client gone")
				return
			case errors.Is(err, io.EOF):
				_ = writeJSON(ctx, conn, LogMessage{Type: "end"})
				_ = conn.Close(websocket.StatusNormalClosure, "logs ended")
				return
			default:
				_ = writeJSON(ctx, conn, LogMessage{Type: "error", Message: err.Error()})
				_ = conn.Close(websocket.StatusNormalClosure, "logs failed")
				return
			}
		}
	})
}

// keepAlive pings until ctx ends so idle streams survive proxies.
func keepAlive(ctx context.Context, conn *websocket.Conn) {
	t := time.NewTicker(pingInterval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			if pingWithTimeout(ctx, conn) != nil {
				return
			}
		}
	}
}
