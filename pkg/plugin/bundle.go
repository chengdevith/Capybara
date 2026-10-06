package plugin

import (
	"net/http"
	"path/filepath"
	"strings"

	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/httpjson"
)

// Bundles serves plugin UI bundles: only from trusted repositories, and
// only when the bytes match the sha256 pinned in the manifest. URLs carry
// the hash (/api/plugins/_ui/<name>/<sha256>.js), so they never go stale.
//
// With DevDir (--plugin-dev-dir, loopback only) /api/plugins/_ui/<name>/dev.js
// serves the plugin's current bundle unpinned, marked as a dev bundle.
type Bundles struct {
	Mgmt       client.Client
	PluginsDir string
	DevDir     string
}

func (b *Bundles) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	name, file := r.PathValue("name"), r.PathValue("file")
	var p v1alpha1.Plugin
	if err := b.Mgmt.Get(r.Context(), types.NamespacedName{Name: name}, &p); err != nil || p.Spec.UI == nil {
		httpjson.Error(w, http.StatusNotFound, "no UI bundle for this plugin")
		return
	}
	var repo v1alpha1.PluginRepository
	if err := b.Mgmt.Get(r.Context(), types.NamespacedName{Name: p.Spec.Repository}, &repo); err != nil || !repo.Spec.Trusted {
		httpjson.Error(w, http.StatusForbidden, "UI bundles are served only from trusted repositories")
		return
	}
	w.Header().Set("Content-Type", "text/javascript; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	if file == "dev.js" {
		if b.DevDir == "" {
			httpjson.Error(w, http.StatusNotFound, "dev bundles are off (--plugin-dev-dir)")
			return
		}
		body, err := readPluginFile(filepath.Join(b.DevDir, name), p.Spec.UI.Bundle)
		if err != nil {
			httpjson.Error(w, http.StatusNotFound, "dev bundle not built")
			return
		}
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Capybara-Dev-Bundle", "1")
		_, _ = w.Write(body)
		return
	}
	sha, ok := strings.CutSuffix(file, ".js")
	if !ok || sha != p.Spec.UI.SHA256 {
		httpjson.Error(w, http.StatusNotFound, "unknown bundle version")
		return
	}
	body, err := ReadPinned(filepath.Join(b.PluginsDir, name), p.Spec.UI.Bundle, p.Spec.UI.SHA256)
	if err != nil {
		// Never serve bytes that do not match the pin.
		httpjson.Error(w, http.StatusConflict, "the bundle on disk does not match its pinned sha256")
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	_, _ = w.Write(body)
}
