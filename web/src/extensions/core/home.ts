import type { ExtensionRegistry } from '../registry'

// Home is the cluster overview: its cards are cluster-overview-card
// extensions, so plugins add theirs the same way core does.
export function registerHome(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.home',
    path: 'home',
    scope: 'cluster',
    title: 'Home',
    component: () => import('@/views/HomeView.vue'),
  })
  registry.register({ type: 'nav-item', id: 'core.nav.home', label: 'Home', order: 0, route: 'core.home' })

  registry.register({
    type: 'cluster-overview-card',
    id: 'core.card.health',
    title: 'Health',
    order: 10,
    component: () => import('@/views/overview-cards/HealthCard.vue'),
  })
  registry.register({
    type: 'cluster-overview-card',
    id: 'core.card.inventory',
    title: 'Inventory',
    order: 20,
    component: () => import('@/views/overview-cards/InventoryCard.vue'),
  })
  registry.register({
    type: 'cluster-overview-card',
    id: 'core.card.projects',
    title: 'Projects',
    order: 30,
    component: () => import('@/views/overview-cards/ProjectsCard.vue'),
  })
}
