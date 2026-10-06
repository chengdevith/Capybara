# 0005: Phase 4 Multi-cluster

Date: 2026-10-06. Status: accepted.

## Decisions

1. **Clusters are `Cluster` resources in capybara-mgmt** (cluster-scoped;
   the name is the cluster id used in URLs). `deploy/clusters.yaml` is gone.
   The API server and the controller each keep a registry fed by a
   controller-runtime cache: one client set per cluster, rebuilt when the
   kubeconfig changes. Registry events (`Added`, `CredentialsChanged`,
   `InfoChanged`, `Removed`) drive the health controller and stream
   lifetimes.
2. **Kubeconfigs are Secrets of type `platform.capybara.io/kubeconfig`** in
   `capybara-system`, key `kubeconfig`, owned by their Cluster. The caches
   only see Secrets of that type in that namespace. No API returns them.
   On any cluster, Reveal, Edit (apply, including declaring the type) and
   Delete refuse Secrets of that type (403, audited `denied`), and the
   Secret summary hides their key names.
3. **Uploaded kubeconfigs are validated before anything is stored.**
   Exactly one context, cluster and user, all inline. Refused: exec
   credential plugins and auth-provider entries (they would run commands on
   the Capybara server), file paths, basic auth, impersonation, proxy-url,
   non-https servers, and `insecure-skip-tls-verify` (unless the dev-only
   `--allow-insecure-kubeconfig` is set). Parse errors keep only the line
   number. Responses and audit details carry a summary (context, server,
   auth method, identity, expiry), never content.
4. **Local-only guard**: uploads must point to a loopback server. The
   context-name check (`k3d-capybara-*`) now applies only to the host
   kubeconfig for capybara-mgmt. Relaxing this comes after Phase 5, through
   an explicit host/network allowlist, never a blanket flag.
5. **Least-privilege ServiceAccount, not cluster-admin.**
   `hack/capybara-sa.sh` (`make sa-kubeconfig CLUSTER=…`) creates
   `capybara-system/capybara` with ClusterRole `capybara-manager`. That
   role allows browsing, the console's write actions, Project resources and
   `bind` on ClusterRole `admin` only. It grants no writes to ClusterRoles
   or ClusterRoleBindings. Tokens come from `kubectl create token
   --duration=720h` (30 days); there are no long-lived token Secrets.
   Re-running the helper rotates the token. The connection test shows
   which permissions the credentials have and warns about cluster-admin.
6. **RBAC cannot scope namespace deletion by label.** Project
   deletion needs `delete` on namespaces, and RBAC only grants (it cannot
   deny), so the account can delete any namespace on the cluster.
   Capybara's own checks are the only guard: the protected-namespace patterns, plus
   the Project label and uid checks before the finalizer deletes a
   namespace. Changes to those checks need the same care as RBAC changes.
7. **Secret access is opt-in** (`--with-secrets`, `WITH_SECRETS=1`).
   RBAC cannot grant metadata-only listing, so with it the account
   **can read Secret values** on that cluster, and without it it has no
   Secret access at all. In that case the Secrets page says "not permitted
   on this cluster" instead of showing an error. `make cluster-up`
   registers dev-1 and dev-2 with `--with-secrets`.
8. **Health is the controller's job.** A SelfSubjectReview separates
   `AuthFailed` (401) from `Unreachable` (transport errors). The check also
   reads the version, the node count (`PermissionsLimited` when nodes
   cannot be listed) and the expiry from the client certificate or the
   token's `exp`. A `CredentialsExpiring` warning starts 7 days before
   expiry. One global interval (30s, `--cluster-check-interval`). A
   cluster is re-checked immediately when it is added or its credentials
   change. `GET /api/clusters` reads the recorded status and never calls
   the clusters.
9. **Credential rotation restarts streams.** Each credentials version has
   a lifetime context. Watches and logs end with a going-away close giving
   the cause, then the browser resumes with the new clients. A terminal
   session ends with "Session closed: cluster credentials changed".
   Removal closes them the same way, and the controller stops its remote
   informers.
10. **Removal is type-the-name and audited, and refused while Projects use
    the cluster**; the refusal lists them. Choosing "abandon remote
    resources" marks each Project (`abandon-remote`, the removal's audit ID
    and the user) and deletes it. The finalizer then leaves the namespace
    and its resources in place and records `abandon-remote` linked to the
    removal. Registration, edits, rotation and removal are all audited
    fail-closed.
11. **Bootstrap**: `make cluster-up` registers clusters through the same
    code as the API. It records one audit entry as user `bootstrap`
    (`bootstrap-register`) naming the clusters registered. Clusters that
    are already registered are left alone.
12. **Project sizes moved to the ConfigMap `capybara-system/capybara-project-sizes`.**
    An invalid change keeps the last good configuration, reports the
    problem in `/healthz` and the console banner, and emits a Warning event.
    With no ConfigMap, the built-in copy (embedded `deploy/project-sizes.yaml`)
    is used and reported as "using built-in size defaults". A valid change
    re-reconciles every Project.
13. **Console**: `/clusters` is a global page (add, detail, edit, replace
    kubeconfig, remove). Home is the cluster overview, built from
    `cluster-overview-card` extensions (core: Health, Inventory, Projects).
    The top bar shows the environment; prod gets a red tag and a red line
    under the masthead. Clusters in Error stay selectable. `/` with no
    clusters goes to `/clusters`.
