import type { ExtensionRegistry } from '../registry'

export function registerAudit(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.audit',
    path: 'audit',
    scope: 'cluster',
    title: 'Audit',
    component: () => import('@/views/AuditView.vue'),
  })
  // Last in the sidebar, as in CLAUDE.md.
  registry.register({ type: 'nav-item', id: 'core.nav.audit', label: 'Audit', order: 1000, route: 'core.audit' })
}
