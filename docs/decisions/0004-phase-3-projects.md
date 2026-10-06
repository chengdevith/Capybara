# 0004: Phase 3 Projects

Date: 2026-10-06. Status: accepted.

## Decisions

1. **Projects are cluster-scoped objects in capybara-mgmt with
   platform-wide names**, each targeting one managed cluster. A Project
   spanning several clusters (one namespace per cluster, one owner and
   quota policy) is a possible later design; it would change the spec, not
   the controller's structure.
2. **Ownership needs the project label AND the Project's uid annotation.**
   A namespace with the label but another uid belongs to an earlier Project
   of the same name: `StaleOwner`, never adoption. Missing namespaces are
   created (not applied), so one that appears in the meantime is not
   adopted either. The finalizer checks label, uid and the protected list
   before deleting anything.
3. **The controller applies with its own field manager
   (`capybara-controller`) and forces ownership** of the fields it manages;
   console edits use `capybara`, so editing a managed field conflicts
   instead of being silently reverted later.
4. **Drift is caught by label-filtered informers in each managed cluster**,
   requeueing the owning Project through a channel source; a 10-minute
   resync is only a safety net. An unreachable cluster retries in its own
   informers and, for reconciles, with per-Project backoff and 4 workers.
5. **Owner is a group** bound to the built-in `admin` ClusterRole. The
   detail page states that the baseline NetworkPolicies, quota, limits and
   RoleBinding are restored if removed.
6. **NetworkPolicies**: deny ingress by default, allow the same namespace,
   allow configured ingress sources (default: OpenShift router by
   `policy-group.network.openshift.io/ingress`, and the `ingress-nginx`
   namespace). No egress rules. No sources means no rule, never an empty
   (allow-all) rule.
7. **Sizes and ingress sources live in `deploy/project-sizes.yaml`** for
   now; Phase 4 moves them into a ConfigMap in capybara-mgmt.
8. **Audit**: users' create/update/delete of Projects are audited
   fail-closed (refusals too). The controller's own writes are not audited,
   except the namespace removal on delete: `delete-namespace` (or a
   `denied` entry when the namespace is kept) and `namespace-removed`, both
   recorded under the deleting user and linked to the delete request via
   `ref` (the request's audit ID is stored on the Project). The audit file
   is shared by two processes and locked per write.
9. **Abandoning remote resources** when a cluster is gone for good is
   deferred to Phase 4 (cluster removal); until then deletion waits.
10. **Size reductions show current usage against the new limits** before
    saving; Kubernetes keeps running pods and refuses new ones over quota.
11. **Tooling**: one Go module per tool under `tools/` (golangci-lint,
    controller-gen, setup-envtest), because a shared module had conflicting
    dependencies. `make lint` checks generated files are current and that
    recipes run with pipefail (`SHELL := /bin/bash -o pipefail`; macOS
    make 3.81 ignores `.SHELLFLAGS`).
12. **Follow-ups from Phase 2** done first: Secret types and key names from
    a server-side summary; expected terminal-close errors from client-go at
    debug level through a contextual logger.
