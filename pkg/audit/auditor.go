package audit

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"regexp"
	"sync/atomic"
	"time"

	"github.com/capybara/capybara/pkg/auth"
)

// ErrUnavailable means the audit log cannot be written, so the action was
// refused. Writes stay refused until the log works again.
var ErrUnavailable = errors.New("audit log unavailable: write actions are disabled until it works again")

// ErrDenied marks an action refused by policy (e.g. a protected namespace).
// Wrap it so the audit records ResultDenied.
var ErrDenied = errors.New("denied")

// Resulter lets an error choose its audit result (e.g. apply conflicts).
type Resulter interface {
	AuditResult() Result
}

// OutcomeNotRecordedError means the action ran but its outcome could not
// be written. The attempt is in the log; the outcome is in the server log.
type OutcomeNotRecordedError struct {
	ActionErr error // nil if the action itself succeeded
	AuditErr  error
}

func (e *OutcomeNotRecordedError) Error() string {
	state := "succeeded"
	if e.ActionErr != nil {
		state = "failed (" + e.ActionErr.Error() + ")"
	}
	return fmt.Sprintf("action %s but its outcome could not be audited: %v", state, e.AuditErr)
}

func (e *OutcomeNotRecordedError) Unwrap() error { return e.ActionErr }

// Op identifies what an action touches.
type Op struct {
	Cluster, Namespace, Kind, Name, Action string
	// Sensitive (e.g. Secrets): quoted values are removed from details,
	// because Kubernetes error messages can echo submitted values.
	Sensitive bool
	// Ref links this entry to a related one (see Entry.Ref).
	Ref string
}

type idKey struct{}

// IDFrom returns the ID of the audit entry whose action is running in ctx
// (inside Do), so the action can reference it (e.g. store it on an object).
func IDFrom(ctx context.Context) string {
	id, _ := ctx.Value(idKey{}).(string)
	return id
}

// Auditor wraps actions with attempted/completed entries.
type Auditor struct {
	rec     Recorder
	logger  *slog.Logger
	now     func() time.Time
	lastErr atomic.Pointer[string]
}

// NewAuditor returns an Auditor writing to rec.
func NewAuditor(rec Recorder, logger *slog.Logger) *Auditor {
	return &Auditor{rec: rec, logger: logger, now: time.Now}
}

// Healthy returns the last audit write error, or nil if the last write worked.
func (a *Auditor) Healthy() error {
	if p := a.lastErr.Load(); p != nil {
		return errors.New(*p)
	}
	return nil
}

func (a *Auditor) write(ctx context.Context, e Entry) error {
	err := a.rec.Record(ctx, e)
	if err != nil {
		msg := err.Error()
		a.lastErr.Store(&msg)
		a.logger.Error("audit write failed", "id", e.ID, "phase", e.Phase, "action", e.Action, "err", err)
	} else {
		a.lastErr.Store(nil)
	}
	return err
}

// Do records the attempt, runs fn, then records the outcome. fn returns a
// short, safe description of what it did (e.g. "replicas 2 → 3").
func (a *Auditor) Do(ctx context.Context, op Op, fn func(context.Context) (string, error)) error {
	e := a.entry(ctx, op)
	e.Phase = PhaseAttempted
	if err := a.write(ctx, e); err != nil {
		return fmt.Errorf("%w: %w", ErrUnavailable, err)
	}

	detail, actionErr := fn(context.WithValue(ctx, idKey{}, e.ID))

	done := e
	done.Phase = PhaseCompleted
	done.Time = a.now().UTC()
	done.Result = ResultOf(actionErr)
	done.Detail = detail
	if actionErr != nil {
		done.Detail = Sanitize(actionErr.Error(), op.Sensitive)
	}
	// The outcome must be written even if the request was cancelled.
	if err := a.write(context.WithoutCancel(ctx), done); err != nil {
		a.logger.Error("action outcome not audited", "id", e.ID, "action", op.Action, "result", done.Result)
		return &OutcomeNotRecordedError{ActionErr: actionErr, AuditErr: err}
	}
	return actionErr
}

// Event records something that is not a write action in itself (e.g. a
// terminal session closing) as a single completed entry.
func (a *Auditor) Event(ctx context.Context, op Op, result Result, detail string) error {
	e := a.entry(ctx, op)
	e.Phase = PhaseCompleted
	e.Result = result
	e.Detail = Sanitize(detail, op.Sensitive)
	return a.write(context.WithoutCancel(ctx), e)
}

func (a *Auditor) entry(ctx context.Context, op Op) Entry {
	user := "unknown"
	if u, ok := auth.UserFrom(ctx); ok {
		user = u.Name
	}
	now := a.now().UTC()
	return Entry{
		ID: newID(now), Time: now, User: user,
		Cluster: op.Cluster, Namespace: op.Namespace, Kind: op.Kind, Name: op.Name, Action: op.Action,
		Ref: op.Ref,
	}
}

// ResultOf maps an action error to an audit result.
func ResultOf(err error) Result {
	var r Resulter
	switch {
	case err == nil:
		return ResultSuccess
	case errors.Is(err, ErrDenied):
		return ResultDenied
	case errors.As(err, &r):
		return r.AuditResult()
	default:
		return ResultFailure
	}
}

const maxDetail = 500

var quoted = regexp.MustCompile(`"(?:[^"\\]|\\.)*"|'[^']*'`)

// Sanitize bounds a detail message and, when sensitive, removes quoted
// values that Kubernetes errors may echo back.
func Sanitize(s string, sensitive bool) string {
	if sensitive {
		s = quoted.ReplaceAllString(s, `"[redacted]"`)
	}
	if len(s) > maxDetail {
		s = s[:maxDetail] + "…"
	}
	return s
}

func newID(t time.Time) string {
	var b [4]byte
	_, _ = rand.Read(b[:])
	return fmt.Sprintf("%x-%s", t.UnixNano(), hex.EncodeToString(b[:]))
}
