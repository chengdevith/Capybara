#!/usr/bin/env bash
# Creates (or starts) the local k3d clusters and writes one kubeconfig per
# cluster to .local/kubeconfig/<name>.yaml.
#
# Never touches ~/.kube/config or the current kubectl context. Safe to re-run.
set -euo pipefail

# shellcheck source=deploy/k3d/clusters.sh
source "$(dirname "$0")/clusters.sh"

command -v k3d >/dev/null || { echo "k3d not found (brew install k3d)" >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker is not running" >&2; exit 1; }

# Refuse to write credentials anywhere git would pick them up.
if ! git -C "${REPO_ROOT}" check-ignore -q "${KUBECONFIG_DIR}/probe.yaml"; then
  echo "refusing to write kubeconfigs: ${KUBECONFIG_DIR} is not git-ignored" >&2
  exit 1
fi

mkdir -p "${KUBECONFIG_DIR}"
chmod 700 "${KUBECONFIG_DIR}"

for entry in "${CAPYBARA_CLUSTERS[@]}"; do
  name="${entry%%:*}"
  port="${entry##*:}"

  if k3d cluster get "${name}" >/dev/null 2>&1; then
    echo "==> ${name} exists, making sure it is running"
    k3d cluster start "${name}" --wait >/dev/null
  else
    echo "==> creating ${name} (API on 127.0.0.1:${port})"
    k3d cluster create "${name}" \
      --servers 1 --agents 0 \
      --no-lb \
      --api-port "127.0.0.1:${port}" \
      --k3s-arg "--disable=traefik@server:*" \
      --kubeconfig-update-default=false \
      --kubeconfig-switch-context=false \
      --wait
  fi

  out="$(kubeconfig_path "${name}")"
  (umask 077 && k3d kubeconfig get "${name}" >"${out}.tmp")
  mv "${out}.tmp" "${out}"
  echo "    kubeconfig: ${out#"${REPO_ROOT}"/}"
done

# Wait until every API server answers. After a Docker restart k3s can come
# back with a stale node IP and stop itself; one stop/start fixes that.
for entry in "${CAPYBARA_CLUSTERS[@]}"; do
  name="${entry%%:*}"
  kc="$(kubeconfig_path "${name}")"
  ready=false
  for attempt in 1 2; do
    for _ in $(seq 1 45); do
      if kubectl --kubeconfig "${kc}" get --raw /readyz >/dev/null 2>&1; then ready=true; break; fi
      sleep 2
    done
    $ready && break
    echo "==> ${name} is not answering; restarting it once"
    k3d cluster stop "${name}" >/dev/null && k3d cluster start "${name}" --wait >/dev/null
  done
  $ready || { echo "${name} did not become ready" >&2; exit 1; }
done

# Capybara's state lives in capybara-mgmt: CRDs, then the managed clusters,
# registered with least-privilege ServiceAccount kubeconfigs (30-day tokens,
# with Secret access for the local clusters). Already registered clusters
# are left alone; rotate credentials from the Clusters page.
mgmt_kc="$(kubeconfig_path capybara-mgmt)"
kubectl --kubeconfig "${mgmt_kc}" apply --server-side -f "${REPO_ROOT}/deploy/crds" >/dev/null
kubectl --kubeconfig "${mgmt_kc}" wait --for condition=established --timeout=60s \
  crd/clusters.platform.capybara.io crd/projects.platform.capybara.io \
  crd/pluginrepositories.platform.capybara.io crd/plugins.platform.capybara.io \
  crd/plugininstallations.platform.capybara.io >/dev/null
kubectl --kubeconfig "${mgmt_kc}" apply --server-side -f "${REPO_ROOT}/deploy/plugin-repositories.yaml" >/dev/null

# Project size presets: created from the repo file if missing; later edits
# (kubectl or make project-sizes) are kept.
if ! kubectl --kubeconfig "${mgmt_kc}" -n capybara-system get configmap capybara-project-sizes >/dev/null 2>&1; then
  kubectl --kubeconfig "${mgmt_kc}" create namespace capybara-system --dry-run=client -o yaml | kubectl --kubeconfig "${mgmt_kc}" apply -f - >/dev/null
  kubectl --kubeconfig "${mgmt_kc}" -n capybara-system create configmap capybara-project-sizes \
    --from-file=sizes.yaml="${REPO_ROOT}/deploy/project-sizes.yaml" >/dev/null
  echo "==> project size presets ConfigMap created"
fi

register=()
for id in dev-1 dev-2; do
  if kubectl --kubeconfig "${mgmt_kc}" get cluster.platform.capybara.io "${id}" >/dev/null 2>&1; then
    echo "==> ${id} already registered in capybara-mgmt"
    continue
  fi
  "${REPO_ROOT}/hack/capybara-sa.sh" "${id}" --with-secrets
  register+=("${id}=${REPO_ROOT}/.local/kubeconfig/capybara-${id}-sa.yaml")
done
if ((${#register[@]})); then
  (cd "${REPO_ROOT}" && go run ./cmd/bootstrap "${register[@]}")
fi

echo "==> done. Try: make kubectl CLUSTER=dev-1 ARGS='get pods -A'"
