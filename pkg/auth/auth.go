// Package auth is a placeholder for authentication.
//
// Until Phase 5 (Keycloak/AD) every request is treated as the fixed user
// "dev". Handlers must read the user with UserFrom so real auth can replace
// Middleware without touching them.
package auth

import (
	"context"
	"net/http"
)

// User is the caller of a request.
type User struct {
	Name   string
	Groups []string
}

// DevUser is the fixed identity used before real authentication exists.
var DevUser = User{Name: "dev"}

type ctxKey struct{}

// WithUser returns a copy of ctx carrying u.
func WithUser(ctx context.Context, u User) context.Context {
	return context.WithValue(ctx, ctxKey{}, u)
}

// UserFrom returns the user stored in ctx by Middleware.
func UserFrom(ctx context.Context) (User, bool) {
	u, ok := ctx.Value(ctxKey{}).(User)
	return u, ok
}

// Middleware attaches DevUser to every request.
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r.WithContext(WithUser(r.Context(), DevUser)))
	})
}
