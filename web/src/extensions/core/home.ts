import type { ExtensionRegistry } from '../registry'

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
}
