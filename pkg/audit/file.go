package audit

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"syscall"
)

const (
	defaultLimit = 100
	maxLimit     = 1000
	maxLineBytes = 1 << 20
)

// FileStore is an append-only JSON Lines file. Each Record opens the file
// in append mode, locks it (several processes may write), writes one line
// and syncs it, so a broken disk or a removed directory surfaces as an
// error on the very next action. The lock is released on close.
type FileStore struct {
	path string
	mu   sync.Mutex
}

var _ Store = (*FileStore)(nil)

// NewFileStore checks that path can be appended to (creating it, mode 600,
// and its directory, mode 700) and returns the store.
func NewFileStore(path string) (*FileStore, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return nil, fmt.Errorf("audit log directory: %w", err)
	}
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600) //nolint:gosec // path is the server's own --audit-file setting
	if err != nil {
		return nil, fmt.Errorf("audit log not writable: %w", err)
	}
	if err := f.Close(); err != nil {
		return nil, err
	}
	return &FileStore{path: path}, nil
}

// Record appends e as one line and syncs it to disk.
func (s *FileStore) Record(_ context.Context, e Entry) error {
	line, err := json.Marshal(e)
	if err != nil {
		return err
	}
	line = append(line, '\n')

	s.mu.Lock()
	defer s.mu.Unlock()
	f, err := os.OpenFile(s.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600) //nolint:gosec // path is the server's own --audit-file setting
	if err != nil {
		return fmt.Errorf("open audit log: %w", err)
	}
	// The API server and the controller append to the same file: take an
	// exclusive lock so lines from two processes never interleave.
	if err := syscall.Flock(int(f.Fd()), syscall.LOCK_EX); err != nil { //nolint:gosec // fd fits in int
		_ = f.Close()
		return fmt.Errorf("lock audit log: %w", err)
	}
	if _, err := f.Write(line); err != nil {
		_ = f.Close()
		return fmt.Errorf("write audit log: %w", err)
	}
	if err := f.Sync(); err != nil {
		_ = f.Close()
		return fmt.Errorf("sync audit log: %w", err)
	}
	return f.Close()
}

// List reads the whole file, merges attempts with outcomes and filters.
// Fine for a local, human-rate log; a database-backed Store replaces it
// when volumes grow.
func (s *FileStore) List(ctx context.Context, f Filter) ([]Record, error) {
	s.mu.Lock()
	file, err := os.Open(s.path) //nolint:gosec // path is the server's own --audit-file setting
	s.mu.Unlock()
	if err != nil {
		return nil, fmt.Errorf("open audit log: %w", err)
	}
	defer file.Close() //nolint:errcheck // read-only

	byID := map[string]*Record{}
	var order []string
	sc := bufio.NewScanner(file)
	sc.Buffer(make([]byte, 64*1024), maxLineBytes)
	for sc.Scan() {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		var e Entry
		if json.Unmarshal(sc.Bytes(), &e) != nil || e.ID == "" {
			continue // a torn or foreign line must not hide the rest
		}
		r, ok := byID[e.ID]
		if !ok {
			r = &Record{ID: e.ID, Result: ResultUnknown}
			byID[e.ID] = r
			order = append(order, e.ID)
		}
		merge(r, e)
	}
	if err := sc.Err(); err != nil {
		return nil, fmt.Errorf("read audit log: %w", err)
	}

	out := make([]Record, 0, len(order))
	for _, id := range order {
		if r := byID[id]; matches(r, f) {
			out = append(out, *r)
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Time.After(out[j].Time) })

	limit := f.Limit
	if limit <= 0 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	if len(out) > limit {
		out = out[:limit]
	}
	return out, nil
}

func merge(r *Record, e Entry) {
	if r.Time.IsZero() || e.Phase == PhaseAttempted {
		r.Time = e.Time
		r.User, r.Cluster, r.Namespace = e.User, e.Cluster, e.Namespace
		r.Kind, r.Name, r.Action, r.Ref = e.Kind, e.Name, e.Action, e.Ref
	}
	if e.Phase == PhaseCompleted {
		t := e.Time
		r.CompletedAt = &t
		r.Result = e.Result
		r.Detail = e.Detail
	}
}

func matches(r *Record, f Filter) bool {
	switch {
	case f.Cluster != "" && r.Cluster != f.Cluster,
		f.Namespace != "" && r.Namespace != f.Namespace,
		f.User != "" && r.User != f.User,
		f.Action != "" && r.Action != f.Action,
		f.Result != "" && r.Result != f.Result,
		!f.Before.IsZero() && !r.Time.Before(f.Before):
		return false
	}
	return true
}
