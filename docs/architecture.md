# Architecture (as built)

Status: end of Phase 4 (Multi-cluster). CLAUDE.md is the target design; this
file records what exists and how the pieces fit.

## Local clusters

`make cluster-up` (deploy/k3d/) creates three single-server k3d clusters:

| k3d cluster      | API                    | Used by Capybara as |
|------------------|------------------------|---------------------|
| capybara-mgmt    | https://127.0.0.1:6550 | Capybara's state: CRDs, Clusters, Projects, kubeconfig Secrets, size presets |
| capybara-dev-1   | https://127.0.0.1:6551 | cluster `dev-1`     |
| capybara-dev-2   | https://127.0.0.1:6552 | cluster `dev-2`     |

Each admin kubeconfig is written to `.local/kubeconfig/<k3d-name>.yaml`
(mode 600) for the host tools only. The script refuses to write if `.local/`
is not git-ignored. It then installs the CRDs and the size-presets ConfigMap
in capybara-mgmt and registers dev-1 and dev-2 with least-privilege
ServiceAccount kubeconfigs (`hack/capybara-sa.sh --with-secrets`, 30-day
tokens) through `cmd/bootstrap`, which records one audit entry as user
`bootstrap`. Re-running leaves registered clusters alone.

`make demo` deploys `deploy/samples/demo.yaml` (namespace `capybara-demo`:
a 2-replica busybox Deployment that logs every 3s and serves HTTP, a
Service, a ConfigMap and a clearly fake Secret) to dev-1 and dev-2. The
image is imported, never pulled by nodes (see ADR 0002). `make demo-clean`
removes it.

## API server (cmd/server)

```
request ─▶ logRequests ─▶ /healthz
                       └▶ /api/* ─▶ auth.Middleware (user "dev" in context) ─▶ handlers
handlers ─▶ cluster.Provider ─▶ client-go (typed, dynamic, REST config; cached per cluster)
```

| Endpoint | Package | Notes |
|---|---|---|
| `GET /healthz` | cmd/server | audit log state and Project size presets source |
| `GET /api/clusters` | pkg/cluster | clusters with the health the controller recorded (no cluster calls) |
| `POST /api/clusters/_validate`, `POST /api/clusters/_test` | pkg/cluster | parse / connect with an uploaded kubeconfig; nothing stored |
| `POST /api/clusters`, `PATCH /api/clusters/{id}`, `PUT /api/clusters/{id}/kubeconfig`, `DELETE /api/clusters/{id}?confirm=&abandon=` | pkg/cluster | register, edit, rotate, remove; audited |
| `GET /api/clusters/{id}/overview` | pkg/cluster | status plus counts (null when not permitted) |
| `ANY /api/clusters/{id}/k8s/...` | pkg/proxy | passthrough, **GET only**; Secrets as scrubbed metadata |
| `WS /api/clusters/{id}/watch` | pkg/stream | live events for any resource; Secrets via the metadata client |
| `WS /api/clusters/{id}/logs` | pkg/stream | follows one container's logs |
| `WS /api/clusters/{id}/exec` | pkg/stream | web terminal (audited open/close) |
| `POST /api/clusters/{id}/apply` | pkg/action | server-side apply as `capybara`; `?dryRun`, `?force` |
| `POST /api/clusters/{id}/actions/{scale,restart,delete}` | pkg/action | audited |
| `GET /api/clusters/{id}/secrets/{ns}/{name}` | pkg/action | the only way Secret values leave the server; audited `reveal` |
| `GET /api/clusters/{id}/secrets/summary` | pkg/resource | each Secret's type and key names, never values |
| `GET /api/audit` | pkg/audit | filters, paging |
| `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/{name}` | pkg/project | Projects in capybara-mgmt; writes audited |
| `GET /api/projects/_config`, `WS /api/projects/_watch` | pkg/project | sizes, protected patterns, clusters; live Projects |

- `pkg/config`: flags + `CAPYBARA_*` env; binds `127.0.0.1:8080` by default
  and warns when bound to a non-loopback address.
- `pkg/cluster`: the registry, fed from capybara-mgmt (see Clusters below).
  Handlers depend on the `Provider` interface (`List`, `Client`, `Dynamic`,
  `RESTConfig`, `Context`). `pkg/cluster/clustertest` is the shared fake.
