// Command monitoring is the Monitoring plugin's backend. It runs as its own
// process (never inside Capybara) and is reached only through Capybara's
// proxy at /api/plugins/monitoring/... It reaches Prometheus (and Grafana)
// only through Capybara's scoped endpoint, with the credential Capybara
// issued it; Capybara decides which clusters and paths that allows.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

func main() {
	addr := flag.String("addr", envOr("MONITORING_ADDR", "127.0.0.1:8091"), "listen address (loopback)")
	capybara := flag.String("capybara", envOr("CAPYBARA_URL", "http://127.0.0.1:8080"), "Capybara API server")
	tokenFile := flag.String("token-file", envOr("CAPYBARA_TOKEN_FILE", ".local/plugin-backends/monitoring.token"), "credential issued by Capybara")
	flag.Parse()
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil)).With("component", "monitoring-backend")
	if host, _, err := net.SplitHostPort(*addr); err != nil || (host != "127.0.0.1" && host != "localhost" && host != "::1") {
		logger.Error("listen address must be loopback", "addr", *addr)
		os.Exit(1)
	}
	b := &Backend{Capybara: strings.TrimRight(*capybara, "/"), TokenFile: *tokenFile, Logger: logger, Client: &http.Client{Timeout: 30 * time.Second}}
	srv := &http.Server{Addr: *addr, Handler: b.Handler(), ReadHeaderTimeout: 10 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		_ = srv.Shutdown(context.Background())
	}()
	logger.Info("listening", "addr", *addr, "capybara", b.Capybara)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("server", "err", err)
		os.Exit(1)
	}
}

func envOr(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

// Backend answers the Monitoring UI.
type Backend struct {
	Capybara  string
	TokenFile string
	Logger    *slog.Logger
	Client    *http.Client
	Now       func() time.Time

	mu    sync.Mutex
	token string
	cache map[string]cached
}

type cached struct {
	body    []byte
	expires time.Time
}

var clusterRE = regexp.MustCompile(`^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$`)

// Handler routes the backend's API (paths as Capybara forwards them).
func (b *Backend) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /clusters/{cluster}/status", b.status)
	mux.HandleFunc("GET /clusters/{cluster}/overview", b.overview)
	mux.HandleFunc("GET /clusters/{cluster}/metrics/{kind}", b.metrics)
	mux.HandleFunc("GET /clusters/{cluster}/namespaces/{namespace}/usage", b.usage)
	mux.HandleFunc("GET /clusters/{cluster}/alerts", b.alerts)
	mux.HandleFunc("/grafana/{cluster}/{rest...}", b.grafana)
	return mux
}

func (b *Backend) now() time.Time {
	if b.Now != nil {
		return b.Now()
	}
	return time.Now()
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, err error) {
	var ue *upstreamError
	if errors.As(err, &ue) {
		writeJSON(w, ue.status, map[string]string{"error": ue.msg})
		return
	}
	writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
}

type upstreamError struct {
	status int
	msg    string
}

func (e *upstreamError) Error() string { return e.msg }

func (b *Backend) readToken(force bool) (string, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.token != "" && !force {
		return b.token, nil
	}
	raw, err := os.ReadFile(b.TokenFile)
	if err != nil {
		return "", fmt.Errorf("credential from Capybara: %w", err)
	}
	b.token = strings.TrimSpace(string(raw))
	return b.token, nil
}

func (b *Backend) scopedURL(cluster, service, path string) string {
	return b.Capybara + "/internal/plugins/monitoring/clusters/" + cluster + "/services/" + service + path
}

// prom GETs a Prometheus API path through Capybara (cached for ttl). On a
// 401 the credential is re-read once (Capybara rotates it on restart).
func (b *Backend) prom(ctx context.Context, cluster, path string, q url.Values, ttl time.Duration) ([]byte, error) {
	u := b.scopedURL(cluster, "prometheus", path) + "?" + q.Encode()
	if body, ok := b.cached(u); ok {
		return body, nil
	}
	for attempt := 0; attempt < 2; attempt++ {
		tok, err := b.readToken(attempt > 0)
		if err != nil {
			return nil, err
		}
		// u is the configured Capybara address plus a validated cluster id
		// and a fixed Prometheus API path.
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, u, nil) //nolint:gosec // see above
		req.Header.Set("Authorization", "Bearer "+tok)
		resp, err := b.Client.Do(req) //nolint:gosec // see above
		if err != nil {
			return nil, &upstreamError{http.StatusBadGateway, "Capybara is not reachable"}
		}
		body, err := io.ReadAll(io.LimitReader(resp.Body, 8<<20))
		_ = resp.Body.Close()
		if err != nil {
			return nil, err
		}
		if resp.StatusCode == http.StatusUnauthorized && attempt == 0 {
			continue
		}
		if resp.StatusCode != http.StatusOK {
			msg := strings.TrimSpace(string(body))
			var e struct {
				Error string `json:"error"`
			}
			if json.Unmarshal(body, &e) == nil && e.Error != "" {
				msg = e.Error
			}
			return nil, &upstreamError{resp.StatusCode, msg}
		}
		b.store(u, body, ttl)
		return body, nil
	}
	return nil, &upstreamError{http.StatusUnauthorized, "Capybara refused this backend's credential"}
}

