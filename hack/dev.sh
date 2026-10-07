#!/usr/bin/env bash
# Runs the API server, the controller, every plugin backend
# (plugins/*/backend, listening on its dev.addr) and the Vite dev server
# together. Ctrl-C stops all of them.
set -euo pipefail

cd "$(dirname "$0")/.."

backends=() addrs=()
for d in plugins/*/backend; do
  [[ -f "$d/go.mod" ]] || continue
  p="$(basename "$(dirname "$d")")"
  [[ -f "$d/dev.addr" ]] || { echo "make dev: $d/dev.addr is missing (the backend's local listen address)" >&2; exit 1; }
  backends+=("$p") addrs+=("$(tr -d '[:space:]' <"$d/dev.addr")")
done

# Refuse before building or touching anything if Capybara already runs
# (another make dev, or make e2e): a second Vite would rewrite the shared
# dependency cache under the running one and break its pages.
busy=()
for port in 8080 5173 "${addrs[@]##*:}"; do
  if owner="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $1 " pid " $2}')" && [[ -n "$owner" ]]; then
    busy+=("${port} (${owner})")
  fi
done
if ((${#busy[@]})); then
  echo "make dev: port(s) already in use: ${busy[*]}" >&2
  echo "Capybara is probably already running (another make dev, or make e2e). Stop it first; nothing was started." >&2
  exit 1
fi

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
# Plugin backends are separate processes, never part of the server.
pairs=()
for i in "${!backends[@]}"; do
  p="${backends[$i]}"
  (cd "plugins/${p}/backend" && go build -o "../../../.local/bin/${p}-backend" .)
  pairs+=("${p}=http://${addrs[$i]}")
done
default_backends="$(IFS=,; echo "${pairs[*]}")"
export CAPYBARA_PLUGIN_BACKENDS="${CAPYBARA_PLUGIN_BACKENDS:-$default_backends}"

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

# Each backend reads the credential the server issues at startup.
for p in "${backends[@]}"; do
  for _ in $(seq 1 50); do [[ -f ".local/plugin-backends/${p}.token" ]] && break; sleep 0.1; done
  .local/bin/"${p}"-backend &
  pids+=($!)
done

if [[ -f .local/kubeconfig/capybara-mgmt.yaml ]]; then
  .local/bin/capybara-controller &
  pids+=($!)
fi

# --force: rebuild Vite's dependency cache at startup, so a server never
# starts from a cache another process left stale (lazy imports then 504).
npm --prefix web run dev -- --force &
pids+=($!)

echo "==> API http://127.0.0.1:8080  UI http://127.0.0.1:5173  controller running  (Ctrl-C to stop)"

# Exit as soon as any process dies, so a crash is not hidden.
all_alive() {
  for pid in "${pids[@]}"; do kill -0 "$pid" 2>/dev/null || return 1; done
}
while all_alive; do sleep 1; done