- Local-only guard: uploaded kubeconfigs must point to a loopback server
  (`kubeconfig.go`); the host kubeconfig for capybara-mgmt must also have a
  `k3d-capybara-*` context (`guard.go`) and is loaded from its file only
  (never `KUBECONFIG`, `~/.kube/config` or in-cluster config).
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
- `pkg/httpjson`: shared JSON response helpers.

### Write actions (pkg/action)

The passthrough stays read-only; every change goes through pkg/action, and
every action through the auditor.

- **apply**: server-side apply, field manager `capybara`. The edit must keep
  apiVersion, kind, name and namespace (the editor can never create, rename
  or move objects); `status` and server-owned metadata are stripped;
  `resourceVersion` is kept, so applying an outdated copy fails as *stale*.
  A 409 lists field-manager conflicts (field, manager, subresource);
  `?force=true` is a separate, audited `apply-force`. Dry runs are not audited.
- **scale**: merge patch on the `scale` subresource (any scalable kind).
- **restart**: `spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"]`,
  as `kubectl rollout restart` (Deployments, StatefulSets, DaemonSets).
- **delete**: uid precondition (never deletes a newer object of the same
  name), background propagation. Namespaces matching `--protected-namespaces`
  (default `kube-system, kube-public, kube-node-lease, default, openshift-*`)
  or `--capybara-namespace` are refused and audited as `denied`.

### Audit (pkg/audit)

Fail-closed. `Auditor.Do` writes an **attempted** entry *before* the action
runs; if that write fails the action is refused (503) and nothing reaches
the cluster. After the action, a **completed** entry records the result
(`success`, `failure`, `conflict`, `denied`). Because every action starts
with a write, writes stay refused until the log works again. An action
whose outcome cannot be written returns 500 and the attempt shows as
`unknown`. Refused edits and policy denials are recorded as attempts too.

Storage: JSON Lines at `--audit-file` (default `.local/audit/audit.jsonl`,
mode 600, fsync per entry), behind `Recorder`/`Reader` so it can move to
ELK or a database. The server refuses to start without a writable log.
Entries hold identifiers and short details only; on Secrets, quoted values
are removed from error details.

### Secrets (pkg/sensitive)

Values reach the browser only when a user asks (Reveal or Edit):

- passthrough lists/gets force `Accept: ...;as=PartialObjectMetadata(List)`
  and scrub the response; anything that is not metadata is refused (502);
- watches use the metadata client and are scrubbed the same way;
- scrubbing removes `managedFields` and the
  `kubectl.kubernetes.io/last-applied-configuration` annotation, which
  `kubectl apply` fills with the whole object, values included;
- the reveal endpoint is audited and `Cache-Control: no-store`.

### Terminal (pkg/stream/exec.go)

One exec of `/bin/sh -c '... exec bash || exec sh'` with a TTY, via
client-go's websocket executor with SPDY fallback. Output goes to the
browser as binary frames; input and resize as JSON. The session ends when
the browser leaves, after `--exec-idle-timeout` (15m) without input, or at
`--exec-max-duration` (8h). Audited as `exec-open` (before anything runs;
refused if the container is not running or the audit log is unavailable)
and `exec-close` (duration, exit code, reason). Keystrokes and output are
never recorded. When a session is cut on purpose, client-go reports "use of closed
network connection"; exec sessions pass client-go a logger (via the
context) that logs exactly those messages at debug level.

## Clusters (api/v1alpha1, pkg/cluster, cmd/controller)

```
/clusters UI ─▶ /api/clusters (validated, audited) ─▶ Cluster + kubeconfig Secret in capybara-mgmt
                                                         │ cache (Clusters; Secrets of the kubeconfig type only)
                                                         ▼
                      registry (server and controller): clients per cluster, lifetime per credentials
                         │ events                                   │
                         ▼                                          ▼
          health controller ─▶ Cluster.status          streams (watch/logs/exec) end on rotation/removal
```

- **Cluster** `spec`: displayName, environment (dev/uat/prod),
  kubeconfigSecret. `status`: phase (Pending/Connected/Error), reason
  (Connected, Unreachable, AuthFailed, CredentialsExpired, InvalidKubeconfig,
  SecretMissing, PermissionsLimited), message, version, node count,
  identity, credential expiry, last checked, conditions (Ready, Reachable,
  Authenticated, CredentialsExpiring).
