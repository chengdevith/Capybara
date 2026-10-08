package cluster

import (
	"errors"
	"strings"
	"testing"
	"time"

	"k8s.io/client-go/rest"
)

func TestSameCluster(t *testing.T) {
	caA, _ := testCert(t, "ca-a", time.Now().Add(time.Hour))
	caB, _ := testCert(t, "ca-b", time.Now().Add(time.Hour))
	reg := &rest.Config{Host: "https://127.0.0.1:6552", TLSClientConfig: rest.TLSClientConfig{CAData: caA}}
	cases := []struct {
		name  string
		other *rest.Config
		want  string // "" = same cluster
	}{
		{"same CA, same server", &rest.Config{Host: "https://127.0.0.1:6552", TLSClientConfig: rest.TLSClientConfig{CAData: caA}}, ""},
		{"same CA, another address (e.g. a load balancer)", &rest.Config{Host: "https://k8s.internal:6443", TLSClientConfig: rest.TLSClientConfig{CAData: caA}}, ""},
		{"same CA within a bundle", &rest.Config{Host: "https://x", TLSClientConfig: rest.TLSClientConfig{CAData: append(append([]byte{}, caB...), caA...)}}, ""},
		{"another cluster's CA", &rest.Config{Host: "https://127.0.0.1:6551", TLSClientConfig: rest.TLSClientConfig{CAData: caB}}, "reaches server 127.0.0.1:6551"},
		{"no CA", &rest.Config{Host: "https://127.0.0.1:6552"}, "names no certificate authority"},
	}
	for _, c := range cases {
		err := SameCluster(reg, c.other)
		switch {
		case c.want == "" && err != nil:
			t.Errorf("%s: %v", c.name, err)
		case c.want != "" && (!errors.Is(err, ErrOtherCluster) || !strings.Contains(err.Error(), c.want)):
			t.Errorf("%s: %v", c.name, err)
		}
	}
	// Without a CA on the registered connection: the server decides.
	plain := &rest.Config{Host: "https://a:6443"}
	if err := SameCluster(plain, &rest.Config{Host: "https://a:6443"}); err != nil {
		t.Error(err)
	}
	if err := SameCluster(plain, &rest.Config{Host: "https://b:6443"}); !errors.Is(err, ErrOtherCluster) {
		t.Errorf("another server: %v", err)
	}
}
