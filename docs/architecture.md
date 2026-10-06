# Architecture (as built)

Status: end of Phase 1 (read-only, single cluster at a time). CLAUDE.md is
the target design; this file records what exists and how the pieces fit.

## Local clusters

`make cluster-up` (deploy/k3d/) creates three single-server k3d clusters:

| k3d cluster      | API                    | Used by Capybara as |
|------------------|------------------------|---------------------|
| capybara-mgmt    | https://127.0.0.1:6550 | not yet (CRDs from Phase 3) |
| capybara-dev-1   | https://127.0.0.1:6551 | cluster `dev-1`     |
| capybara-dev-2   | https://127.0.0.1:6552 | cluster `dev-2`     |

Each kubeconfig is written to `.local/kubeconfig/<k3d-name>.yaml` (mode 600).
The script refuses to write if `.local/` is not git-ignored.

`make demo` deploys `deploy/samples/demo.yaml` (namespace `capybara-demo`:
a 2-replica busybox Deployment that logs every 3s and serves HTTP, plus a
Service) to dev-1 and dev-2. The image is imported, never pulled by nodes
(see ADR 0002). `make demo-clean` removes it.

## API server (cmd/server)

```
request ─▶ logRequests ─▶ /healthz
                       └▶ /api/* ─▶ auth.Middleware (user "dev" in context) ─▶ handlers
handlers ─▶ cluster.Provider ─▶ client-go (typed, dynamic, REST config; cached per cluster)
```

| Endpoint | Package | Notes |
|---|---|---|
| `GET /healthz` | cmd/server | |
| `GET /api/clusters` | pkg/cluster | live health check per cluster |
| `ANY /api/clusters/{id}/k8s/...` | pkg/proxy | passthrough, **GET only** in Phase 1 |
| `WS /api/clusters/{id}/watch` | pkg/stream | live events for any resource |
| `WS /api/clusters/{id}/logs` | pkg/stream | follows one container's logs |

- `pkg/config`: flags + `CAPYBARA_*` env; binds `127.0.0.1:8080` by default
  and warns when bound to a non-loopback address.
- `pkg/cluster`: registry loaded from `deploy/clusters.yaml`
  (id → kubeconfig path). Clients are built lazily, so a cluster that is
  not up yet shows as `Error` rather than stopping the server. Handlers depend
  on the `Provider` interface (`List`, `Client`, `Dynamic`, `RESTConfig`), so
  Phase 4 can swap the source. `pkg/cluster/clustertest` is the shared fake.
- Local-only guard (`pkg/cluster/guard.go`): a kubeconfig is refused unless its
  context is `k3d-capybara-*`, its server is loopback, and it uses no
  exec/auth-provider plugin or proxy. Kubeconfigs are loaded from their file
  only (never `KUBECONFIG`, `~/.kube/config` or in-cluster config).
- `pkg/proxy`: forwards `/api/...`, `/apis/...` and `/version` with the
  cluster's own credentials. Refuses non-GET methods, protocol upgrades,
  `?watch=true`, and the `exec`, `attach`, `portforward` and `proxy`
  subresources. Strips the browser's `Authorization`, `Cookie` and
  `Impersonate-*` headers, and upstream `Set-Cookie`.
- `pkg/stream`: one upstream stream per websocket, cancelled when the
  browser disconnects; pings every 30s. Same-origin websockets only.
  - watch messages: `{type: ADDED|MODIFIED|DELETED|BOOKMARK, object}`, or
    `{type: ERROR, status}` then a normal close (410 = re-list). A normal
    close without ERROR means "watch ended, resume from your last
    resourceVersion".
  - logs messages: `{type: log, data}` (chunks, may end mid-line),
    `{type: end}`, `{type: error, message}`.
- `pkg/auth`: placeholder middleware; handlers read `auth.UserFrom(ctx)`.
- `pkg/audit`: `Recorder` interface + log-only implementation; no callers yet
  (Phase 2).
- `pkg/httpjson`: shared JSON response helpers.

## Web console (web/)

