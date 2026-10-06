// Package audit records write actions.
//
// Stub until Phase 2: the types and the log-only Recorder exist so callers
// can be written against a stable interface, but nothing calls it yet.
package audit

import (
	"context"
	"log/slog"
	"time"
)

// Entry is one audited action.
type Entry struct {
	Time      time.Time `json:"time"`
	User      string    `json:"user"`
	Cluster   string    `json:"cluster"`
	Namespace string    `json:"namespace,omitempty"`
	Kind      string    `json:"kind"`
	Name      string    `json:"name"`
	Action    string    `json:"action"`
	Result    string    `json:"result"`
}

// Recorder stores audit entries.
type Recorder interface {
	Record(ctx context.Context, e Entry) error
}

// LogRecorder writes entries to a structured logger. It keeps nothing.
type LogRecorder struct {
	Logger *slog.Logger
	// Now is overridable for tests.
	Now func() time.Time
}

// Record logs e, filling in Time when it is zero.
func (r LogRecorder) Record(ctx context.Context, e Entry) error {
	if e.Time.IsZero() {
		now := time.Now
		if r.Now != nil {
			now = r.Now
		}
		e.Time = now().UTC()
	}
	r.Logger.InfoContext(ctx, "audit",
		"time", e.Time,
		"user", e.User,
		"cluster", e.Cluster,
		"namespace", e.Namespace,
		"kind", e.Kind,
		"name", e.Name,
		"action", e.Action,
		"result", e.Result,
	)
	return nil
}
