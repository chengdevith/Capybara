import type { ExtensionRegistry } from '../registry'

// Clusters is a global page (/clusters): it is where clusters are added, so
// it must work before any cluster exists.
export function registerClusters(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.clusters',
    path: 'clusters',
    scope: 'global',
    title: 'Clusters',
    component: () => import('@/views/ClustersView.vue'),
  })
  registry.register({
    type: 'route',
    id: 'core.clusters.detail',
    path: 'clusters/:id',
    scope: 'global',
    title: 'Cluster',
    parent: 'core.clusters',
    component: () => import('@/views/ClusterDetailView.vue'),
  })
  // After Config and Marketplace, before Administration (CLAUDE.md).
  registry.register({ type: 'nav-item', id: 'core.nav.clusters', label: 'Clusters', order: 800, route: 'core.clusters' })
}
