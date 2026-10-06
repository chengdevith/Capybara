# Architecture (as built)

Status: end of Phase 0. CLAUDE.md is the target design; this file records
what exists and how the pieces fit.

## Local clusters

`make cluster-up` (deploy/k3d/) creates three single-server k3d clusters:

| k3d cluster      | API                    | Used by Capybara as |
|------------------|------------------------|---------------------|
| capybara-mgmt    | https://127.0.0.1:6550 | not yet (CRDs from Phase 3) |
| capybara-dev-1   | https://127.0.0.1:6551 | cluster `dev-1`     |
| capybara-dev-2   | https://127.0.0.1:6552 | cluster `dev-2`     |

Each kubeconfig is written to `.local/kubeconfig/<k3d-name>.yaml` (mode 600).
The script refuses to write if `.local/` is not git-ignored.

## API server (cmd/server)

```
request ─▶ logRequests ─▶ /healthz
                       └▶ /api/* ─▶ auth.Middleware (user "dev" in context) ─▶ handlers
handlers ─▶ cluster.Provider ─▶ client-go clientset (one per cluster, cached)
```

- `pkg/config`: flags + `CAPYBARA_*` env; binds `127.0.0.1:8080` by default
  and warns when bound to a non-loopback address.
- `pkg/cluster`: registry loaded from `deploy/clusters.yaml`
  (id → kubeconfig path). Clients are built lazily, so a cluster that is
  not up yet shows as `Error` rather than stopping the server. Handlers depend
  on the `Provider` interface, not the file, so Phase 4 can swap the source.
- Local-only guard (`pkg/cluster/guard.go`): a kubeconfig is refused unless its
  context is `k3d-capybara-*`, its server is loopback, and it uses no
  exec/auth-provider plugin or proxy. Kubeconfigs are loaded from their file
  only (never `KUBECONFIG`, `~/.kube/config` or in-cluster config).
- `pkg/auth`: placeholder middleware; handlers read `auth.UserFrom(ctx)`.
- `pkg/audit`: `Recorder` interface + log-only implementation; no callers yet.
- `pkg/httpjson`: shared JSON response helpers.

Endpoints today: `GET /healthz`, `GET /api/clusters` (with a live health
check per cluster), and the **temporary** `GET /api/clusters/{id}/pods`
(`pkg/resource/pods_temporary.go`, removed in Phase 1).

## Web console (web/)

Vue 3 + Vite + Pinia + Vue Router + Naive UI. In dev, Vite proxies `/api`
(including websockets) and `/healthz` to the API server.

### Extension registry (web/src/extensions)

Every menu item, route and detail tab is an extension:

- `types.ts`: extension points (`nav-section`, `nav-item`, `route`,
  `resource-detail-tab`, plus typed stubs for `resource-action`,
  `cluster-overview-card`, `project-overview-card`, `settings-page`) and
  `EXTENSION_API_VERSION`.
- `registry.ts`: register/unregister, reactive, rejects duplicate ids and
  extensions written for a newer API version. `when(ctx)` decides whether an
  extension is active for the current cluster (the hook for "plugin enabled
  on this cluster").
- `resolve.ts`: pure helpers: sidebar tree, detail tabs per kind, landing page.
- `core/`: core registrations, one file per feature area.

Consumers only read the registry:

- `router/index.ts`: declares only structural routes (layout, `/c/:cluster`
  scope, 404) and syncs feature routes from route extensions, including
  ones added or removed at runtime. A route whose `when` fails on the
  current cluster resolves to 404.
- `AppSidebar.vue`: renders `navTree(...)`.

Enforcement: ESLint forbids importing `src/views/*` outside
`src/extensions/**` and calling `addRoute` outside `src/router/**`.

URLs always carry the cluster (`/c/{cluster}/...`); `/` redirects to the
first registered cluster. `ClusterScope` shows "Cluster not found" for an
unknown id.
