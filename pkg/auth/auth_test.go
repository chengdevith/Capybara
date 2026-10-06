package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMiddlewareSetsDevUser(t *testing.T) {
	var got User
	var ok bool
	h := Middleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got, ok = UserFrom(r.Context())
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/", nil))

	if !ok || got.Name != "dev" {
		t.Fatalf("UserFrom = %+v, %v; want dev user", got, ok)
	}
}

func TestUserFromEmptyContext(t *testing.T) {
	if _, ok := UserFrom(context.Background()); ok {
		t.Fatal("expected no user in empty context")
	}
}
