package stream

import (
	"bytes"
	"errors"
	"log/slog"
	"strings"
	"testing"

	"github.com/go-logr/logr"
)

func TestQuietCloseHandler(t *testing.T) {
	closed := errors.New("next reader: read tcp 127.0.0.1:1->127.0.0.1:2: use of closed network connection")

	var info bytes.Buffer
	l := logr.FromSlogHandler(quietCloseHandler{slog.NewTextHandler(&info, &slog.HandlerOptions{Level: slog.LevelInfo})})
	l.Error(closed, "Copying stdout failed")
	l.Error(closed, "Websocket Ping failed")
	l.Error(errors.New("connection reset by peer"), "Copying stdout failed") // different cause
	l.Error(closed, "Something else failed")                                 // different message
	out := info.String()
	if strings.Contains(out, "Websocket Ping failed") || strings.Count(out, "Copying stdout failed") != 1 {
		t.Errorf("expected close noise suppressed at info level, got:\n%s", out)
	}
	if !strings.Contains(out, "connection reset by peer") || !strings.Contains(out, "Something else failed") {
		t.Errorf("real errors must stay visible, got:\n%s", out)
	}

	var debug bytes.Buffer
	d := logr.FromSlogHandler(quietCloseHandler{slog.NewTextHandler(&debug, &slog.HandlerOptions{Level: slog.LevelDebug})})
	d.Error(closed, "Copying stdout failed")
	if !strings.Contains(debug.String(), "level=DEBUG") || !strings.Contains(debug.String(), "Copying stdout failed") {
		t.Errorf("at debug level the message should appear as DEBUG, got:\n%s", debug.String())
	}
}
