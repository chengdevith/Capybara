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

# Before anything else: the bundle's pinned sha256 only reproduces with the
# pinned Node, so a wrong version must say so (not look like a hash mismatch).
want="$(tr -d '[:space:]' <"${ui}/.nvmrc")"
have="$(node -p 'process.versions.node' 2>/dev/null || echo "none")"
if [[ "$have" != "$want" ]]; then
  echo "${plugin} UI: needs Node ${want} (pinned in ${ui}/.nvmrc for reproducible bundles); this is Node ${have}." >&2
  echo "Install and select it, e.g.: nvm install ${want} && nvm use ${want}" >&2
  exit 1
fi

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
    (cd "$ui" && node ../../_ui-build/check-node.mjs && npx --no-install vite build --outDir "$tmp" --emptyOutDir >/dev/null)
    built="$(shasum -a 256 "${tmp}/$(basename "$bundle")" | cut -d' ' -f1)"
    committed="$(shasum -a 256 "${ui}/${bundle}" | cut -d' ' -f1)"
    # Browser bundles must not reference Node globals (process, Buffer,
    # global, require): they throw at runtime.
    (cd "$ui" && node ../../_ui-build/check-bundle.mjs "$bundle")
    if [[ "$built" != "$pinned" || "$committed" != "$pinned" ]]; then
      echo "${plugin} UI bundle is not reproducible from source: built ${built}, committed ${committed}, pinned ${pinned}" >&2
      echo "run: make plugin-ui PLUGIN=${plugin}" >&2
      exit 1
    fi
    ;;
  *) echo "unknown command $cmd" >&2; exit 1 ;;
esac
