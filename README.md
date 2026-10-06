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

`make dev` also installs the Project CRD into capybara-mgmt and runs the
controller.

Other targets: `make test`, `make lint`, `make e2e` (browser tests; needs the
clusters), `make generate` (CRD and deepcopy code from `api/`), `make crds`,
`make demo-clean`, `make cluster-down`, and
`make kubectl CLUSTER=dev-1 ARGS="get pods -A"`. Run `make help` for all.

Kubeconfigs are written to `.local/kubeconfig/<cluster>.yaml` (git-ignored),
one file per cluster. Nothing reads or writes `~/.kube/config` or the current
kubectl context.
