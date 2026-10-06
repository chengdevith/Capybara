#!/usr/bin/env bash
# Creates a least-privilege ServiceAccount (default "capybara") in a local
# k3d cluster and writes a kubeconfig for it with a short-lived token:
#   .local/kubeconfig/capybara-<id>-sa.yaml        (--sa capybara, the default)
#   .local/kubeconfig/capybara-<id>-<sa>.yaml      (any other --sa)
#
# Usage: hack/capybara-sa.sh <cluster-id> [--with-secrets] [--sa NAME] [--duration 720h]
#        hack/capybara-sa.sh <cluster-id> --sa NAME --delete
#        hack/capybara-sa.sh <cluster-id> --installer PLUGIN [--connect --set key=value ...]
#
# --installer creates the separate installer account (capybara-installer)
# used only by the plugin controller, with the plugin's declared installer
# permissions for one mode (from plugins/PLUGIN/plugin.yaml, via
# cmd/plugin-rbac). Install mode is broad (what the chart creates);
# --connect binds only a Role in the connected service's namespace.
# Writes .local/kubeconfig/capybara-<id>-installer.yaml.
#
# Not cluster-admin. Without --with-secrets the account has NO access to
# Secrets (RBAC cannot grant metadata-only reads); with it, it can read and
# change Secret values. Re-running mints a fresh token (rotation).
# --delete removes the account, its bindings and its kubeconfig file;
# deleting the ServiceAccount invalidates every token minted for it.
set -euo pipefail
cd "$(dirname "$0")/.."

usage="usage: hack/capybara-sa.sh <cluster-id> [--with-secrets] [--sa NAME] [--duration 720h] [--delete] [--installer PLUGIN [--connect] [--set k=v ...]]"
id="${1:?$usage}"
shift
with_secrets=false
sa=capybara
duration=720h
delete=false
installer=""
mode=install
sets=()
while (($#)); do
  case "$1" in
    --with-secrets) with_secrets=true ;;
    --sa) sa="${2:?$usage}"; shift ;;
    --duration) duration="${2:?$usage}"; shift ;;
    --delete) delete=true ;;
    --installer) installer="${2:?$usage}"; sa=capybara-installer; shift ;;
    --connect) mode=connect ;;
    --set) sets+=(-set "${2:?$usage}"); shift ;;
    *) echo "$usage" >&2; exit 1 ;;
  esac
  shift
done
[[ "$sa" =~ ^capybara(-[a-z0-9]+)*$ ]] || { echo "--sa must be capybara or capybara-<suffix>" >&2; exit 1; }

# The default account keeps its original names; others get their own.
if [[ "$sa" == capybara ]]; then
  manager_binding=capybara-manager secrets_binding=capybara-secrets suffix=sa
elif [[ -n "$installer" || "$sa" == capybara-installer ]]; then
  manager_binding="" secrets_binding="" suffix=installer
else
  manager_binding="capybara-manager-${sa}" secrets_binding="capybara-secrets-${sa}" suffix="${sa#capybara-}"
fi

admin=".local/kubeconfig/capybara-${id}.yaml"
out=".local/kubeconfig/capybara-${id}-${suffix}.yaml"
[[ -f "$admin" ]] || { echo "no admin kubeconfig for $id ($admin); run make cluster-up" >&2; exit 1; }
git check-ignore -q "$out" || { echo "refusing to write $out: not git-ignored" >&2; exit 1; }

k() { kubectl --kubeconfig "$admin" "$@"; }

if $delete; then
  [[ "$sa" != capybara ]] || { echo "refusing to delete the registered capybara account" >&2; exit 1; }
  if [[ -n "$manager_binding" ]]; then
    k delete clusterrolebinding "$manager_binding" "$secrets_binding" --ignore-not-found >/dev/null
  else
    k delete clusterrolebinding,rolebinding,clusterrole,role -A -l platform.capybara.io/installer=true --ignore-not-found >/dev/null
  fi
  k -n capybara-system delete serviceaccount "$sa" --ignore-not-found >/dev/null
  rm -f "$out"
  echo "==> deleted ServiceAccount capybara-system/${sa} and its bindings in ${id}"
  exit 0
fi

if [[ -n "$installer" ]]; then
  rbac="$(go run ./cmd/plugin-rbac -plugin "$installer" -mode "$mode" -account "$sa" ${sets[@]+"${sets[@]}"})"
  k create namespace capybara-system --dry-run=client -o yaml | k apply -f - >/dev/null
  k -n capybara-system create serviceaccount "$sa" --dry-run=client -o yaml | k apply -f - >/dev/null
  # One mode at a time: drop this plugin's earlier installer bindings.
  k delete clusterrolebinding,rolebinding -A -l "platform.capybara.io/installer=true,platform.capybara.io/plugin=${installer}" \
    --ignore-not-found >/dev/null
  if [[ "$mode" == connect ]]; then
    ns="$(sed -n 's/^  namespace: //p' <<<"$rbac" | head -1)"
    k create namespace "$ns" --dry-run=client -o yaml | k apply -f - >/dev/null
  fi
  k apply -f - >/dev/null <<<"$rbac"
else
k apply -f - >/dev/null <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: capybara-system
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${sa}
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
  name: ${manager_binding}
  labels: { app.kubernetes.io/managed-by: capybara }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: capybara-manager }
subjects: [{ kind: ServiceAccount, name: ${sa}, namespace: capybara-system }]
EOF

fi

if [[ -n "$installer" ]]; then
  :
elif $with_secrets; then
  k apply -f - >/dev/null <<EOF
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
  name: ${secrets_binding}
  labels: { app.kubernetes.io/managed-by: capybara }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: capybara-secrets }
subjects: [{ kind: ServiceAccount, name: ${sa}, namespace: capybara-system }]
EOF
else
  k delete clusterrolebinding "$secrets_binding" --ignore-not-found >/dev/null
fi

token="$(k -n capybara-system create token "$sa" --duration="$duration")"
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
  - name: ${sa}
    user:
      token: ${token}
contexts:
  - name: capybara-${id}
    context: { cluster: capybara-${id}, user: ${sa} }
current-context: capybara-${id}
EOF
)
mv "${out}.tmp" "$out"
if [[ -n "$installer" ]]; then
  echo "==> ${out}: installer ServiceAccount capybara-system/${sa} for plugin ${installer} (${mode} mode), token valid ${duration}"
else
  echo "==> ${out}: ServiceAccount capybara-system/${sa}, token valid ${duration}, secrets: ${with_secrets}"
fi
