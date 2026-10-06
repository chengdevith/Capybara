import type { ExtensionRegistry } from '../registry'

/** The tabs of the generic resource detail page. */
export function registerDetailTabs(registry: ExtensionRegistry): void {
  registry.register({
    type: 'resource-detail-tab',
    id: 'core.tab.overview',
    label: 'Overview',
    order: 10,
    kinds: '*',
    component: () => import('@/views/resource-tabs/OverviewTab.vue'),
  })
  registry.register({
    type: 'resource-detail-tab',
    id: 'core.tab.yaml',
    label: 'YAML',
    order: 20,
    kinds: '*',
    component: () => import('@/views/resource-tabs/YamlTab.vue'),
  })
  registry.register({
    type: 'resource-detail-tab',
    id: 'core.tab.events',
    label: 'Events',
    order: 30,
    kinds: '*',
    component: () => import('@/views/resource-tabs/EventsTab.vue'),
  })
  registry.register({
    type: 'resource-detail-tab',
    id: 'core.tab.logs',
    label: 'Logs',
    order: 40,
    kinds: ['Pod'],
    component: () => import('@/views/resource-tabs/LogsTab.vue'),
  })
  registry.register({
    type: 'resource-detail-tab',
    id: 'core.tab.terminal',
    label: 'Terminal',
    order: 50,
    kinds: ['Pod'],
    component: () => import('@/views/resource-tabs/TerminalTab.vue'),
  })
}
