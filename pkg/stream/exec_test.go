package stream

import (
	"bufio"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"
	"k8s.io/client-go/util/exec"

	"github.com/capybara/capybara/pkg/audit"
	"github.com/capybara/capybara/pkg/auth"
	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/cluster/clustertest"
)

// fakeShell echoes each input line and exits on "exit N".
type fakeShell struct {
	urls    chan *url.URL
	sizes   chan remotecommand.TerminalSize
	stopped chan error // the context error when the session was ended for us
}

func (f *fakeShell) factory(_ *rest.Config, u *url.URL) (remotecommand.Executor, error) {
	f.urls <- u
	return f, nil
}

func (f *fakeShell) Stream(o remotecommand.StreamOptions) error {
	return f.StreamWithContext(context.Background(), o)
}

func (f *fakeShell) StreamWithContext(ctx context.Context, o remotecommand.StreamOptions) error {
	go func() {
		for s := o.TerminalSizeQueue.Next(); s != nil; s = o.TerminalSizeQueue.Next() {
			f.sizes <- *s
		}
	}()
	lines := make(chan string)
	go func() {
		sc := bufio.NewScanner(o.Stdin)
		sc.Split(scanCR)
		for sc.Scan() {
			lines <- sc.Text()
		}
		close(lines)
	}()
	_, _ = o.Stdout.Write([]byte("$ "))
	for {
		select {
		case <-ctx.Done():
			f.stopped <- ctx.Err()
			return ctx.Err()
		case l, ok := <-lines:
			if !ok {
				return nil
			}
			if strings.HasPrefix(l, "exit ") {
				return exec.CodeExitError{Err: errExit, Code: int(l[5] - '0')}
			}
			_, _ = o.Stdout.Write([]byte("echo: " + l + "\r\n$ "))
		}
	}
}

var errExit = &exitErr{}

type exitErr struct{}

func (*exitErr) Error() string { return "exit" }

func scanCR(data []byte, atEOF bool) (int, []byte, error) {
	if i := strings.IndexByte(string(data), '\r'); i >= 0 {
		return i + 1, data[:i], nil
	}
	if atEOF && len(data) > 0 {
		return len(data), data, nil
	}
	return 0, nil, nil
}

type execFixture struct {
	provider  *clustertest.Provider
	srv       *httptest.Server
	shell     *fakeShell
	auditPath string
	store     *audit.FileStore
}

func newExecFixture(t *testing.T, idle, maxDur time.Duration) *execFixture {
	t.Helper()
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{Namespace: "demo", Name: "web"},
		Status: corev1.PodStatus{ContainerStatuses: []corev1.ContainerStatus{
			{Name: "app", State: corev1.ContainerState{Running: &corev1.ContainerStateRunning{}}},
			{Name: "sidecar", State: corev1.ContainerState{Waiting: &corev1.ContainerStateWaiting{Reason: "CrashLoopBackOff"}}},
		}},
	}
	f := &execFixture{
		shell:     &fakeShell{urls: make(chan *url.URL, 1), sizes: make(chan remotecommand.TerminalSize, 4), stopped: make(chan error, 1)},
		auditPath: filepath.Join(t.TempDir(), "audit.jsonl"),
	}
	store, err := audit.NewFileStore(f.auditPath)
	if err != nil {
		t.Fatal(err)
	}
	f.store = store
	f.provider = &clustertest.Provider{
		Infos:   []cluster.Info{{ID: "dev-1"}},
		Clients: map[string]kubernetes.Interface{"dev-1": fake.NewClientset(pod)},
		Configs: map[string]*rest.Config{"dev-1": {Host: "https://127.0.0.1:6551"}},
	}
	h := &ExecHandler{
		Clusters:      f.provider,
		Auditor:       audit.NewAuditor(store, slog.New(slog.DiscardHandler)),
		IdleTimeout:   idle,
		MaxDuration:   maxDur,
		Logger:        slog.New(slog.DiscardHandler),
		NewExecutor:   f.shell.factory,
		CheckInterval: 10 * time.Millisecond,
	}
	mux := http.NewServeMux()
	mux.Handle("/api/clusters/{id}/exec", h)
	f.srv = httptest.NewServer(auth.Middleware(mux))
	t.Cleanup(f.srv.Close)
	return f
}

func (f *execFixture) setLifetime(ctx context.Context) {
	f.provider.Contexts = map[string]context.Context{"dev-1": ctx}
}

func (f *execFixture) dial(t *testing.T, container string) *websocket.Conn {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	conn, resp, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(f.srv.URL, "http")+"/api/clusters/dev-1/exec?namespace=demo&pod=web&container="+container, nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.Body != nil {
		_ = resp.Body.Close()
	}
	t.Cleanup(func() { _ = conn.CloseNow() })
	return conn
}

func send(t *testing.T, conn *websocket.Conn, m ExecMessage) {
	t.Helper()
	raw, _ := json.Marshal(m)
	if err := conn.Write(context.Background(), websocket.MessageText, raw); err != nil {
		t.Fatal(err)
	}
}

// readUntil collects output until a control message arrives or the socket
// closes; it returns the output and the control message (if any).
func readUntil(t *testing.T, conn *websocket.Conn, want string) (string, *ExecMessage) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var out strings.Builder
	for {
		typ, data, err := conn.Read(ctx)
		if err != nil {
			return out.String(), nil
		}
		if typ == websocket.MessageBinary {
			out.Write(data)
			if want != "" && strings.Contains(out.String(), want) {
				return out.String(), nil
			}
			continue
		}
		var m ExecMessage
		_ = json.Unmarshal(data, &m)
		return out.String(), &m
	}
}

