package sensitive

import (
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestSecretPath(t *testing.T) {
	cases := map[string][3]bool{
		"/api/v1/secrets":                       {true, false, false},
		"/api/v1/namespaces/demo/secrets":       {true, false, false},
		"/api/v1/namespaces/demo/secrets/db":    {true, true, false},
		"/api/v1/namespaces/demo/secrets/db/x":  {true, true, true},
		"/api/v1/namespaces/demo/configmaps/db": {false, false, false},
		"/api/v1/namespaces/secrets":            {false, false, false}, // a namespace named "secrets"
		"/apis/apps/v1/secrets":                 {false, false, false},
	}
	for p, want := range cases {
		a, b, c := SecretPath(p)
		if [3]bool{a, b, c} != want {
			t.Errorf("%s: got %v %v %v, want %v", p, a, b, c, want)
		}
	}
}

func TestScrub(t *testing.T) {
	meta := metav1.ObjectMeta{
		Annotations:   map[string]string{LastAppliedAnnotation: `{"stringData":{"password":"x"}}`, "keep": "me"},
		ManagedFields: []metav1.ManagedFieldsEntry{{Manager: "kubectl"}},
	}
	ScrubMeta(&meta)
	if _, ok := meta.Annotations[LastAppliedAnnotation]; ok || meta.ManagedFields != nil || meta.Annotations["keep"] != "me" {
		t.Fatalf("meta = %+v", meta)
	}

	m := map[string]any{
		"annotations":   map[string]any{LastAppliedAnnotation: "x", "keep": "me"},
		"managedFields": []any{1},
	}
	ScrubMetaMap(m)
	if _, ok := m["managedFields"]; ok || len(m["annotations"].(map[string]any)) != 1 {
		t.Fatalf("map = %v", m)
	}
}