Vue 3 + Vite + Pinia + Vue Router + Naive UI. In dev, Vite proxies `/api`
(including websockets) and `/healthz` to the API server.

### Extension registry (web/src/extensions)

Every menu item, route and detail tab is an extension:

- `types.ts`: extension points (`nav-section`, `nav-item`, `route`,
  `resource-detail-tab`, plus typed stubs for `resource-action`,
  `cluster-overview-card`, `project-overview-card`, `settings-page`) and
  `EXTENSION_API_VERSION`. A route may name a `parent` route (a detail page's
  list), which keeps that sidebar item highlighted.
- `registry.ts`: register/unregister, reactive, rejects duplicate ids and
  extensions written for a newer API version. `when(ctx)` decides whether an
  extension is active for the current cluster (the hook for "plugin enabled
  on this cluster").
- `resolve.ts`: pure helpers: sidebar tree, detail tabs per kind, landing page.
- `core/`: core registrations, one file per feature area:
  `sections.ts`, `home.ts`, `resources/` (one file per kind), `detail-tabs.ts`.

Consumers only read the registry:

- `router/index.ts`: declares only structural routes (layout, `/c/:cluster`
  scope, 404) and syncs feature routes from route extensions, including
  ones added or removed at runtime. A route whose `when` fails on the
  current cluster resolves to 404.
- `AppSidebar.vue`: renders `navTree(...)`.
- `ResourceDetailView.vue`: renders `detailTabs(...)` for the object's kind.

Enforcement: ESLint forbids importing anything under `src/views/` (pages and
detail tabs) outside `src/extensions/**`, and calling `addRoute` outside
`src/router/**`.

### Resource pages are configuration

A kind is a `ResourceDef` (`components/resource/types.ts`): type
(group/version/plural/kind/namespaced), labels, list path, extra columns,
overview fields and a status function. `registerResource(registry, def, nav)`
registers three extensions: `<id>.list` route, `<id>.detail` route and the
nav item. Both routes use the generic `views/ResourceListView.vue` and
`views/ResourceDetailView.vue` with `{ resource: def }` as props.

| Kind | Sidebar | List path |
|---|---|---|
| Namespaces | top level, after Home (moves to an admin section in Phase 3) | `/c/{cluster}/namespaces` |
| Pods | Workloads | `/c/{cluster}/workloads/pods` |
| Deployments | Workloads | `/c/{cluster}/workloads/deployments` |
| Services | Networking | `/c/{cluster}/networking/services` |

Detail pages: `<list path>/{namespace}/{name}` (or `/{name}` for
cluster-scoped kinds). The detail page watches the one object (field
selector on its name), so changes and deletion show live. The selected tab
is kept in `?tab=`.

Detail tabs (`views/resource-tabs/`):

- **Overview**: metadata, labels, annotations, owners, plus the kind's fields.
- **YAML**: read-only Monaco, loaded in its own chunk on first open; managed
  fields hidden by default. Editing comes in Phase 2.
- **Events**: live, filtered with `involvedObject.uid=<uid>`, newest first,
  at most 100 kept in the browser.
- **Logs** (Pods only): container picker, tail size, previous container,
  timestamps, wrap, follow with "jump to latest"; at most 5000 lines kept.

### Live data

`useLiveList(source, opts)` lists (paginated, 500 per page), then opens the
watch websocket from the list's resourceVersion, applies events by uid, and
batches redraws (100 ms). It reconnects with backoff (1s → 30s) from the
last resourceVersion it saw (bookmarks included) and re-lists on 410. Changing
the source or disposing the component closes everything. `sort` and `max`
let a caller cap what is kept (the Events tab).

The namespace selector in the top bar lists namespaces live; the selection
is the `?ns=` query parameter, kept when moving between pages and dropped
when switching cluster. Switching cluster on a detail page goes to its list.

URLs always carry the cluster (`/c/{cluster}/...`); `/` redirects to the
first registered cluster. `ClusterScope` shows "Cluster not found" for an
unknown id.
