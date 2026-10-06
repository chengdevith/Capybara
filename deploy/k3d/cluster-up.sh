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

echo "==> done. Try: make kubectl CLUSTER=dev-1 ARGS='get pods -A'"
