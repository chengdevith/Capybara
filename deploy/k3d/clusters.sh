# Shared settings for the k3d scripts. Sourced, not executed.
#
# Each cluster gets a fixed API port bound to 127.0.0.1, so its kubeconfig
# points at loopback and Capybara's local-only guard accepts it.
# Clusters are single-server with --no-lb: the k3d load balancer adds nothing
# for one server and needs an extra image (k3d-proxy) to be pulled.

# name:api-port
CAPYBARA_CLUSTERS=(
  "capybara-mgmt:6550"
  "capybara-dev-1:6551"
  "capybara-dev-2:6552"
)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KUBECONFIG_DIR="${REPO_ROOT}/.local/kubeconfig"

kubeconfig_path() {
  echo "${KUBECONFIG_DIR}/$1.yaml"
}
