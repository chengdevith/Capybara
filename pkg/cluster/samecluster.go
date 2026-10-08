package cluster

import (
	"bytes"
	"context"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"net/url"
	"slices"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/capybara/capybara/api/v1alpha1"
)

// ErrOtherCluster means a credential reaches a different cluster than the
// one it is stored for (e.g. dev-1's installer kubeconfig set on dev-2).
var ErrOtherCluster = errors.New("this credential is for a different cluster")

// SameCluster checks that other reaches the cluster registered reaches:
// the same certificate authority (each cluster has its own), or, when the
// registered connection names none, the same API server.
func SameCluster(registered, other *rest.Config) error {
	regCAs, otherCAs := caFingerprints(registered.CAData), caFingerprints(other.CAData)
	switch {
	case len(regCAs) > 0 && len(otherCAs) == 0:
		return fmt.Errorf("%w: it names no certificate authority, so it cannot be matched to this cluster (server %s)", ErrOtherCluster, host(other.Host))
	case len(regCAs) > 0:
		for _, c := range otherCAs {
			if slices.ContainsFunc(regCAs, func(r []byte) bool { return bytes.Equal(r, c) }) {
				return nil
			}
		}
		return fmt.Errorf("%w: it reaches server %s, whose certificate authority is not this cluster's (%s)", ErrOtherCluster, host(other.Host), host(registered.Host))
	case host(registered.Host) != host(other.Host):
		return fmt.Errorf("%w: it reaches server %s, not %s", ErrOtherCluster, host(other.Host), host(registered.Host))
	}
	return nil
}

// RegisteredConfig is the cluster's registered connection, from its
// kubeconfig Secret in capybara-mgmt.
func RegisteredConfig(ctx context.Context, c client.Client, cl *v1alpha1.Cluster, opts ValidateOptions) (*rest.Config, error) {
	var secret corev1.Secret
	key := types.NamespacedName{Namespace: v1alpha1.SystemNamespace, Name: cl.Spec.KubeconfigSecret.Name}
	if err := c.Get(ctx, key, &secret); err != nil {
		return nil, fmt.Errorf("read the cluster's kubeconfig: %w", err)
	}
	cfg, _, err := RESTConfigFromKubeconfig(secret.Data[v1alpha1.KubeconfigKey], opts)
	return cfg, err
}

// caFingerprints are the DER bytes of each certificate in a PEM bundle.
func caFingerprints(data []byte) [][]byte {
	var out [][]byte
	for len(data) > 0 {
		var b *pem.Block
		b, data = pem.Decode(data)
		if b == nil {
			break
		}
		if b.Type != "CERTIFICATE" {
			continue
		}
		if c, err := x509.ParseCertificate(b.Bytes); err == nil {
			out = append(out, c.Raw)
		}
	}
	return out
}

func host(server string) string {
	if u, err := url.Parse(server); err == nil && u.Host != "" {
		return u.Host
	}
	return server
}
