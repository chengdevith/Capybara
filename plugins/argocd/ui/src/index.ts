import { definePlugin, EXTENSION_API_VERSION, type ExtensionContext } from '@capybara/sdk'
import { applicationsDef, appProjectsDef, isProjectNamespace, isWritable, loadProjects, setApi } from './argocd'

// GitOps (id: argocd). Everything here shows only on clusters where the
// plugin is installed and enabled; Capybara adds that condition. Writes
// (create, edit, delete, sync, refresh, sync policy) exist only in Project
// namespaces, only where Argo CD accepts Applications there, and Capybara's
// server checks each one (ADR 0009).
type Obj = { metadata: { name: string; namespace?: string }; spec?: { syncPolicy?: { automated?: unknown } } }
const writable = (o: Obj, ctx: ExtensionContext) => isWritable(ctx.cluster) && isProjectNamespace(o.metadata.namespace, ctx.cluster)

export default definePlugin({
  name: 'argocd',
  apiVersion: EXTENSION_API_VERSION,
  // Action inputs and confirmation, delete modes (1.3).
  minApi: '1.3',
  register(api) {
    setApi(api)
    void loadProjects()

    api.register({ type: 'nav-section', id: 'argocd.section', label: 'GitOps', order: 47 })
    api.registerResource(applicationsDef, { order: 10, section: 'argocd.section' })
    api.registerResource(appProjectsDef, { order: 20, section: 'argocd.section' })

    const form = () => import('./ApplicationForm.vue')
    api.register({ type: 'route', id: 'argocd.applications.new', path: 'gitops/applications/new', scope: 'cluster', title: 'Create Application', parent: 'argocd.applications.list', component: form })
    api.register({ type: 'route', id: 'argocd.applications.edit', path: 'gitops/applications/:namespace/:name/edit', scope: 'cluster', title: 'Edit Application', parent: 'argocd.applications.list', component: form })

    // Application tabs: Overview, Resources, History, YAML, Events.
    api.register({ type: 'resource-detail-tab', id: 'argocd.tab.resources', label: 'Resources', order: 12, kinds: ['Application'], component: () => import('./ResourcesTab.vue') })
    api.register({ type: 'resource-detail-tab', id: 'argocd.tab.history', label: 'History', order: 14, kinds: ['Application'], component: () => import('./HistoryTab.vue') })
    // On kinds an Application deploys: which one manages it.
    api.register({
      type: 'resource-detail-tab', id: 'argocd.tab.gitops', label: 'GitOps', order: 40,
      kinds: ['Deployment', 'Service', 'ConfigMap', 'Secret'], component: () => import('./GitOpsTab.vue'),
    })

    api.register({ type: 'resource-action', id: 'argocd.action.sync', label: 'Sync', order: 5, kinds: ['Application'], appliesTo: writable, component: () => import('./SyncAction.vue') })
    api.register({ type: 'resource-action', id: 'argocd.action.refresh', label: 'Refresh', order: 6, kinds: ['Application'], appliesTo: writable, component: () => import('./RefreshAction.vue') })
    api.register({ type: 'resource-action', id: 'argocd.action.hard-refresh', label: 'Hard refresh', order: 7, kinds: ['Application'], appliesTo: writable, component: () => import('./HardRefreshAction.vue') })
    api.register({ type: 'resource-action', id: 'argocd.action.policy', label: 'Sync policy', order: 8, kinds: ['Application'], appliesTo: writable, component: () => import('./SyncPolicyAction.vue') })
    api.register({ type: 'resource-action', id: 'argocd.action.edit', label: 'Edit', order: 10, kinds: ['Application'], appliesTo: writable, component: () => import('./EditAction.vue') })
    api.register({ type: 'resource-action', id: 'argocd.action.delete', label: 'Delete', order: 90, danger: true, kinds: ['Application'], appliesTo: writable, component: () => import('./DeleteAction.vue') })

    api.register({ type: 'project-overview-card', id: 'argocd.card.apps', title: 'GitOps applications', order: 35, component: () => import('./ProjectAppsCard.vue') })
  },
})
