# Capybara

Multi-cluster Kubernetes management platform. See [CLAUDE.md](CLAUDE.md) for
the product brief and roadmap, and [docs/](docs/) for architecture and decisions.

## Quick start

Requirements: Go 1.27+, Node 22+, Docker (running), k3d, kubectl.

```sh
make cluster-up   # k3d clusters capybara-mgmt, capybara-dev-1, capybara-dev-2
make demo         # optional: demo workload in namespace capybara-demo
make dev          # API on 127.0.0.1:8080, UI on http://127.0.0.1:5173
```

`make cluster-up` also installs the CRDs into capybara-mgmt and registers
dev-1 and dev-2 there with least-privilege ServiceAccount kubeconfigs
(30-day tokens). `make dev` runs the API server, the controller and the UI.
Add, edit or remove clusters on the Clusters page (`/clusters`); make a
kubeconfig for one with `make sa-kubeconfig CLUSTER=dev-2 [WITH_SECRETS=1]`.

Other targets: `make test`, `make lint`, `make e2e` (browser tests; needs the
clusters), `make generate` (CRD and deepcopy code from `api/`), `make crds`,
`make project-sizes` (load Project size presets into capybara-mgmt),
`make plugin-images` (import a plugin's pinned images into k3d),
`make plugin-ui` (rebuild a plugin's UI bundle and pin its sha256; needs
the Node version in `plugins/<plugin>/ui/.nvmrc`),
`make demo-clean`, `make cluster-down`, and
`make kubectl CLUSTER=dev-1 ARGS="get pods -A"`. Run `make help` for all.

Kubeconfigs are written to `.local/kubeconfig/` (git-ignored), one file per
cluster. Nothing reads or writes `~/.kube/config` or the current kubectl
context. Inside Capybara, cluster kubeconfigs live only in Secrets in
capybara-mgmt and are never returned by the API.

## Plugins

Plugins are in the Marketplace (`/marketplace`). Installing one on a cluster
needs that cluster's installer credential (cluster page → Plugin installs),
for example:

```sh
make plugin-images                                   # once: images into k3d
hack/capybara-sa.sh dev-1 --installer monitoring     # install mode (broad)
hack/capybara-sa.sh dev-2 --installer monitoring --connect \
  --set namespace=monitoring --set service=prometheus --set port=9090
```

then upload `.local/kubeconfig/capybara-<id>-installer.yaml` on the
cluster's page. `deploy/samples/prometheus-connect.yaml` is a hand-installed
Prometheus to try Connect existing with. See docs/decisions/0006.
