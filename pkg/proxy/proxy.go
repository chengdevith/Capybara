// Package proxy is the generic passthrough to a cluster's Kubernetes API:
// /api/clusters/{id}/k8s/<kube path> is forwarded to <kube path> on that
// cluster, authenticated with the cluster's own credentials.
//
// It is read-only: only GET is forwarded (writes go through pkg/action),
// watches go through the websocket hub (pkg/stream), and subresources that
// open a channel into a container or service (exec, attach, portforward,
// proxy) are refused.
//
// Secrets are only ever returned as scrubbed metadata (see pkg/sensitive);
// if the cluster answers with anything else, the response is refused.
package proxy

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"

	"k8s.io/client-go/rest"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
	"github.com/capybara/capybara/pkg/sensitive"
)

// Prefixes of the Kubernetes API that may be reached.
var allowedPrefixes = []string{"/api/", "/apis/"}

// Exact paths that may be reached.
var allowedPaths = map[string]bool{"/api": true, "/apis": true, "/version": true}

// Subresources never reachable through the passthrough.
var blockedSubresources = map[string]bool{"exec": true, "attach": true, "portforward": true, "proxy": true}

// Request headers from the browser that must never reach a cluster.
var strippedHeaders = []string{"Authorization", "Proxy-Authorization", "Cookie"}

// Handler serves /api/clusters/{id}/k8s/{path...}.
func Handler(clusters cluster.Provider, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		kubePath := "/" + r.PathValue("path")
		if status, msg := check(r, kubePath); status != 0 {
			httpjson.Error(w, status, msg)
			return
		}

		isSecret, single, deeper := sensitive.SecretPath(kubePath)
		if deeper {
			httpjson.Error(w, http.StatusForbidden, "secret subresources are not allowed through the passthrough")
			return
		}

		id := r.PathValue("id")
		cfg, err := clusters.RESTConfig(id)
		if errors.Is(err, cluster.ErrNotFound) {
			httpjson.Error(w, http.StatusNotFound, err.Error())
			return
		}
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}

		var secrets *secretMode
		if isSecret {
			secrets = &secretMode{single: single}
		}
		rp, err := reverseProxy(cfg, kubePath, secrets, logger.With("cluster", id))
		if err != nil {
			httpjson.Error(w, http.StatusBadGateway, err.Error())
			return
		}
		rp.ServeHTTP(w, r)
	})
}

// check returns a non-zero status when the request must not be forwarded.
func check(r *http.Request, kubePath string) (int, string) {
	if r.Method != http.MethodGet {
		return http.StatusMethodNotAllowed, "read-only: only GET is allowed"
	}
	if strings.EqualFold(r.Header.Get("Connection"), "upgrade") || r.Header.Get("Upgrade") != "" {
		return http.StatusForbidden, "protocol upgrades are not allowed through the passthrough"
	}
	if !allowedPaths[kubePath] && !hasAllowedPrefix(kubePath) {
		return http.StatusForbidden, fmt.Sprintf("path %q is not part of the Kubernetes API", kubePath)
	}
	for _, seg := range strings.Split(kubePath, "/") {
		if seg == ".." || seg == "." {
			return http.StatusBadRequest, "invalid path"
		}
	}
	if sub := subresource(kubePath); blockedSubresources[sub] {
		return http.StatusForbidden, fmt.Sprintf("subresource %q is not allowed through the passthrough", sub)
	}
	if w := r.URL.Query().Get("watch"); w == "true" || w == "1" {
		return http.StatusBadRequest, "watches go through /api/clusters/{id}/watch"
	}
	return 0, ""
}

func hasAllowedPrefix(p string) bool {
	for _, prefix := range allowedPrefixes {
		if strings.HasPrefix(p, prefix) {
			return true
		}
	}
	return false
}

