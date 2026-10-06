package audit

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"testing"
	"time"
)

func TestLogRecorderFillsTime(t *testing.T) {
	var buf bytes.Buffer
	fixed := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	r := LogRecorder{
		Logger: slog.New(slog.NewJSONHandler(&buf, nil)),
		Now:    func() time.Time { return fixed },
	}

	err := r.Record(context.Background(), Entry{
		User: "dev", Cluster: "dev-1", Namespace: "default",
		Kind: "Pod", Name: "web-0", Action: "delete", Result: "success",
	})
	if err != nil {
		t.Fatal(err)
	}

	var line map[string]any
	if err := json.Unmarshal(buf.Bytes(), &line); err != nil {
		t.Fatalf("log line is not JSON: %v", err)
	}
	if line["time"] != fixed.Format(time.RFC3339) || line["user"] != "dev" || line["action"] != "delete" {
		t.Fatalf("unexpected log line: %v", line)
	}
}