func (b *Backend) cached(key string) ([]byte, bool) {
	b.mu.Lock()
	defer b.mu.Unlock()
	c, ok := b.cache[key]
	if !ok || b.now().After(c.expires) {
		return nil, false
	}
	return c.body, true
}

func (b *Backend) store(key string, body []byte, ttl time.Duration) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.cache == nil || len(b.cache) > 500 {
		b.cache = map[string]cached{}
	}
	b.cache[key] = cached{body: body, expires: b.now().Add(ttl)}
}

type promResponse struct {
	Status string `json:"status"`
	Error  string `json:"error"`
	Data   struct {
		Result []struct {
			Metric map[string]string `json:"metric"`
			Value  []any             `json:"value"`
			Values [][]any           `json:"values"`
		} `json:"result"`
	} `json:"data"`
}

func num(v any) float64 {
	s, _ := v.(string)
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

// instant runs one instant query and returns its first value (0 if none).
func (b *Backend) instant(ctx context.Context, cluster, query string, ttl time.Duration) (float64, error) {
	body, err := b.prom(ctx, cluster, "/api/v1/query", url.Values{"query": {query}}, ttl)
	if err != nil {
		return 0, err
	}
	var r promResponse
	if err := json.Unmarshal(body, &r); err != nil || r.Status != "success" {
		return 0, &upstreamError{http.StatusBadGateway, "Prometheus: " + r.Error}
	}
	if len(r.Data.Result) == 0 || len(r.Data.Result[0].Value) < 2 {
		return 0, nil
	}
	return num(r.Data.Result[0].Value[1]), nil
}

func cluster(w http.ResponseWriter, r *http.Request) (string, bool) {
	c := r.PathValue("cluster")
	if !clusterRE.MatchString(c) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad cluster id"})
		return "", false
	}
	return c, true
}

// status: Prometheus' version and how many targets are up.
func (b *Backend) status(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	body, err := b.prom(r.Context(), c, "/api/v1/status/buildinfo", url.Values{}, time.Minute)
	if err != nil {
		writeErr(w, err)
		return
	}
	var info struct {
		Data struct {
			Version string `json:"version"`
		} `json:"data"`
	}
	_ = json.Unmarshal(body, &info)
	up, err := b.instant(r.Context(), c, Overview["targetsUp"], 15*time.Second)
	if err != nil {
		writeErr(w, err)
		return
	}
	down, _ := b.instant(r.Context(), c, Overview["targetsDown"], 15*time.Second)
	writeJSON(w, http.StatusOK, map[string]any{"version": info.Data.Version, "targetsUp": up, "targetsDown": down})
}

func (b *Backend) overview(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	out := map[string]float64{}
	for k, q := range Overview {
		v, err := b.instant(r.Context(), c, q, 15*time.Second)
		if err != nil {
			writeErr(w, err)
			return
		}
		out[k] = v
	}
	writeJSON(w, http.StatusOK, out)
}

func (b *Backend) usage(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	ns := r.PathValue("namespace")
	if !nameRE.MatchString(ns) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad namespace"})
		return
	}
	out := map[string]float64{}
	for k, q := range NamespaceUsage(ns) {
		v, err := b.instant(r.Context(), c, q, 15*time.Second)
		if err != nil {
			writeErr(w, err)
			return
		}
		out[k] = v
	}
	writeJSON(w, http.StatusOK, out)
}

// Series is one line on a chart.
type Series struct {
	Label  string       `json:"label"`
	Points [][2]float64 `json:"points"` // [unix seconds, value]
}

