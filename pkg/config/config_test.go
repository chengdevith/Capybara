package config

import (
	"testing"
	"time"
)

func env(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

func TestLoadDefaults(t *testing.T) {
	cfg, err := Load(nil, env(nil))
	if err != nil {
		t.Fatal(err)
	}
	if cfg != Defaults() {
		t.Fatalf("got %+v, want defaults %+v", cfg, Defaults())
	}
	if !cfg.IsLoopback() {
		t.Fatal("default address must be loopback")
	}
}

func TestLoadFlagBeatsEnv(t *testing.T) {
	cfg, err := Load(
		[]string{"-addr", "127.0.0.1:9000"},
		env(map[string]string{"CAPYBARA_ADDR": "127.0.0.1:7000", "CAPYBARA_CLUSTER_TIMEOUT": "5s"}),
	)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Addr != "127.0.0.1:9000" {
		t.Errorf("addr = %q, want flag value", cfg.Addr)
	}
	if cfg.ClusterTimeout != 5*time.Second {
		t.Errorf("timeout = %v, want env value", cfg.ClusterTimeout)
	}
}

func TestLoadRejectsBadValues(t *testing.T) {
	cases := map[string][]string{
		"addr":      {"-addr", "nonsense"},
		"timeout":   {"-cluster-timeout", "0s"},
		"log level": {"-log-level", "loud"},
		"no file":   {"-clusters-file", ""},
	}
	for name, args := range cases {
		if _, err := Load(args, env(nil)); err == nil {
			t.Errorf("%s: expected error", name)
		}
	}
}

func TestIsLoopback(t *testing.T) {
	cases := map[string]bool{
		"127.0.0.1:8080": true,
		"localhost:8080": true,
		"[::1]:8080":     true,
		"0.0.0.0:8080":   false,
		":8080":          false,
		"10.0.0.5:8080":  false,
	}
	for addr, want := range cases {
		if got := (Config{Addr: addr}).IsLoopback(); got != want {
			t.Errorf("%s: got %v, want %v", addr, got, want)
		}
	}
}
