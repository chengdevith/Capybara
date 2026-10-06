package stream

import (
	"context"
	"log/slog"
	"strings"
)

// When a terminal session is cut (the browser left, idle or max duration),
// client-go's exec code logs these at error level although nothing is
// wrong. They are reported at debug level instead; any other error, or
// these messages with a different cause, stay at error level.
var expectedOnClose = map[string]bool{
	"Copying stdout failed":                    true,
	"Copying stderr failed":                    true,
	"Waiting for server to close stdin failed": true,
	"Websocket Ping failed":                    true,
}

const closedConnection = "use of closed network connection"

// quietCloseHandler wraps the server's slog handler for exec sessions.
type quietCloseHandler struct{ next slog.Handler }

func (h quietCloseHandler) Enabled(ctx context.Context, l slog.Level) bool {
	// Errors must reach Handle so they can be downgraded there.
	return l >= slog.LevelError || h.next.Enabled(ctx, l)
}

func (h quietCloseHandler) Handle(ctx context.Context, r slog.Record) error {
	if r.Level >= slog.LevelError && expectedOnClose[r.Message] && causedByClose(r) {
		if !h.next.Enabled(ctx, slog.LevelDebug) {
			return nil
		}
		d := slog.NewRecord(r.Time, slog.LevelDebug, r.Message, r.PC)
		r.Attrs(func(a slog.Attr) bool { d.AddAttrs(a); return true })
		return h.next.Handle(ctx, d)
	}
	return h.next.Handle(ctx, r)
}

func (h quietCloseHandler) WithAttrs(as []slog.Attr) slog.Handler {
	return quietCloseHandler{h.next.WithAttrs(as)}
}

func (h quietCloseHandler) WithGroup(name string) slog.Handler {
	return quietCloseHandler{h.next.WithGroup(name)}
}

func causedByClose(r slog.Record) bool {
	found := false
	r.Attrs(func(a slog.Attr) bool {
		if strings.Contains(a.Value.String(), closedConnection) {
			found = true
			return false
		}
		return true
	})
	return found
}