func (b *Backend) metrics(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	t := Target{Kind: r.PathValue("kind"), Namespace: q.Get("namespace"), Name: q.Get("name")}
	if err := t.validate(); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	rng, ok := Ranges[q.Get("range")]
	if !ok {
		rng = Ranges["1h"]
	}
	end := b.now().Truncate(rng.Step)
	start := end.Add(-rng.Span)
	cpuQ, memQ := t.Series()
	out := map[string]any{"range": rng.Name, "step": rng.Step.Seconds()}
	for key, query := range map[string]string{"cpu": cpuQ, "memory": memQ} {
		series, err := b.rangeQuery(r.Context(), c, query, start, end, rng, t.by())
		if err != nil {
			writeErr(w, err)
			return
		}
		out[key] = series
	}
	if cpuCap, memCap := t.Capacity(); cpuCap != "" {
		cv, _ := b.instant(r.Context(), c, cpuCap, time.Minute)
		mv, _ := b.instant(r.Context(), c, memCap, time.Minute)
		out["cpuCapacity"], out["memoryCapacity"] = cv, mv
	}
	writeJSON(w, http.StatusOK, out)
}

func (b *Backend) rangeQuery(ctx context.Context, c, query string, start, end time.Time, rng Range, by string) ([]Series, error) {
	params := url.Values{
		"query": {query}, "start": {strconv.FormatInt(start.Unix(), 10)},
		"end": {strconv.FormatInt(end.Unix(), 10)}, "step": {strconv.Itoa(int(rng.Step.Seconds()))},
	}
	body, err := b.prom(ctx, c, "/api/v1/query_range", params, rng.Cache)
	if err != nil {
		return nil, err
	}
	var resp promResponse
	if err := json.Unmarshal(body, &resp); err != nil || resp.Status != "success" {
		return nil, &upstreamError{http.StatusBadGateway, "Prometheus: " + resp.Error}
	}
	out := []Series{}
	for _, res := range resp.Data.Result {
		label := "total"
		if by != "" && res.Metric[by] != "" {
			label = res.Metric[by]
		}
		s := Series{Label: label}
		for _, p := range res.Values {
			if len(p) == 2 {
				ts, _ := p[0].(float64)
				s.Points = append(s.Points, [2]float64{ts, num(p[1])})
			}
		}
		out = append(out, s)
	}
	return out, nil
}

// Alert is a firing or pending alert.
type Alert struct {
	Name     string            `json:"name"`
	State    string            `json:"state"`
	Severity string            `json:"severity,omitempty"`
	Summary  string            `json:"summary,omitempty"`
	ActiveAt string            `json:"activeAt,omitempty"`
	Labels   map[string]string `json:"labels"`
}

func (b *Backend) alerts(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	body, err := b.prom(r.Context(), c, "/api/v1/alerts", url.Values{}, 15*time.Second)
	if err != nil {
		writeErr(w, err)
		return
	}
	var resp struct {
		Data struct {
			Alerts []struct {
				Labels      map[string]string `json:"labels"`
				Annotations map[string]string `json:"annotations"`
				State       string            `json:"state"`
				ActiveAt    string            `json:"activeAt"`
			} `json:"alerts"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		writeErr(w, err)
		return
	}
	out := []Alert{}
	for _, a := range resp.Data.Alerts {
		summary := a.Annotations["summary"]
		if summary == "" {
			summary = a.Annotations["description"]
		}
		out = append(out, Alert{Name: a.Labels["alertname"], State: a.State, Severity: a.Labels["severity"], Summary: summary, ActiveAt: a.ActiveAt, Labels: a.Labels})
	}
	writeJSON(w, http.StatusOK, out)
}

// grafana serves Grafana's UI (anonymous Viewer) under Capybara's path
// /api/plugins/monitoring/grafana/<cluster>/, which is Grafana's root_url.
func (b *Backend) grafana(w http.ResponseWriter, r *http.Request) {
	c, ok := cluster(w, r)
	if !ok {
		return
	}
	prefix := r.Header.Get("X-Capybara-Prefix")
	if prefix != "/api/plugins/monitoring" {
		prefix = "/api/plugins/monitoring"
	}
	target, err := url.Parse(b.scopedURL(c, "grafana", ""))
	if err != nil {
		writeErr(w, err)
		return
	}
	tok, err := b.readToken(false)
	if err != nil {
		writeErr(w, err)
		return
	}
	rest := r.PathValue("rest")
	rp := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme, pr.Out.URL.Host = target.Scheme, target.Host
			pr.Out.URL.Path = target.Path + prefix + "/grafana/" + c + "/" + rest
			pr.Out.URL.RawPath = ""
			pr.Out.Host = target.Host
			pr.Out.Header.Del("Cookie")
			pr.Out.Header.Set("Authorization", "Bearer "+tok)
		},
		ErrorHandler: func(w http.ResponseWriter, _ *http.Request, err error) {
			b.Logger.Warn("grafana proxy", "cluster", c, "err", err)
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "Grafana is not reachable"})
		},
	}
	rp.ServeHTTP(w, r)
}