- **Kubeconfig Secrets**: type `platform.capybara.io/kubeconfig`, namespace
  `capybara-system`, owned by the Cluster. Never returned by any API; reveal,
  edit and delete refuse that type on every cluster.
- **Validation** (`ParseKubeconfig`): one inline context/cluster/user, no
  exec/auth-provider/file paths/basic auth/impersonation/proxy, https to
  loopback, no insecure TLS unless `--allow-insecure-kubeconfig`.
- **Health** (`HealthReconciler`): every 30s (`--cluster-check-interval`)
  and immediately on add/rotation. SelfSubjectReview (401 → AuthFailed,
  transport error → Unreachable), version, nodes, expiry warning 7 days ahead
  (`--credential-expiry-warning`).
- **Removal**: type-the-name; refused while Projects use the cluster unless
  their remote resources are abandoned (the Projects are marked, deleted, and
  their finalizer leaves the namespace alone, audited `abandon-remote` linked
  to the removal).
- **Least privilege**: `hack/capybara-sa.sh` / `make sa-kubeconfig` (see
  ADR 0005 for what the role can and cannot do).

## Projects (api/v1alpha1, pkg/project, cmd/controller)

A Project (`platform.capybara.io/v1alpha1`, cluster-scoped, platform-wide
names) lives in **capybara-mgmt**; its resources live in a **managed
cluster**. `make dev` installs the CRD (`deploy/crds`, generated by
`make generate`) and runs the controller next to the API server.

```
browser ─▶ /api/projects (audited) ─▶ Project in capybara-mgmt
                                          │ watched by
                                          ▼
                     cmd/controller ──(cluster registry)──▶ managed cluster
                       finalizer, SSA as capybara-controller,     namespace + quota + limits
                       status: phase, conditions, resources       + 3 NetworkPolicies + RoleBinding
                     ◀── label-filtered informers (drift) ──────
```

- **Resources** (all labelled `platform.capybara.io/project=<name>` and
  annotated with the Project's uid): Namespace, ResourceQuota
  `capybara-project-quota`, LimitRange `capybara-project-limits`,
  NetworkPolicies `capybara-default-deny-ingress`,
  `capybara-allow-same-namespace`, `capybara-allow-from-ingress` (no egress
  rules), RoleBinding `capybara-project-owner` (ClusterRole `admin`, the
  owner as a Group subject).
- **Sizes and ingress sources** come from the ConfigMap
  `capybara-system/capybara-project-sizes` (key `sizes.yaml`; `make
  project-sizes` loads `deploy/project-sizes.yaml` into it). It is validated
  on every change; an invalid one keeps the last good config, and the
  problem shows in `/healthz`, the console banner and a Warning event.
  With no ConfigMap the embedded defaults are used and reported. A valid
  change re-reconciles all Projects. With no ingress sources the allow
  policy has no rules, never an allow-all rule.
- **Drift**: server-side apply as `capybara-controller` with force restores
  managed fields; other managers' fields survive. Per-cluster informers on
  the managed kinds (label-filtered) requeue the owning Project, so drift is
  fixed in about a second; a 10-minute resync is the safety net.
- **Ownership** needs label AND uid. A missing namespace is *created* (not
  applied), so an existing one is never adopted. Not ours: `NamespaceConflict`;
  ours by name but another Project's uid: `StaleOwner`; protected:
  `ProtectedNamespace`.
- **Unreachable cluster**: `ClusterReachable=False`, `Ready=False
  (ClusterUnreachable)`, retried with per-Project backoff; 4 workers, so
  other Projects are not blocked.
- **Delete**: the API stores the delete request's audit ID and the user on
  the Project, then deletes it (uid precondition). The finalizer deletes the
  namespace only if it is provably the Project's and not protected (audited
  fail-closed as `delete-namespace`, linked by `ref`), waits until it is
  gone (`namespace-removed`), then releases the Project. Otherwise it keeps
  the namespace and records a `denied` entry saying why.
- **Status**: `phase`, `observedGeneration`, conditions `Ready` (with
  reason) and `ClusterReachable`, and the managed resources.
