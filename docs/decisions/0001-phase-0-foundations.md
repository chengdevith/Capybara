# 0001: Phase 0 foundations

Date: 2026-10-06. Status: accepted.

## Decisions

1. **One kubeconfig file per cluster in `.local/kubeconfig/`.** k3d runs with
   `--kubeconfig-update-default=false --kubeconfig-switch-context=false`, and
   the scripts, Makefile and server only use these files. `.local/` is
   git-ignored before anything is written, and the script checks it.
2. **Static cluster list (`deploy/clusters.yaml`) until Phase 4.** It maps
   cluster id to kubeconfig path, with paths relative to the file. Phase 4
   replaces it with the Cluster CRD + Secrets behind `cluster.Provider`.
3. **Local-only guard in code**, not just convention: see
   `pkg/cluster/guard.go`.
4. **k3d clusters use `--no-lb` and fixed loopback API ports (6550-6552).**
   The load balancer adds nothing for one server, and its image
   (`ghcr.io/k3d-io/k3d-proxy`) timed out through the local network proxy.
   The fixed loopback ports make kubeconfigs point at 127.0.0.1, which the
   guard requires.
5. **Temporary `GET /api/clusters/{id}/pods`** proves cluster access in
   Phase 0. It is removed in Phase 1 when the passthrough proxy exists.
6. **Go HTTP: stdlib only** (`net/http` patterns, `log/slog`, `flag`).
7. **golangci-lint pinned as a Go tool in `tools/go.mod`**, so its many
   dependencies stay out of the main module. Run via `make lint`.
8. **Go targets are `./cmd/... ./pkg/...`, not `./...`**, because npm
   packages in `web/node_modules` ship Go files. Add `./api/...` when it
   has code.
9. **Module path `github.com/capybara/capybara`** is a placeholder. Rename
   it once the real repository location is known.
10. **npm** is the package manager (pnpm is not installed).
11. **Pages are wired only through the extension registry**, enforced by
    ESLint (see docs/architecture.md).
