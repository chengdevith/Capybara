#!/usr/bin/env bash
# Deletes only the Capybara k3d clusters (by exact name) and their kubeconfigs.
set -euo pipefail

# shellcheck source=deploy/k3d/clusters.sh
source "$(dirname "$0")/clusters.sh"

for entry in "${CAPYBARA_CLUSTERS[@]}"; do
  name="${entry%%:*}"
  if k3d cluster get "${name}" >/dev/null 2>&1; then
    echo "==> deleting ${name}"
    k3d cluster delete "${name}"
  else
    echo "==> ${name} not found, skipping"
  fi
  rm -f "$(kubeconfig_path "${name}")"
done
