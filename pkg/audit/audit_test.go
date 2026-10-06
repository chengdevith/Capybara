package audit

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/capybara/capybara/pkg/auth"
)

func devCtx() context.Context { return auth.WithUser(context.Background(), auth.DevUser) }

func newStore(t *testing.T) (*FileStore, string) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "audit", "audit.jsonl")
	s, err := NewFileStore(path)
	if err != nil {
		t.Fatal(err)
	}
	return s, path
}

func lines(t *testing.T, path string) []Entry {
	t.Helper()
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var out []Entry
	for _, l := range strings.Split(strings.TrimSpace(string(raw)), "\n") {
		if l == "" {
			continue
		}
		var e Entry
		if err := json.Unmarshal([]byte(l), &e); err != nil {
			t.Fatalf("bad line %q: %v", l, err)
		}
		out = append(out, e)
	}
	return out
}

var op = Op{Cluster: "dev-1", Namespace: "demo", Kind: "Deployment", Name: "web", Action: "scale"}

func TestDoWritesAttemptBeforeActingThenOutcome(t *testing.T) {
	s, path := newStore(t)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))

	err := a.Do(devCtx(), op, func(context.Context) (string, error) {
		// The attempt must already be on disk while the action runs.
		got := lines(t, path)
		if len(got) != 1 || got[0].Phase != PhaseAttempted || got[0].User != "dev" {
			t.Fatalf("before acting, log = %+v", got)
		}
		return "replicas 2 → 3", nil
	})
	if err != nil {
		t.Fatal(err)
	}

	got := lines(t, path)
	if len(got) != 2 || got[1].Phase != PhaseCompleted || got[1].Result != ResultSuccess || got[1].ID != got[0].ID {
		t.Fatalf("log = %+v", got)
	}
	if got[1].Detail != "replicas 2 → 3" {
		t.Errorf("detail = %q", got[1].Detail)
	}
	info, _ := os.Stat(path)
	if info.Mode().Perm() != 0o600 {
		t.Errorf("audit file mode = %v, want 0600", info.Mode().Perm())
	}
}

func TestDoRecordsFailuresAndResults(t *testing.T) {
	s, _ := newStore(t)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))
	ctx := devCtx()

	_ = a.Do(ctx, op, func(context.Context) (string, error) { return "", errors.New("boom") })
	_ = a.Do(ctx, op, func(context.Context) (string, error) { return "", conflictErr{} })
	_ = a.Do(ctx, op, func(context.Context) (string, error) { return "", errors.Join(ErrDenied, errors.New("protected")) })

	recs, err := s.List(ctx, Filter{})
	if err != nil {
		t.Fatal(err)
	}
	var results []Result
	for _, r := range recs {
		results = append(results, r.Result)
	}
	// newest first
	want := []Result{ResultDenied, ResultConflict, ResultFailure}
	if len(results) != 3 || results[0] != want[0] || results[1] != want[1] || results[2] != want[2] {
		t.Fatalf("results = %v, want %v", results, want)
	}
	if recs[2].Detail != "boom" {
		t.Errorf("failure detail = %q", recs[2].Detail)
	}
}

type conflictErr struct{}

func (conflictErr) Error() string       { return "conflict" }
func (conflictErr) AuditResult() Result { return ResultConflict }

type failingRecorder struct{ calls int }

func (f *failingRecorder) Record(context.Context, Entry) error {
	f.calls++
	return errors.New("disk full")
}

func TestDoRefusesWhenAttemptCannotBeWritten(t *testing.T) {
	a := NewAuditor(&failingRecorder{}, slog.New(slog.DiscardHandler))
	ran := false
	err := a.Do(devCtx(), op, func(context.Context) (string, error) { ran = true; return "", nil })
	if ran {
		t.Fatal("action ran without an audit entry")
	}
	if !errors.Is(err, ErrUnavailable) {
		t.Fatalf("err = %v, want ErrUnavailable", err)
	}
	if a.Healthy() == nil {
		t.Fatal("Healthy() should report the failure")
	}
}

