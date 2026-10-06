#!/usr/bin/env bash
# Creates the least-privilege "capybara" ServiceAccount in a local k3d
# cluster and writes a kubeconfig for it with a 30-day token:
#   .local/kubeconfig/capybara-<id>-sa.yaml
#
# Usage: hack/capybara-sa.sh <cluster-id> [--with-secrets]
#
# Not cluster-admin. Without --with-secrets the account has NO access to
# Secrets (RBAC cannot grant metadata-only reads); with it, it can read and
# change Secret values. Re-running mints a fresh token (rotation).
set -euo pipefail
cd "$(dirname "$0")/.."

id="${1:?usage: hack/capybara-sa.sh <cluster-id> [--with-secrets]}"
with_secrets=false
[[ "${2:-}" == "--with-secrets" ]] && with_secrets=true

admin=".local/kubeconfig/capybara-${id}.yaml"
out=".local/kubeconfig/capybara-${id}-sa.yaml"
[[ -f "$admin" ]] || { echo "no admin kubeconfig for $id ($admin); run make cluster-up" >&2; exit 1; }
git check-ignore -q "$out" || { echo "refusing to write $out: not git-ignored" >&2; exit 1; }

k() { kubectl --kubeconfig "$admin" "$@"; }

k apply -f - >/dev/null <<'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: capybara-system
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: capybara
  namespace: capybara-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: capybara-manager
  labels: { app.kubernetes.io/managed-by: capybara }
rules:
  # Browse and watch.
  - apiGroups: [""]
    resources: [pods, pods/log, services, endpoints, configmaps, namespaces, nodes, events,
                resourcequotas, limitranges, serviceaccounts, persistentvolumeclaims,
                persistentvolumes, replicationcontrollers]
    verbs: [get, list, watch]
  - apiGroups: [apps]
    resources: [deployments, statefulsets, daemonsets, replicasets]
    verbs: [get, list, watch]
  - apiGroups: [batch]
    resources: [jobs, cronjobs]
    verbs: [get, list, watch]
  - apiGroups: [networking.k8s.io]
    resources: [networkpolicies, ingresses]
    verbs: [get, list, watch]
  - apiGroups: [rbac.authorization.k8s.io]
    resources: [roles, rolebindings, clusterroles, clusterrolebindings]
    verbs: [get, list, watch]
  # Write actions in the console (apply, scale, restart, delete, terminal).
  - apiGroups: [""]
    resources: [pods]
    verbs: [delete]
  - apiGroups: [""]
    resources: [services, configmaps]
    verbs: [patch, update, delete]
  - apiGroups: [""]
    resources: [pods/exec]
    verbs: [create, get]
  - apiGroups: [apps]
    resources: [deployments, statefulsets, daemonsets]
    verbs: [patch, update, delete]
  - apiGroups: [apps]
    resources: [deployments/scale, statefulsets/scale]
    verbs: [get, patch, update]
  # Projects: namespace, quota, limits, policies and the owner binding.
  - apiGroups: [""]
    resources: [namespaces, resourcequotas, limitranges]
    verbs: [create, patch, update, delete]
  - apiGroups: [networking.k8s.io]
    resources: [networkpolicies]
    verbs: [create, patch, update, delete]
  - apiGroups: [rbac.authorization.k8s.io]
    resources: [rolebindings]
    verbs: [create, patch, update, delete]
  # Bind owners to "admin" in a Project namespace, and nothing else.
  - apiGroups: [rbac.authorization.k8s.io]
    resources: [clusterroles]
    resourceNames: [admin]
    verbs: [bind]
  # Health and connection tests.
  - apiGroups: [authentication.k8s.io]
    resources: [selfsubjectreviews]
    verbs: [create]
  - apiGroups: [authorization.k8s.io]
    resources: [selfsubjectaccessreviews, selfsubjectrulesreviews]
    verbs: [create]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: capybara-manager
  labels: { app.kubernetes.io/managed-by: capybara }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: capybara-manager }
subjects: [{ kind: ServiceAccount, name: capybara, namespace: capybara-system }]
EOF

if $with_secrets; then
  k apply -f - >/dev/null <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: capybara-secrets
  labels: { app.kubernetes.io/managed-by: capybara }
rules:
  # Opt-in: lets Capybara read Secret VALUES (Reveal, summaries) and edit them.
  - apiGroups: [""]
    resources: [secrets]
    verbs: [get, list, watch, patch, update, delete]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: capybara-secrets
  labels: { app.kubernetes.io/managed-by: capybara }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: capybara-secrets }
subjects: [{ kind: ServiceAccount, name: capybara, namespace: capybara-system }]
EOF
else
  k delete clusterrolebinding capybara-secrets --ignore-not-found >/dev/null
fi

token="$(k -n capybara-system create token capybara --duration=720h)"
server="$(k config view --minify -o jsonpath='{.clusters[0].cluster.server}')"
ca="$(k config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')"

(
  umask 077
  cat >"${out}.tmp" <<EOF
apiVersion: v1
kind: Config
clusters:
  - name: capybara-${id}
    cluster:
      server: ${server}
      certificate-authority-data: ${ca}
users:
  - name: capybara
    user:
      token: ${token}
contexts:
  - name: capybara-${id}
    context: { cluster: capybara-${id}, user: capybara }
current-context: capybara-${id}
EOF
)
mv "${out}.tmp" "$out"
echo "==> ${out}: ServiceAccount capybara-system/capybara, token valid 30 days, secrets: ${with_secrets}"
