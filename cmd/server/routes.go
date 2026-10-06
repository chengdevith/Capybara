package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/capybara/capybara/pkg/action"
	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
	"github.com/capybara/capybara/pkg/httpjson"
	"github.com/capybara/capybara/pkg/plugin"
	"github.com/capybara/capybara/pkg/project"
	"github.com/capybara/capybara/pkg/proxy"
	"github.com/capybara/capybara/pkg/resource"
	"github.com/capybara/capybara/pkg/stream"
)

type deps struct {
	cfg        config.Config
	clusters   cluster.Provider
	clusterAPI *cluster.API
	plugins    *plugin.API
	backends   *plugin.BackendProxy
	scoped     *plugin.ScopedProxy
	auditor    *audit.Auditor
	auditLog   audit.Reader
	projects   *project.API
	sizes      *project.ConfigSource
	logger     *slog.Logger
}

// newHandler wires every route. All /api routes pass through the auth
// middleware so handlers can read the user from the request context.
func newHandler(d deps) http.Handler {
	cfg, clusters, logger := d.cfg, d.clusters, d.logger
	api := http.NewServeMux()
	api.Handle("GET /api/audit", audit.ListHandler(d.auditLog))
	d.projects.Register(api)
	(&action.Handlers{Clusters: clusters, Auditor: d.auditor, Protected: cfg.Protected(), Logger: logger}).Register(api)
	d.clusterAPI.Register(api)
	d.plugins.Register(api)
	d.backends.Register(api)
	// Any method is routed so the proxy can answer non-GET with 405 itself.
	api.Handle("/api/clusters/{id}/k8s/{path...}", proxy.Handler(clusters, logger))
	api.Handle("GET /api/clusters/{id}/watch", stream.WatchHandler(clusters, logger))
	api.Handle("GET /api/clusters/{id}/logs", stream.LogsHandler(clusters, logger))
	api.Handle("GET /api/clusters/{id}/secrets/summary", resource.SecretSummaryHandler(clusters))
	api.Handle("GET /api/clusters/{id}/exec", &stream.ExecHandler{
		Clusters: clusters, Auditor: d.auditor, Logger: logger,
		IdleTimeout: cfg.ExecIdleTimeout, MaxDuration: cfg.ExecMaxDuration,
	})
	api.HandleFunc("/api/", func(w http.ResponseWriter, _ *http.Request) {
		httpjson.Error(w, http.StatusNotFound, "not found")
	})

	root := http.NewServeMux()
	root.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		// The server is up either way; "audit" tells the UI whether write
		// actions are currently possible.
		auditState := "ok"
		if err := d.auditor.Healthy(); err != nil {
			auditState = "failing: " + err.Error()
		}
		// "projectConfig" says where the size presets come from, or what is
		// wrong with the ConfigMap (the last good presets stay in use).
		sizes := "ok"
		switch st := d.sizes.Status(); {
		case st.Problem != "":
			sizes = st.Problem
		case st.Builtin:
			sizes = "using built-in size defaults"
		}
		httpjson.Write(w, http.StatusOK, map[string]string{"status": "ok", "audit": auditState, "projectConfig": sizes})
	})
	root.Handle("/api/", auth.Middleware(api))
	// Plugin backends reach their declared services here with the
	// credential Capybara issued them; no user identity applies.
	d.scoped.Register(root)

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
