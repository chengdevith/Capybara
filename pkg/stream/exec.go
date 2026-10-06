package stream

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"path"
	"sync"
	"sync/atomic"
	"time"

	"github.com/coder/websocket"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"
	"k8s.io/client-go/util/exec"
	"k8s.io/streaming/pkg/httpstream"

	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/httpjson"
)

// ShellCommand starts bash when the container has it and sh otherwise, in
// one exec (no second round trip). It needs /bin/sh to exist.
var ShellCommand = []string{
	"/bin/sh", "-c",
	`export TERM=xterm-256color; if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi`,
}

// ExecMessage is a control message on the exec websocket. Terminal output
// is sent as binary frames, not as messages.
//
//	browser → server: stdin {data}, resize {cols, rows}
//	server → browser: exit {code}, error {message}, notice {message}
type ExecMessage struct {
	Type    string `json:"type"`
	Data    string `json:"data,omitempty"`
	Cols    uint16 `json:"cols,omitempty"`
	Rows    uint16 `json:"rows,omitempty"`
	Code    int    `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
}

// ExecutorFactory builds a remotecommand executor for an exec URL.
type ExecutorFactory func(cfg *rest.Config, u *url.URL) (remotecommand.Executor, error)

// DefaultExecutor tries the websocket protocol and falls back to SPDY,
// as kubectl does.
func DefaultExecutor(cfg *rest.Config, u *url.URL) (remotecommand.Executor, error) {
	ws, err := remotecommand.NewWebSocketExecutor(cfg, http.MethodGet, u.String())
	if err != nil {
		return nil, err
	}
	spdy, err := remotecommand.NewSPDYExecutor(cfg, http.MethodPost, u)
	if err != nil {
		return nil, err
	}
	return remotecommand.NewFallbackExecutor(ws, spdy, func(err error) bool {
		return httpstream.IsUpgradeFailure(err) || httpstream.IsHTTPSProxyError(err)
	})
}

// ExecHandler serves WS /api/clusters/{id}/exec?namespace&pod&container.
type ExecHandler struct {
	Clusters    cluster.Provider
	Auditor     *audit.Auditor
	IdleTimeout time.Duration
	MaxDuration time.Duration
	Logger      *slog.Logger
	// NewExecutor defaults to DefaultExecutor; tests replace it.
	NewExecutor ExecutorFactory
	// CheckInterval is how often the idle timeout is checked (default 5s).
	CheckInterval time.Duration
}

func (h *ExecHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	ns, pod, container := q.Get("namespace"), q.Get("pod"), q.Get("container")
	if !dnsName.MatchString(ns) || !dnsName.MatchString(pod) || !dnsName.MatchString(container) {
		httpjson.Error(w, http.StatusBadRequest, "namespace, pod and container are required")
		return
	}
	id := r.PathValue("id")
	client, err := h.Clusters.Client(id)
	if !clusterOK(w, err) {
		return
	}
	cfg, err := h.Clusters.RESTConfig(id)
	if !clusterOK(w, err) {
		return
	}

	conn, err := websocket.Accept(w, r, nil)
	if err != nil {
		return
	}
	defer conn.CloseNow() //nolint:errcheck // best effort on exit
	// Keystrokes can be large pastes; allow up to 1 MiB per message.
	conn.SetReadLimit(1 << 20)

	op := audit.Op{Cluster: id, Namespace: ns, Kind: "Pod", Name: pod, Action: "exec-open"}
	ctx := r.Context()

	// Open: audited before anything runs in the container.
	err = h.Auditor.Do(ctx, op, func(ctx context.Context) (string, error) {
		p, err := client.CoreV1().Pods(ns).Get(ctx, pod, metav1.GetOptions{})
		if err != nil {
			return "", err
		}
		if !containerRunning(p, container) {
			return "", fmt.Errorf("container %q is not running in pod %q", container, pod)
		}
		return "container " + container, nil
	})
	if err != nil {
		h.fail(ctx, conn, err.Error())
		return
	}

	started := time.Now()
	execURL, err := ExecURL(cfg.Host, ns, pod, container)
	if err != nil {
		h.fail(ctx, conn, err.Error())
		return
	}
	end := h.session(ctx, conn, execURL, cfg)

	// Close: always recorded, with duration and why it ended. Never content.
	closeOp := op
	closeOp.Action = "exec-close"
	took := time.Since(started).Round(time.Second)
	result := audit.ResultSuccess
	detail := fmt.Sprintf("container %s, %s, exit %d, %s", container, took, end.code, end.reason)
	if end.err != nil {
		result = audit.ResultFailure
		detail = fmt.Sprintf("container %s, %s, %s: %v", container, took, end.reason, end.err)
	}
	if err := h.Auditor.Event(ctx, closeOp, result, detail); err != nil {
		h.Logger.Error("exec close not audited", "cluster", id, "pod", pod, "err", err)
	}

	// Only now tell the browser: the record must not wait on its reply.
	if ctx.Err() != nil {
		return // the browser already left
	}
	switch {
	case end.err != nil:
		h.fail(ctx, conn, "terminal failed: "+end.err.Error())
		return
	case end.notice != "":
		_ = writeJSON(ctx, conn, ExecMessage{Type: "notice", Message: end.notice})
	default:
		_ = writeJSON(ctx, conn, ExecMessage{Type: "exit", Code: end.code})
	}
	_ = conn.Close(websocket.StatusNormalClosure, end.reason)
}

// ExecURL is the pods/exec URL for a TTY shell in one container, with the
// same query parameters `kubectl exec -it` sends.
func ExecURL(host, ns, pod, container string) (*url.URL, error) {
	u, err := url.Parse(host)
	if err != nil {
		return nil, fmt.Errorf("bad cluster host: %w", err)
	}
	u.Path = path.Join("/", u.Path, "api/v1/namespaces", ns, "pods", pod, "exec")
	q := url.Values{}
	q.Set("container", container)
	for _, c := range ShellCommand {
		q.Add("command", c)
	}
	q.Set("stdin", "true")
	q.Set("stdout", "true")
	q.Set("tty", "true")
	u.RawQuery = q.Encode()
	return u, nil
}

func containerRunning(p *corev1.Pod, name string) bool {
	for _, cs := range p.Status.ContainerStatuses {
		if cs.Name == name {
			return cs.State.Running != nil
		}
	}
	return false
}

func (h *ExecHandler) fail(ctx context.Context, conn *websocket.Conn, msg string) {
	_ = writeJSON(ctx, conn, ExecMessage{Type: "error", Message: msg})
	_ = conn.Close(websocket.StatusNormalClosure, "exec refused")
}

// sessionEnd describes how a shell session ended.
type sessionEnd struct {
	reason string // for the audit log
	notice string // for the user, if we ended it
	code   int
	err    error // the shell could not run or broke
}

// session runs one shell until it exits, the browser leaves, or a limit
// is hit. All websocket I/O uses the request context (cancelling a read in
// coder/websocket closes the connection); the session context only stops
// the shell.
func (h *ExecHandler) session(parent context.Context, conn *websocket.Conn, u *url.URL, cfg *rest.Config) sessionEnd {
	newExec := h.NewExecutor
	if newExec == nil {
		newExec = DefaultExecutor
	}
	ex, err := newExec(cfg, u)
	if err != nil {
		return sessionEnd{reason: "could not start", err: err}
	}

	ctx, cancel := context.WithTimeout(parent, h.MaxDuration)
	defer cancel()

	stdinR, stdinW := io.Pipe()
	sizes := newSizeQueue()
	var lastInput atomic.Int64
	lastInput.Store(time.Now().UnixNano())
	var browserLeft, idle atomic.Bool

	// Browser → shell. Ends when the browser leaves or the socket closes.
	go func() {
		defer stdinW.Close() //nolint:errcheck // ends the shell's stdin
		for {
			_, data, err := conn.Read(parent)
			if err != nil {
				browserLeft.Store(true)
				cancel()
				return
			}
			var m ExecMessage
			if json.Unmarshal(data, &m) != nil {
				continue
			}
			switch m.Type {
			case "stdin":
				lastInput.Store(time.Now().UnixNano())
				if _, err := stdinW.Write([]byte(m.Data)); err != nil {
					return // the shell is gone
				}
			case "resize":
				if m.Cols > 0 && m.Rows > 0 {
					sizes.push(remotecommand.TerminalSize{Width: m.Cols, Height: m.Rows})
				}
			}
		}
	}()

	// Idle limit (the maximum is the session context's deadline).
	interval := h.CheckInterval
	if interval <= 0 {
		interval = 5 * time.Second
	}
	go func() {
		t := time.NewTicker(interval)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				if time.Since(time.Unix(0, lastInput.Load())) >= h.IdleTimeout {
					idle.Store(true)
					cancel()
					return
				}
			}
		}
	}()

	err = ex.StreamWithContext(ctx, remotecommand.StreamOptions{
		Stdin:             stdinR,
		Stdout:            &wsWriter{ctx: parent, conn: conn},
		Tty:               true,
		TerminalSizeQueue: sizes,
	})
	sizes.close()
	_ = stdinR.Close()

	end := sessionEnd{}
	var exitErr exec.CodeExitError
	switch {
	case errors.Is(ctx.Err(), context.DeadlineExceeded) && parent.Err() == nil:
		end.reason = "max duration reached"
		end.notice = fmt.Sprintf("Session closed: it reached the %s limit.", h.MaxDuration)
	case idle.Load():
		end.reason = "idle timeout"
		end.notice = fmt.Sprintf("Session closed after %s without input.", h.IdleTimeout)
	case browserLeft.Load() || parent.Err() != nil:
		end.reason = "closed by the user"
	case err == nil:
		end.reason = "shell exited"
	case errors.As(err, &exitErr):
		end.reason = "shell exited"
		end.code = exitErr.Code
	default:
		end.reason = "failed"
		end.err = err
	}
	return end
}

// wsWriter sends terminal output as binary frames (raw bytes, so multi-byte
// characters split across chunks survive).
type wsWriter struct {
	ctx  context.Context
	conn *websocket.Conn
}

func (w *wsWriter) Write(p []byte) (int, error) {
	ctx, cancel := context.WithTimeout(w.ctx, writeTimeout)
	defer cancel()
	if err := w.conn.Write(ctx, websocket.MessageBinary, p); err != nil {
		return 0, err
	}
	return len(p), nil
}

// sizeQueue feeds terminal resizes to the executor.
type sizeQueue struct {
	ch   chan remotecommand.TerminalSize
	once sync.Once
}

func newSizeQueue() *sizeQueue {
	return &sizeQueue{ch: make(chan remotecommand.TerminalSize, 4)}
}

func (q *sizeQueue) push(s remotecommand.TerminalSize) {
	select {
	case q.ch <- s:
	default: // a newer size will follow; never block the reader
	}
}

func (q *sizeQueue) close() { q.once.Do(func() { close(q.ch) }) }

// Next implements remotecommand.TerminalSizeQueue; nil ends resizing.
func (q *sizeQueue) Next() *remotecommand.TerminalSize {
	s, ok := <-q.ch
	if !ok {
		return nil
	}
	return &s
}
