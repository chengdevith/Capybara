#!/usr/bin/env bash
# Pulls a plugin's images on the host, by the digests pinned in
# plugins/<plugin>/images.txt, and imports them into local k3d clusters.
# Nodes never pull (ADR 0002); the chart's tags resolve to the imported
# images (imagePullPolicy IfNotPresent). Only the node's platform is
# exported: with Docker's containerd image store a plain `docker save`
# writes a multi-platform index whose other platforms are missing, which
# the node's containerd refuses (same as deploy/samples/demo.sh).
#
# Usage: hack/plugin-images.sh <plugin> [cluster-id ...]   (default: dev-1 dev-2)
set -euo pipefail
cd "$(dirname "$0")/.."

plugin="${1:?usage: hack/plugin-images.sh <plugin> [cluster-id ...]}"
shift
clusters=("$@")
((${#clusters[@]})) || clusters=(dev-1 dev-2)
list="plugins/${plugin}/images.txt"
[[ -f "$list" ]] || { echo "no image list: $list" >&2; exit 1; }

platform="$(docker version --format '{{.Server.Os}}/{{.Server.Arch}}')"
mkdir -p .local/images
tar=".local/images/plugin-${plugin}-${platform//\//-}.tar"

tags=()
while read -r tag digest; do
  [[ -z "$tag" || "$tag" == \#* ]] && continue
  repo="${tag%:*}"
  docker pull -q --platform "$platform" "${repo}@${digest}" >/dev/null
  docker tag "${repo}@${digest}" "$tag"
  tags+=("$tag")
  echo "    ${tag} (${digest:0:19}…)"
done <"$list"
docker save --platform "$platform" -o "$tar" "${tags[@]}"

for id in "${clusters[@]}"; do
  echo "==> importing ${#tags[@]} images into capybara-${id}"
  k3d image import -c "capybara-${id}" "$tar" >/dev/null
done