// subresource returns the subresource of a Kubernetes API path, or "".
//
//	/api/v1/namespaces/ns/pods/name/exec         -> exec
//	/apis/apps/v1/namespaces/ns/deployments/d/scale -> scale
//	/api/v1/nodes/n/proxy/metrics                -> proxy
func subresource(p string) string {
	segs := strings.Split(strings.Trim(p, "/"), "/")
	// Drop the group/version prefix: api/v1 or apis/<group>/<version>.
	switch {
	case len(segs) >= 2 && segs[0] == "api":
		segs = segs[2:]
	case len(segs) >= 3 && segs[0] == "apis":
		segs = segs[3:]
	default:
		return ""
	}
	if len(segs) > 2 && segs[0] == "namespaces" {
		segs = segs[2:] // namespaced resource: namespaces/<ns>/<resource>/...
	}
	// <resource>/<name>/<subresource>/...
	if len(segs) >= 3 {
		return segs[2]
	}
	return ""
}

// secretMode marks a request for Secrets: metadata only, scrubbed.
type secretMode struct{ single bool }

func reverseProxy(cfg *rest.Config, kubePath string, secrets *secretMode, logger *slog.Logger) (*httputil.ReverseProxy, error) {
	target, err := url.Parse(cfg.Host)
	if err != nil {
		return nil, fmt.Errorf("bad cluster host: %w", err)
	}
	transport, err := rest.TransportFor(cfg)
	if err != nil {
		return nil, fmt.Errorf("cluster transport: %w", err)
	}
	return &httputil.ReverseProxy{
		Transport:     transport,
		FlushInterval: -1, // stream (e.g. pods/log?follow=true) without buffering
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme = target.Scheme
			pr.Out.URL.Host = target.Host
			pr.Out.URL.Path = strings.TrimSuffix(target.Path, "/") + kubePath
			pr.Out.URL.RawPath = ""
			pr.Out.URL.RawQuery = pr.In.URL.RawQuery
			pr.Out.Host = target.Host
			for _, h := range strippedHeaders {
				pr.Out.Header.Del(h)
			}
			for name := range pr.Out.Header {
				if strings.HasPrefix(name, "Impersonate-") {
					pr.Out.Header.Del(name)
				}
			}
			if secrets != nil {
				accept := sensitive.AcceptMetadataList
				if secrets.single {
					accept = sensitive.AcceptMetadata
				}
				pr.Out.Header.Set("Accept", accept)
				// Let the transport handle compression so the body can be scrubbed.
				pr.Out.Header.Del("Accept-Encoding")
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			resp.Header.Del("Set-Cookie")
			resp.Header.Del("Www-Authenticate")
			if secrets != nil {
				return scrubSecretResponse(resp)
			}
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.Warn("passthrough failed", "path", kubePath, "err", err)
			if r.Context().Err() != nil {
				return // client went away
			}
			httpjson.Error(w, http.StatusBadGateway, "cluster request failed: "+err.Error())
		},
	}, nil
}

const maxSecretResponse = 64 << 20

// scrubSecretResponse lets through only metadata (and error Statuses),
// with the last-applied annotation removed. Anything else is refused, so a
// cluster that ignores the metadata Accept header cannot leak values.
func scrubSecretResponse(resp *http.Response) error {
	raw, err := io.ReadAll(io.LimitReader(resp.Body, maxSecretResponse))
	_ = resp.Body.Close()
	if err != nil {
		return err
	}
	var obj map[string]any
	if err := json.Unmarshal(raw, &obj); err != nil {
		return errors.New("refusing to forward a Secret response that is not JSON")
	}
	switch kind, _ := obj["kind"].(string); kind {
	case "Status":
	case "PartialObjectMetadata":
		if meta, ok := obj["metadata"].(map[string]any); ok {
			sensitive.ScrubMetaMap(meta)
		}
	case "PartialObjectMetadataList":
		items, _ := obj["items"].([]any)
		for _, it := range items {
			if m, ok := it.(map[string]any); ok {
				if meta, ok := m["metadata"].(map[string]any); ok {
					sensitive.ScrubMetaMap(meta)
				}
			}
		}
	default:
		return fmt.Errorf("refusing to forward Secret data (cluster returned %q, not metadata)", kind)
	}
	out, err := json.Marshal(obj)
	if err != nil {
		return err
	}
	resp.Body = io.NopCloser(bytes.NewReader(out))
	resp.ContentLength = int64(len(out))
	resp.Header.Set("Content-Length", strconv.Itoa(len(out)))
	resp.Header.Del("Content-Encoding")
	return nil
}
