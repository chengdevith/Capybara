// Package httpjson has the small JSON response helpers shared by handlers.
package httpjson

import (
	"encoding/json"
	"net/http"
)

// Write sends v as JSON with the given status.
func Write(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// Error sends {"error": msg} with the given status.
func Error(w http.ResponseWriter, status int, msg string) {
	Write(w, status, map[string]string{"error": msg})
}
