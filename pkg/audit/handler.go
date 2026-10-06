package audit

import (
	"net/http"
	"strconv"
	"time"

	"github.com/capybara/capybara/pkg/httpjson"
)

// ListHandler serves GET /api/audit.
//
// Query: cluster, namespace, user, action, result, before (RFC 3339), limit.
func ListHandler(r Reader) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		q := req.URL.Query()
		f := Filter{
			Cluster:   q.Get("cluster"),
			Namespace: q.Get("namespace"),
			User:      q.Get("user"),
			Action:    q.Get("action"),
			Result:    Result(q.Get("result")),
		}
		if v := q.Get("before"); v != "" {
			t, err := time.Parse(time.RFC3339Nano, v)
			if err != nil {
				httpjson.Error(w, http.StatusBadRequest, "before must be an RFC 3339 time")
				return
			}
			f.Before = t
		}
		if v := q.Get("limit"); v != "" {
			n, err := strconv.Atoi(v)
			if err != nil || n < 1 {
				httpjson.Error(w, http.StatusBadRequest, "limit must be a positive number")
				return
			}
			f.Limit = n
		}
		items, err := r.List(req.Context(), f)
		if err != nil {
			httpjson.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		httpjson.Write(w, http.StatusOK, map[string]any{"items": items})
	})
}