func TestRefusesUntilTheLogWorksAgain(t *testing.T) {
	if os.Getuid() == 0 {
		t.Skip("root ignores directory permissions")
	}
	s, path := newStore(t)
	dir := filepath.Dir(path)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))
	act := func() error {
		return a.Do(devCtx(), op, func(context.Context) (string, error) { return "", nil })
	}

	// Break the log: remove the file and make the directory read-only.
	if err := os.Remove(path); err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(dir, 0o500); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(dir, 0o700) })

	for i := 0; i < 2; i++ {
		if err := act(); !errors.Is(err, ErrUnavailable) {
			t.Fatalf("attempt %d while broken: err = %v", i, err)
		}
	}

	// Repair it: the next action goes through.
	if err := os.Chmod(dir, 0o700); err != nil {
		t.Fatal(err)
	}
	if err := act(); err != nil {
		t.Fatalf("after repair: %v", err)
	}
	if a.Healthy() != nil {
		t.Fatal("Healthy() should clear after a successful write")
	}
}

type outcomeFails struct {
	*FileStore
	n int
}

func (o *outcomeFails) Record(ctx context.Context, e Entry) error {
	o.n++
	if e.Phase == PhaseCompleted {
		return errors.New("disk full")
	}
	return o.FileStore.Record(ctx, e)
}

func TestOutcomeNotRecorded(t *testing.T) {
	s, _ := newStore(t)
	a := NewAuditor(&outcomeFails{FileStore: s}, slog.New(slog.DiscardHandler))
	err := a.Do(devCtx(), op, func(context.Context) (string, error) { return "ok", nil })
	var onr *OutcomeNotRecordedError
	if !errors.As(err, &onr) || onr.ActionErr != nil {
		t.Fatalf("err = %v, want OutcomeNotRecordedError for a successful action", err)
	}
	// The attempt is still there, with an unknown result.
	recs, _ := s.List(context.Background(), Filter{})
	if len(recs) != 1 || recs[0].Result != ResultUnknown {
		t.Fatalf("records = %+v", recs)
	}
}

func TestSensitiveDetailsAreRedacted(t *testing.T) {
	s, path := newStore(t)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))
	secretOp := Op{Cluster: "dev-1", Namespace: "demo", Kind: "Secret", Name: "db", Action: "apply", Sensitive: true}
	_ = a.Do(devCtx(), secretOp, func(context.Context) (string, error) {
		return "", errors.New(`Secret "db" is invalid: data[password]: Invalid value: "hunter2-super-secret"`)
	})
	raw, _ := os.ReadFile(path)
	if strings.Contains(string(raw), "hunter2") {
		t.Fatalf("secret value reached the audit log: %s", raw)
	}
}

func TestListFiltersPagesAndSurvivesRestart(t *testing.T) {
	s, path := newStore(t)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))
	base := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	i := 0
	a.now = func() time.Time { i++; return base.Add(time.Duration(i) * time.Minute) }
	for _, c := range []string{"dev-1", "dev-2", "dev-1"} {
		o := op
		o.Cluster = c
		_ = a.Do(devCtx(), o, func(context.Context) (string, error) { return "", nil })
	}
	// A torn last line (crash mid-write) must not break reading.
	f, _ := os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0o600)
	_, _ = f.WriteString(`{"id":"torn","ti`)
	_ = f.Close()

	reopened, err := NewFileStore(path)
	if err != nil {
		t.Fatal(err)
	}
	dev1, _ := reopened.List(context.Background(), Filter{Cluster: "dev-1"})
	if len(dev1) != 2 || !dev1[0].Time.After(dev1[1].Time) {
		t.Fatalf("dev-1 records = %+v", dev1)
	}
	page, _ := reopened.List(context.Background(), Filter{Limit: 1, Before: dev1[0].Time})
	if len(page) != 1 || page[0].Cluster != "dev-2" {
		t.Fatalf("page = %+v", page)
	}
}

func TestListHandler(t *testing.T) {
	s, _ := newStore(t)
	a := NewAuditor(s, slog.New(slog.DiscardHandler))
	_ = a.Do(devCtx(), op, func(context.Context) (string, error) { return "", nil })

	rec := httptest.NewRecorder()
	ListHandler(s).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/audit?cluster=dev-1&limit=10", nil))
	var body struct{ Items []Record }
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil || len(body.Items) != 1 || body.Items[0].Result != ResultSuccess {
		t.Fatalf("status %d body %s", rec.Code, rec.Body)
	}
	for _, bad := range []string{"?limit=0", "?before=yesterday"} {
		rec := httptest.NewRecorder()
		ListHandler(s).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/audit"+bad, nil))
		if rec.Code != http.StatusBadRequest {
			t.Errorf("%s: status %d", bad, rec.Code)
		}
	}
}
