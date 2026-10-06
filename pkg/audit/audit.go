// Package audit records every write action, and sensitive reads.
//
// Each action produces two entries sharing an ID: "attempted", written
// BEFORE the action runs, and "completed" with the result. If the attempted
// entry cannot be written the action is refused, so nothing ever runs
// unaudited; because every action starts with that write, writes stay
// refused until the audit log works again. Entries never hold object
// contents or terminal keystrokes.
//
// Storage is behind Recorder/Reader so the JSON Lines file can later be
// replaced by ELK or a database.
package audit

import (
	"context"
	"time"
)

// Phase of an entry.
type Phase string

// Entry phases.
const (
	PhaseAttempted Phase = "attempted"
	PhaseCompleted Phase = "completed"
)

// Result of a completed action.
type Result string

// Action results. ResultUnknown means an attempt has no recorded outcome
// (for example, the server stopped mid-action).
const (
	ResultSuccess  Result = "success"
	ResultFailure  Result = "failure"
	ResultConflict Result = "conflict"
	ResultDenied   Result = "denied"
	ResultUnknown  Result = "unknown"
)

// Entry is one line of the audit log.
type Entry struct {
	ID        string    `json:"id"`
	Time      time.Time `json:"time"`
	Phase     Phase     `json:"phase"`
	User      string    `json:"user"`
	Cluster   string    `json:"cluster"`
	Namespace string    `json:"namespace,omitempty"`
	Kind      string    `json:"kind"`
	Name      string    `json:"name"`
	Action    string    `json:"action"`
	Result    Result    `json:"result,omitempty"`
	Detail    string    `json:"detail,omitempty"`
	// Ref is the ID of a related entry, e.g. the user's delete request
	// that a controller's cleanup carries out.
	Ref string `json:"ref,omitempty"`
}

// Record is one action as shown to users: its attempt merged with its outcome.
type Record struct {
	ID          string     `json:"id"`
	Time        time.Time  `json:"time"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	User        string     `json:"user"`
	Cluster     string     `json:"cluster"`
	Namespace   string     `json:"namespace,omitempty"`
	Kind        string     `json:"kind"`
	Name        string     `json:"name"`
	Action      string     `json:"action"`
	Result      Result     `json:"result"`
	Detail      string     `json:"detail,omitempty"`
	Ref         string     `json:"ref,omitempty"`
}

// Filter narrows a listing. Empty fields match everything.
type Filter struct {
	Cluster, Namespace, User, Action string
	Result                           Result
	// Before returns only records older than this (paging).
	Before time.Time
	Limit  int
}

// Recorder appends entries.
type Recorder interface {
	Record(ctx context.Context, e Entry) error
}

// Reader lists records, newest first.
type Reader interface {
	List(ctx context.Context, f Filter) ([]Record, error)
}

// Store is a Recorder that can also be read.
type Store interface {
	Recorder
	Reader
}
