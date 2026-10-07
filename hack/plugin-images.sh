#!/usr/bin/env bash
# Pulls a plugin's images on the host, by the digests pinned in
# plugins/<plugin>/images.txt, and imports them into local k3d clusters.
# Nodes never pull (ADR 0002); the chart's references resolve to the
# imported images (imagePullPolicy IfNotPresent). Only the node's platform is
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

# Lines: <reference> <digest> [skip]. A reference may carry the digest
# itself (repo:tag@sha256:… or repo@sha256:…); then it must be the same.
refs=() digests=()
while read -r ref digest flag; do
  [[ -z "$ref" || "$ref" == \#* || "$flag" == skip ]] && continue
  if [[ "$ref" == *@* && "${ref##*@}" != "$digest" ]]; then
    echo "$list: $ref: digest column $digest differs from the reference" >&2; exit 1
  fi
  refs+=("$ref") digests+=("$digest")
done <"$list"

# repo of repo[:tag][@digest] (a registry port is not a tag).
repo_of() {
  local ref="${1%@*}"
  [[ "${ref##*/}" == *:* ]] && echo "${ref%:*}" || echo "$ref"
}
# The name the image is saved and imported under (docker save needs a tag).
tag_of() {
  local ref="${1%@*}"
  [[ "${ref##*/}" == *:* ]] && echo "$ref" || echo "${ref}:pinned"
}
nodes_of() {
  docker ps --format '{{.Names}}' --filter "label=k3d.cluster=capybara-$1" | grep -E -- '-(server|agent)-[0-9]+$'
}

# Skip clusters whose nodes already resolve every reference.
missing=()
for id in "${clusters[@]}"; do
  for node in $(nodes_of "$id"); do
    for ref in "${refs[@]}"; do
      if ! docker exec "$node" crictl inspecti "$ref" >/dev/null 2>&1; then missing+=("$id"); continue 3; fi
    done
  done
done
if ((${#missing[@]} == 0)); then
  echo "==> ${plugin} images already in ${clusters[*]}"
  exit 0
fi
clusters=("${missing[@]}")

tags=()
for i in "${!refs[@]}"; do
  ref="${refs[$i]}" digest="${digests[$i]}"
  tag="$(tag_of "$ref")"
  repo="$(repo_of "$ref")"
  docker pull -q --platform "$platform" "${repo}@${digest}" >/dev/null
  docker tag "${repo}@${digest}" "$tag"
  tags+=("$tag")
  echo "    ${tag} (${digest:0:19}…)"
done
docker save --platform "$platform" -o "$tar" "${tags[@]}"

for id in "${clusters[@]}"; do
  echo "==> importing ${#tags[@]} images into capybara-${id}"
  k3d image import -c "capybara-${id}" "$tar" >/dev/null
  # References pinned by digest name the multi-platform index; the node got
  # only its platform's manifest. Record the reference's name for it, so the
  # kubelet finds the image (IfNotPresent) instead of pulling.
  for node in $(nodes_of "$id"); do
    for i in "${!refs[@]}"; do
      ref="${refs[$i]}"
      [[ "$ref" == *@* ]] || continue
      docker exec "$node" ctr -n k8s.io images tag --force "$(tag_of "$ref")" "$(repo_of "$ref")@${digests[$i]}" >/dev/null
    done
  done
done
