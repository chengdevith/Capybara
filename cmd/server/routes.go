package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
	"github.com/capybara/capybara/pkg/httpjson"
	"github.com/capybara/capybara/pkg/proxy"
	"github.com/capybara/capybara/pkg/stream"
)

// newHandler wires every route. All /api routes pass through the auth
// middleware so handlers can read the user from the request context.
func newHandler(cfg config.Config, clusters cluster.Provider, logger *slog.Logger) http.Handler {
	api := http.NewServeMux()
	api.Handle("GET /api/clusters", cluster.ListHandler(clusters, cfg.ClusterTimeout))
	// Any method is routed so the proxy can answer non-GET with 405 itself.
	api.Handle("/api/clusters/{id}/k8s/{path...}", proxy.Handler(clusters, logger))
	api.Handle("GET /api/clusters/{id}/watch", stream.WatchHandler(clusters, logger))
	api.HandleFunc("/api/", func(w http.ResponseWriter, _ *http.Request) {
		httpjson.Error(w, http.StatusNotFound, "not found")
	})

	root := http.NewServeMux()
	root.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpjson.Write(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	root.Handle("/api/", auth.Middleware(api))

	return logRequests(logger, root)
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// Unwrap lets http.ResponseController reach the underlying writer
// (needed later for websocket hijacking and flushing).
func (s *statusRecorder) Unwrap() http.ResponseWriter { return s.ResponseWriter }

// logRequests logs method, path, status and duration. Never headers or bodies.
func logRequests(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		logger.Debug("request", "method", r.Method, "path", r.URL.Path, "status", rec.status, "duration", time.Since(start))
	})
}
