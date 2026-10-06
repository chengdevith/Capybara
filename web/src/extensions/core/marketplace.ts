import type { ExtensionRegistry } from '../registry'

// The Marketplace is global: plugins are installed per cluster from here.
export function registerMarketplace(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.marketplace',
    path: 'marketplace',
    scope: 'global',
    title: 'Marketplace',
    component: () => import('@/views/MarketplaceView.vue'),
  })
  registry.register({
    type: 'route',
    id: 'core.marketplace.plugin',
    path: 'marketplace/:name',
    scope: 'global',
    title: 'Plugin',
    parent: 'core.marketplace',
    component: () => import('@/views/PluginDetailView.vue'),
  })
  // After Config, before Clusters (CLAUDE.md).
  registry.register({ type: 'nav-item', id: 'core.nav.marketplace', label: 'Marketplace', order: 700, route: 'core.marketplace' })
}
