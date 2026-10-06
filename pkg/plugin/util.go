package plugin

import (
	"encoding/json"
	"fmt"
	"io"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func jsonMarshal(v any) ([]byte, error) { return json.Marshal(v) }

func unstructuredString(obj map[string]any, fields ...string) (string, bool, error) {
	return unstructured.NestedString(obj, fields...)
}

func nestedSlice(obj map[string]any, fields ...string) ([]any, bool) {
	s, ok, _ := unstructured.NestedSlice(obj, fields...)
	return s, ok
}

// readLimited reads at most limit bytes; more is an error.
func readLimited(r io.Reader, limit int64) ([]byte, error) {
	b, err := io.ReadAll(io.LimitReader(r, limit+1))
	if err != nil {
		return nil, err
	}
	if int64(len(b)) > limit {
		return nil, fmt.Errorf("response larger than %d bytes", limit)
	}
	return b, nil
}
