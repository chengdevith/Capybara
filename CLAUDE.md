# Capybara — Kubernetes Management Platform

## What Capybara is
Capybara is a multi-cluster Kubernetes management platform, similar in spirit to
Rancher and KubeSphere, with features inspired by OpenShift (OCP): Projects with
namespace templates, an OCP-style console layout, and an admin/developer focus.

Capybara has a small, stable core. Extra tools (CI/CD, monitoring, GitOps,
logging, policy, backup) are plugins that users install and enable themselves.

## Tech stack
- Backend: Go (latest stable), client-go, controller-runtime / Kubebuilder for CRDs,
  Helm Go SDK for plugin installs
- Frontend: Vue 3 + TypeScript + Vite, Pinia, Vue Router, Naive UI,
  Monaco Editor (YAML), xterm.js (terminal), ECharts (charts)
- Local clusters: k3d
- Packaging: Helm chart (later phases)

## Current scope (IMPORTANT)
- NO authentication yet. Keycloak/AD comes in Phase 5.
- NO agent/tunnel yet. Clusters are reached via kubeconfigs stored as Secrets.
- All requests pass through an auth middleware that sets a fixed user ("dev").
  Code must always read the user from request context so real auth can be
  dropped in later without touching handlers.
- The server binds to localhost by default.

## Architecture
- Management cluster (k3d: capybara-mgmt) stores Capybara's state as CRDs.
- Managed clusters (k3d: capybara-dev-1, capybara-dev-2) are registered by kubeconfig.
- Flow: Vue UI → Go API server → cluster registry → client-go → target kube-apiserver.
- Live data: websocket per view; server runs a Kubernetes watch and streams events.
- Logs and exec: websocket per session, cleaned up when the browser disconnects.
- Plugins: UI bundles load at runtime into the extension registry; plugin
  backends run as their own pods and are reached through Capybara's proxy.

## Repository layout
- cmd/server        — API server entry point (HTTP + websockets)
- cmd/controller    — CRD controllers (Cluster, Project, Plugin)
- api/v1alpha1      — CRD types (group: platform.capybara.io)
- pkg/config        — server settings
- pkg/cluster       — cluster registry, one cached client per cluster
- pkg/proxy         — generic passthrough to a cluster's Kubernetes API
- pkg/resource      — aggregated views (cluster overview, project summary)
- pkg/stream        — websocket hub: watch, logs, exec
- pkg/project       — Project reconcile logic, S/M/L quota templates
- pkg/plugin        — catalog sync, Helm install/upgrade/uninstall,
                      enabled-plugin registry, plugin backend proxy
- pkg/audit         — audit log of every write action
- pkg/auth          — placeholder middleware (fixed "dev" user)
- web/              — Vue app
- web/src/extensions — extension point registry and runtime plugin loader
- sdk/              — plugin SDK (shared components, API client, context)
- plugins/          — first-party plugins (monitoring first)
- deploy/           — k3d setup scripts, CRD manifests, Helm chart (later)
- docs/             — architecture notes, decisions

## API surface
- GET    /api/clusters                     list clusters with status
- POST   /api/clusters                     register a cluster from kubeconfig
- DELETE /api/clusters/{id}                remove a cluster
- GET    /api/clusters/{id}/overview       counts, version, health
- ANY    /api/clusters/{id}/k8s/...        passthrough to the Kubernetes API
- WS     /api/clusters/{id}/watch          live events (resource type + namespace)
- WS     /api/clusters/{id}/logs           pod/container log stream
- WS     /api/clusters/{id}/exec           web terminal
- GET/POST /api/projects                   list/create Projects
- GET    /api/plugins                      catalog + installation status
- POST   /api/plugins/installations        install / connect a plugin to a cluster
- PATCH  /api/plugins/installations/{id}   enable, disable, change config, upgrade
- DELETE /api/plugins/installations/{id}   uninstall (with keep-data option)
- ANY    /api/plugins/{name}/...           proxy to a plugin's backend
- GET    /api/audit                        browse audit log
- GET    /healthz                          server health

## Data model
- Cluster: display name, environment label (dev/uat/prod), kubeconfig Secret ref;
  status: phase (Connected/Error), Kubernetes version, node count, last checked.
- Project: name, target cluster, namespace, owner, quota size (S/M/L);
  status: phase (Ready/Error), list of created resources.
  The controller creates: Namespace, ResourceQuota, LimitRange,
  default-deny NetworkPolicy (+ allow same-namespace), RoleBinding for owner.
- PluginRepository: catalog source (Helm/OCI repo), trusted flag.
- Plugin: name, version, description, icon, chart reference, UI bundle,
  extension points used, permissions needed, config schema, dependencies,
  supported modes (install / connect existing), scope (per-cluster / global).
