#!/usr/bin/env bash
# Deploys (up) or removes (clean) the demo workload on the dev clusters.
#
# The image is pulled once on the host and imported into the clusters, so
# nodes never pull it themselves (no proxy, no Docker Hub rate limits).
# Only the node's platform is exported: with Docker's containerd image store
# a plain `docker save` writes a multi-platform index whose other platforms
# have no layers, which containerd treats as incomplete and re-pulls.
set -euo pipefail

cd "$(dirname "$0")/../.."
IMAGE="busybox:1.36"
CLUSTERS=(dev-1 dev-2)
MANIFEST="deploy/samples/demo.yaml"

kc() { kubectl --kubeconfig ".local/kubeconfig/capybara-$1.yaml" "${@:2}"; }

up() {
  local platform tar
  platform="$(docker version --format '{{.Server.Os}}/{{.Server.Arch}}')"
  tar=".local/images/$(echo "${IMAGE}" | tr ':/' '__')-${platform//\//-}.tar"

  docker image inspect "${IMAGE}" >/dev/null 2>&1 || docker pull --platform "${platform}" "${IMAGE}"
  mkdir -p .local/images
  docker save --platform "${platform}" -o "${tar}" "${IMAGE}"

  local args=()
  for c in "${CLUSTERS[@]}"; do args+=(-c "capybara-${c}"); done
  k3d image import "${tar}" "${args[@]}"

  for c in "${CLUSTERS[@]}"; do
    echo "==> ${c}"
    kc "${c}" apply -f "${MANIFEST}"
  done
}

clean() {
  for c in "${CLUSTERS[@]}"; do
    echo "==> ${c}"
    kc "${c}" delete -f "${MANIFEST}" --ignore-not-found
  done
}

case "${1:-}" in
  up) up ;;
  clean) clean ;;
  *) echo "usage: $0 up|clean" >&2; exit 2 ;;
esac
