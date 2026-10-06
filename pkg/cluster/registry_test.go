package cluster

import (
	"errors"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"k8s.io/client-go/tools/clientcmd"
)

var discard = slog.New(slog.NewTextHandler(io.Discard, nil))

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
}

func writeKubeconfig(t *testing.T, path, ctxName, server string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		t.Fatal(err)
	}
	if err := clientcmd.WriteToFile(*kubeconfig(ctxName, server), path); err != nil {
		t.Fatal(err)
	}
}

func TestLoadFile(t *testing.T) {
	dir := t.TempDir()
	writeKubeconfig(t, filepath.Join(dir, "kc", "dev-1.yaml"), "k3d-capybara-dev-1", "https://127.0.0.1:6551")
	writeKubeconfig(t, filepath.Join(dir, "kc", "bad.yaml"), "prod", "https://api.example.com:6443")
	writeFile(t, filepath.Join(dir, "clusters.yaml"), `
clusters:
  - id: dev-1
    displayName: Dev 1
    environment: dev
    kubeconfig: kc/dev-1.yaml
  - id: dev-2
    kubeconfig: kc/missing.yaml
  - id: bad
    kubeconfig: kc/bad.yaml
`)

	r, err := LoadFile(filepath.Join(dir, "clusters.yaml"), discard)
	if err != nil {
		t.Fatal(err)
	}

	got := r.List()
	if len(got) != 3 || got[0].ID != "dev-1" || got[1].ID != "dev-2" {
		t.Fatalf("List() = %+v, want file order", got)
	}
	if got[1].DisplayName != "dev-2" {
		t.Errorf("display name should default to id, got %q", got[1].DisplayName)
	}

	c1, err := r.Client("dev-1")
	if err != nil || c1 == nil {
		t.Fatalf("Client(dev-1): %v", err)
	}
	if again, _ := r.Client("dev-1"); again != c1 {
		t.Error("client should be cached")
	}
	cfg, err := r.RESTConfig("dev-1")
	if err != nil || cfg.Host != "https://127.0.0.1:6551" {
		t.Fatalf("RESTConfig(dev-1) = %v, %v", cfg, err)
	}

	if _, err := r.Client("dev-2"); err == nil || !strings.Contains(err.Error(), "make cluster-up") {
		t.Errorf("missing kubeconfig: got %v", err)
	}
	if _, err := r.Client("bad"); err == nil || !strings.Contains(err.Error(), "not a local Capybara k3d context") {
		t.Errorf("non-local kubeconfig must be refused, got %v", err)
	}
	if _, err := r.Client("nope"); !errors.Is(err, ErrNotFound) {
		t.Errorf("unknown id: got %v, want ErrNotFound", err)
	}
}

func TestLoadFileRejectsBadConfig(t *testing.T) {
	cases := map[string]string{
		"bad id":        "clusters:\n  - id: Dev_1\n    kubeconfig: x\n",
		"duplicate":     "clusters:\n  - id: a\n    kubeconfig: x\n  - id: a\n    kubeconfig: y\n",
		"no kubeconfig": "clusters:\n  - id: a\n",
		"unknown field": "clusters:\n  - id: a\n    kubeconfig: x\n    token: secret\n",
	}
	for name, content := range cases {
		path := filepath.Join(t.TempDir(), "clusters.yaml")
		writeFile(t, path, content)
		if _, err := LoadFile(path, discard); err == nil {
			t.Errorf("%s: expected error", name)
		}
	}
}
