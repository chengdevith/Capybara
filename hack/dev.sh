#!/usr/bin/env bash
# Runs the API server, the controller and the Vite dev server together.
# Ctrl-C stops all of them.
set -euo pipefail

cd "$(dirname "$0")/.."

missing=0
for f in .local/kubeconfig/capybara-dev-1.yaml .local/kubeconfig/capybara-dev-2.yaml .local/kubeconfig/capybara-mgmt.yaml; do
  [[ -f "$f" ]] || missing=1
done
if [[ $missing == 1 ]]; then
  echo "warning: cluster kubeconfigs missing; run 'make cluster-up' (clusters will show as Error, Projects disabled)" >&2
fi

mkdir -p .local/bin
go build -o .local/bin/capybara-server ./cmd/server
go build -o .local/bin/capybara-controller ./cmd/controller

# The controller needs its CRDs in capybara-mgmt.
if [[ -f .local/kubeconfig/capybara-mgmt.yaml ]]; then
  kubectl --kubeconfig .local/kubeconfig/capybara-mgmt.yaml apply --server-side -f deploy/crds >/dev/null
  kubectl --kubeconfig .local/kubeconfig/capybara-mgmt.yaml wait --for condition=established --timeout=60s \
    crd/pluginrepositories.platform.capybara.io >/dev/null
  kubectl --kubeconfig .local/kubeconfig/capybara-mgmt.yaml apply --server-side -f deploy/plugin-repositories.yaml >/dev/null
fi

pids=()
cleanup() {
  trap - INT TERM EXIT
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

.local/bin/capybara-server &
pids+=($!)

if [[ -f .local/kubeconfig/capybara-mgmt.yaml ]]; then
  .local/bin/capybara-controller &
  pids+=($!)
fi

npm --prefix web run dev &
pids+=($!)

echo "==> API http://127.0.0.1:8080  UI http://127.0.0.1:5173  controller running  (Ctrl-C to stop)"

# Exit as soon as any process dies, so a crash is not hidden.
all_alive() {
  for pid in "${pids[@]}"; do kill -0 "$pid" 2>/dev/null || return 1; done
}
while all_alive; do sleep 1; done