func (f *execFixture) records(t *testing.T) []audit.Record {
	t.Helper()
	deadline := time.Now().Add(3 * time.Second)
	for {
		recs, _ := f.store.List(context.Background(), audit.Filter{})
		if len(recs) >= 2 || time.Now().After(deadline) {
			return recs
		}
		time.Sleep(10 * time.Millisecond)
	}
}

func TestExecRoundTripAndExitCode(t *testing.T) {
	f := newExecFixture(t, time.Hour, time.Hour)
	conn := f.dial(t, "app")

	u := <-f.shell.urls
	q := u.Query()
	if q.Get("container") != "app" || q.Get("tty") != "true" || q.Get("stdin") != "true" ||
		strings.Join(q["command"], " ") != strings.Join(ShellCommand, " ") {
		t.Fatalf("exec URL = %s", u)
	}
	if !strings.Contains(ShellCommand[2], "exec bash") || !strings.Contains(ShellCommand[2], "exec sh") {
		t.Fatal("shell command must try bash, then sh")
	}

	send(t, conn, ExecMessage{Type: "stdin", Data: "echo top-secret-keystrokes\r"})
	if out, _ := readUntil(t, conn, "echo: echo top-secret-keystrokes"); !strings.Contains(out, "echo: echo top-secret-keystrokes") {
		t.Fatalf("output = %q", out)
	}
	send(t, conn, ExecMessage{Type: "resize", Cols: 120, Rows: 40})
	if s := <-f.shell.sizes; s.Width != 120 || s.Height != 40 {
		t.Fatalf("size = %+v", s)
	}

	send(t, conn, ExecMessage{Type: "stdin", Data: "exit 3\r"})
	_, m := readUntil(t, conn, "")
	if m == nil || m.Type != "exit" || m.Code != 3 {
		t.Fatalf("control = %+v", m)
	}

	recs := f.records(t) // newest first
	if len(recs) != 2 || recs[1].Action != "exec-open" || recs[1].Result != audit.ResultSuccess ||
		recs[0].Action != "exec-close" || !strings.Contains(recs[0].Detail, "exit 3") || !strings.Contains(recs[0].Detail, "shell exited") {
		t.Fatalf("audit = %+v", recs)
	}
	raw, _ := os.ReadFile(f.auditPath)
	if strings.Contains(string(raw), "top-secret-keystrokes") || strings.Contains(string(raw), "echo:") {
		t.Fatal("keystrokes or output reached the audit log")
	}
}

func TestExecIdleTimeout(t *testing.T) {
	f := newExecFixture(t, 150*time.Millisecond, time.Hour)
	conn := f.dial(t, "app")
	_, m := readUntil(t, conn, "")
	if m == nil || m.Type != "notice" || !strings.Contains(m.Message, "without input") {
		t.Fatalf("control = %+v", m)
	}
	if err := <-f.shell.stopped; err == nil {
		t.Fatal("shell not stopped")
	}
	if recs := f.records(t); !strings.Contains(recs[0].Detail, "idle timeout") {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestExecMaxDuration(t *testing.T) {
	f := newExecFixture(t, 100*time.Millisecond, 150*time.Millisecond)
	conn := f.dial(t, "app")
	// Keep typing so the idle timeout never fires... well within max.
	go func() {
		for i := 0; i < 20; i++ {
			raw, _ := json.Marshal(ExecMessage{Type: "stdin", Data: "x"})
			if conn.Write(context.Background(), websocket.MessageText, raw) != nil {
				return
			}
			time.Sleep(20 * time.Millisecond)
		}
	}()
	<-f.shell.stopped
	if recs := f.records(t); !strings.Contains(recs[0].Detail, "max duration reached") {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestExecEndsWhenTheBrowserLeaves(t *testing.T) {
	f := newExecFixture(t, time.Hour, time.Hour)
	conn := f.dial(t, "app")
	<-f.shell.urls
	readUntil(t, conn, "$ ")
	_ = conn.Close(websocket.StatusGoingAway, "navigated away")

	select {
	case <-f.shell.stopped:
	case <-time.After(5 * time.Second):
		t.Fatal("shell still running after the browser left")
	}
	if recs := f.records(t); recs[0].Action != "exec-close" || !strings.Contains(recs[0].Detail, "closed by the user") {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestExecRefusesStoppedContainer(t *testing.T) {
	f := newExecFixture(t, time.Hour, time.Hour)
	conn := f.dial(t, "sidecar")
	_, m := readUntil(t, conn, "")
	if m == nil || m.Type != "error" || !strings.Contains(m.Message, "not running") {
		t.Fatalf("control = %+v", m)
	}
	select {
	case <-f.shell.urls:
		t.Fatal("executor created for a stopped container")
	default:
	}
	recs, _ := f.store.List(context.Background(), audit.Filter{})
	if len(recs) != 1 || recs[0].Action != "exec-open" || recs[0].Result != audit.ResultFailure {
		t.Fatalf("audit = %+v", recs)
	}
}

func TestExecRefusedWhenAuditUnavailable(t *testing.T) {
	if os.Getuid() == 0 {
		t.Skip("root ignores file permissions")
	}
	f := newExecFixture(t, time.Hour, time.Hour)
	if err := os.Chmod(f.auditPath, 0o400); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(f.auditPath, 0o600) })
	conn := f.dial(t, "app")
	_, m := readUntil(t, conn, "")
	if m == nil || m.Type != "error" || !strings.Contains(m.Message, "audit log unavailable") {
		t.Fatalf("control = %+v", m)
	}
	select {
	case <-f.shell.urls:
		t.Fatal("a shell started without an audit entry")
	default:
	}
}
