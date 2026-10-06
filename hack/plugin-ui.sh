#!/usr/bin/env bash
# Builds a plugin's UI bundle reproducibly (pinned Node, lockfile, exact
# versions) and pins its sha256 in plugins/<plugin>/plugin.yaml.
#
#   hack/plugin-ui.sh build <plugin>   build dist/ and update the pin
#   hack/plugin-ui.sh check <plugin>   rebuild elsewhere; fail unless the
#                                      bytes equal the committed dist and the pin
set -euo pipefail
cd "$(dirname "$0")/.."

cmd="${1:?usage: hack/plugin-ui.sh build|check <plugin>}"
plugin="${2:?usage: hack/plugin-ui.sh build|check <plugin>}"
ui="plugins/${plugin}/ui"
manifest="plugins/${plugin}/plugin.yaml"
bundle="$(sed -n 's/^  bundle: ui\///p' "$manifest")"

[[ -d "${ui}/node_modules" ]] || (cd "$ui" && npm ci --no-audit --no-fund >/dev/null)
pinned="$(sed -n '/^ui:/,/^[a-z]/s/^  sha256: "\{0,1\}\([0-9a-f]\{64\}\)"\{0,1\}/\1/p' "$manifest")"

case "$cmd" in
  build)
    (cd "$ui" && npm run --silent build >/dev/null)
    sum="$(shasum -a 256 "${ui}/${bundle}" | cut -d' ' -f1)"
    sed -i.bak "/^ui:/,/^[a-z]/s/^  sha256: .*/  sha256: ${sum}/" "$manifest" && rm -f "${manifest}.bak"
    echo "==> ${ui}/${bundle}: sha256 ${sum} (pinned in ${manifest})"
    ;;
  check)
    tmp="$(mktemp -d)"
    trap 'rm -rf "$tmp"' EXIT
    (cd "$ui" && node scripts/check-node.mjs && npx --no-install vite build --outDir "$tmp" --emptyOutDir >/dev/null)
    built="$(shasum -a 256 "${tmp}/$(basename "$bundle")" | cut -d' ' -f1)"
    committed="$(shasum -a 256 "${ui}/${bundle}" | cut -d' ' -f1)"
    if [[ "$built" != "$pinned" || "$committed" != "$pinned" ]]; then
      echo "${plugin} UI bundle is not reproducible from source: built ${built}, committed ${committed}, pinned ${pinned}" >&2
      echo "run: make plugin-ui PLUGIN=${plugin}" >&2
      exit 1
    fi
    ;;
  *) echo "unknown command $cmd" >&2; exit 1 ;;
esac