- The API server and the controller append to the same audit file; each
  write takes an exclusive file lock.

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
| Namespaces | Administration (with a Project column) | `/c/{cluster}/namespaces` |
| Pods | Workloads | `/c/{cluster}/workloads/pods` |
| Deployments | Workloads | `/c/{cluster}/workloads/deployments` |
| Services | Networking | `/c/{cluster}/networking/services` |
| ConfigMaps | Config | `/c/{cluster}/config/configmaps` |
| Secrets | Config | `/c/{cluster}/config/secrets` (`sensitive`) |
| Projects (not a kind) | top level, after Home | `/c/{cluster}/projects`, `/c/{cluster}/projects/{name}` |
| Audit (not a kind) | top level, last | `/c/{cluster}/audit` |

Detail pages: `<list path>/{namespace}/{name}` (or `/{name}` for
cluster-scoped kinds). The detail page watches the one object (field
selector on its name), so changes and deletion show live. The selected tab
is kept in `?tab=`.

Detail tabs (`views/resource-tabs/`):

- **Overview**: metadata, labels, annotations, owners, plus the kind's fields.
- **YAML**: Monaco, loaded in its own chunk on first open; managed fields
  hidden by default. **Edit** → **Review changes** (server dry run, shown as
  a diff) → **Apply**. Conflicts list each field and its owner; **Force
  apply** needs a confirmation. For `sensitive` kinds, values are fetched
  only by **Reveal values** or **Edit**, and **Hide values** drops them.
- **Events**: live, filtered with `involvedObject.uid=<uid>`, newest first,
  at most 100 kept in the browser.
- **Logs** (Pods only): container picker, tail size, previous container,
  timestamps, wrap, follow with "jump to latest"; at most 5000 lines kept.
- **Terminal** (Pods only): xterm.js, running-container picker, resize,
  Reconnect; the session ends when the tab or page is left.

Actions are `resource-action` extensions (dialogs) in an **Actions** menu on
detail pages and a ⋮ menu on list rows: Edit YAML (all kinds), Scale and
Restart rollout (Deployments), Delete (all kinds; `deleteConfirm:
'type-name'` on Deployments, Namespaces, Services and Secrets, a simple
confirmation otherwise). A banner across the app says when the audit log
is failing and writes are disabled (from `/healthz`).

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

### Clusters in the console

`/clusters` (global) lists clusters with environment, health, version,
nodes and credential expiry. Add: paste or pick a kubeconfig, Parse (server
summary), Test connection (identity, version, permission checks,
cluster-admin warning), then id, display name and environment. The detail
page edits, replaces the kubeconfig and removes (type-the-name, lists the
affected Projects, opt-in abandon). Home (`/c/{id}/home`) is the cluster
overview built from `cluster-overview-card` extensions. The top bar shows the
environment; prod adds a red line under the masthead. The cluster list is
polled every 10s. A list the cluster refuses (403) shows "Not permitted on
this cluster".

### Projects in the console

The Projects page lists Projects of the current cluster (or all), live
through `useLiveList`, which accepts any list/watch source. Create shows the
sizes' real numbers and flags protected namespaces; Edit changes size, owner
and display name, and reducing the size shows current quota usage against
the new limits; Delete is type-the-name. The top-bar selector switches
between Namespaces and Projects (a Project stands for its namespace in
`?ns=`). Objects a Project manages say so on their detail page.

## Tests

- `make test`: Go unit tests (fakes for clusters, a real audit file), the
  envtest suites (Project controller with two real kube-apiservers plus an
  unreachable one; cluster registry sync; health reasons; size presets
  ConfigMap; binaries in `.local/envtest`),
  and Vitest (stores, composables, registry, pages with a faked network).
- `make lint`: pipefail check, generated files up to date, golangci-lint,
  ESLint, vue-tsc. Go tools are pinned one module each under `tools/`.
- `make e2e`: Playwright in headless Chromium against `make dev` and the k3d
  clusters (`web/e2e/`). Resets the demo first and only changes
  `capybara-demo`, except the cluster suite: it re-registers dev-2 from a
  fresh ServiceAccount kubeconfig and stops/starts it (health checks every
  5s). Not part of `make test` because it needs the clusters.
  Its server writes audit entries to `.local/audit/e2e.jsonl`.
