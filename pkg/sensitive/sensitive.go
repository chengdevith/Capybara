// Package sensitive holds the rules for data that must never reach the
// browser unless a user explicitly asks for it.
//
// Secrets: lists, gets and watches return metadata only
// (PartialObjectMetadata), and even metadata is scrubbed, because
// `kubectl apply` stores the whole object, values included, in the
// last-applied-configuration annotation. Values are only sent by the
// audited reveal endpoint.
package sensitive

import (
	"regexp"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// LastAppliedAnnotation is where `kubectl apply` keeps a full copy of the
// applied object.
const LastAppliedAnnotation = "kubectl.kubernetes.io/last-applied-configuration"

// Accept headers that make the API server return metadata only.
const (
	AcceptMetadataList = "application/json;as=PartialObjectMetadataList;g=meta.k8s.io;v=v1"
	AcceptMetadata     = "application/json;as=PartialObjectMetadata;g=meta.k8s.io;v=v1"
)

// SecretsGVR is core/v1 secrets.
var SecretsGVR = schema.GroupVersionResource{Version: "v1", Resource: "secrets"}

// IsSecrets reports whether gvr is Secrets.
func IsSecrets(gvr schema.GroupVersionResource) bool { return gvr == SecretsGVR }

var secretPath = regexp.MustCompile(`^/api/v1/(?:namespaces/[^/]+/)?secrets(/[^/]+)?(/.*)?$`)

// SecretPath reports whether a Kubernetes API path addresses Secrets, and
// whether it is a single object (vs a collection) or goes deeper (a
// subresource, which is never allowed).
func SecretPath(p string) (isSecret, single, deeper bool) {
	m := secretPath.FindStringSubmatch(p)
	if m == nil {
		return false, false, false
	}
	return true, m[1] != "", m[2] != ""
}

// ScrubMeta removes metadata that can carry Secret values.
func ScrubMeta(meta *metav1.ObjectMeta) {
	delete(meta.Annotations, LastAppliedAnnotation)
	meta.ManagedFields = nil
}

// ScrubMetaMap is ScrubMeta for unstructured metadata.
func ScrubMetaMap(meta map[string]any) {
	if ann, ok := meta["annotations"].(map[string]any); ok {
		delete(ann, LastAppliedAnnotation)
	}
	delete(meta, "managedFields")
}
