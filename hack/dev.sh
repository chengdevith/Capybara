#!/usr/bin/env bash
# Runs the Go API server and the Vite dev server together. Ctrl-C stops both.
set -euo pipefail

cd "$(dirname "$0")/.."

missing=0
for f in .local/kubeconfig/capybara-dev-1.yaml .local/kubeconfig/capybara-dev-2.yaml; do
  [[ -f "$f" ]] || missing=1
done
if [[ $missing == 1 ]]; then
  echo "warning: cluster kubeconfigs missing; run 'make cluster-up' (clusters will show as Error)" >&2
fi

mkdir -p .local/bin
go build -o .local/bin/capybara-server ./cmd/server

pids=()
cleanup() {
  trap - INT TERM EXIT
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

.local/bin/capybara-server &
pids+=($!)

npm --prefix web run dev &
pids+=($!)

echo "==> API http://127.0.0.1:8080  UI http://127.0.0.1:5173  (Ctrl-C to stop)"
# Exit as soon as either process dies, so a crash is not hidden.
wait -n 2>/dev/null || while kill -0 "${pids[0]}" 2>/dev/null && kill -0 "${pids[1]}" 2>/dev/null; do sleep 1; done