- PluginInstallation: plugin, target cluster, mode, config values, enabled flag;
  status: phase (Installing/Ready/Error/Disabled) and current step.
- Audit entry: time, user, cluster, namespace, kind, name, action, result.

## Frontend structure
- Layout: top bar (cluster switcher, namespace/project selector);
  left sidebar: Home, Projects, Workloads, Networking, Storage, Config,
  Marketplace, Clusters, Administration (Namespaces), Audit, plus entries
  contributed by enabled plugins.
- URLs include the cluster: /c/{cluster}/workloads/pods
- web/src/api, stores, composables, router, views, components, extensions
- One generic resource table and one generic detail page
  (tabs: Overview, YAML, Events, Logs). Resource pages are configuration,
  not copies.
- A shared composable handles "list, then keep live via websocket".

## Plugin system
- Core = clusters, workloads, networking, storage, config, Projects, audit,
  plugin manager. Everything else is a plugin.
- A plugin has up to three parts:
  1. Workload: Helm chart installed into the target cluster
  2. Backend (optional): its own pod, reached via /api/plugins/{name}/...
     Plugin code never loads into the Capybara Go process.
  3. UI bundle: loaded at runtime, contributes through extension points
- Install (deploy the tool) and Enable (show its UI) are separate steps.
- "Connect existing" mode links a plugin to a tool already running in the
  cluster instead of installing a new one (important on OCP, which ships
  its own monitoring and often a GitOps operator).
- Extension points: sidebar items + pages, resource detail tabs, resource
  actions, cluster overview cards, project overview cards, settings pages.
- Plugins are per-cluster: the UI shows a plugin's contributions only when
  the CURRENT cluster has it installed and enabled.
- The extension API is versioned; the controller checks compatibility on upgrade.
- Safety: admin-only install for now; only trusted repositories; permissions
  shown before install; UI bundles served by Capybara only; plugin backends
  always go through Capybara's proxy.
- Plugin folder: plugins/<name>/{plugin.yaml, chart/, backend/, ui/, docs/}

### First plugin: Monitoring (Prometheus + Grafana)
- Install mode: kube-prometheus-stack (small preset for k3d).
- Connect existing mode: any Prometheus endpoint; on OCP, Thanos Querier
  in openshift-monitoring. Never install a second stack on OCP.
- Backend: predefined PromQL queries (no raw PromQL from the UI yet),
  time ranges 1h/6h/24h/7d, light caching. Reaches Prometheus through
  Capybara's cluster connection via the Kubernetes service proxy.
- UI: Metrics tab on Pod/Deployment/Node, cluster overview card, project
  quota-vs-usage card, Monitoring section (Overview, Alerts, Grafana link),
  settings page.
- Install status steps: chart installing → Prometheus ready → targets
  scraped → Grafana ready → Ready.
- Uninstall asks whether to keep metrics data and warns that
  kube-prometheus-stack CRDs remain unless cleaned up.

## Roadmap
0.   Foundations — k3d clusters + Go program that lists/watches pods
1.   Read-only, single cluster — namespaces, pods, deployments, services,
     live updates, logs. Sidebar, routes and detail tabs built from the
     extension registry from day one.
2.   Write actions — YAML edit, scale, restart, delete, terminal, audit log
3.   Projects — Project CRD + controller with templates
4.   Multi-cluster — Cluster CRD + kubeconfig Secrets + cluster switcher + health
4.5. Plugin framework — plugin CRDs, controller, Marketplace, runtime UI
     loading, proven by the Monitoring plugin
5.   Auth — Keycloak + AD, impersonation, per-user RBAC, plugin install rights
6.   Agent + tunnel — outbound agents replace stored kubeconfigs
7.   More plugins — CI/CD (Tekton), GitOps (Argo CD), logging, policy, backup

## Working rules
- Work only on the phase you are asked to do. Do not start later phases.
- Before writing code for a task, write a short plan and wait for approval.
- For each feature: backend endpoint → verify with curl → API client + store → view.
- Every feature must work with more than one cluster in mind; never hardcode "the" cluster.
- Core features use the same extension registry as plugins. Never hardcode
  menu items, routes, or detail tabs.
- Ask before adding any new dependency.
- Never commit kubeconfigs, tokens, or secrets. Keep them out of logs.
- Only target the local k3d clusters. Never connect to any other cluster.
- Add tests: Go unit tests, envtest for controllers, Vitest for Vue stores/composables.
- Keep `make dev`, `make test`, `make lint` working at all times.
- After each completed task: run tests + lint, update docs/ if a decision changed,
  and summarize what was done and what's next.
- Small, focused commits with clear messages.