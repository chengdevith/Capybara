import type { ExtensionRegistry } from '../registry'
import { CoreSections } from './sections'

// Cluster settings: one tab per settings-page extension (plugins add
// theirs). Hidden from the sidebar until something contributes a tab.
export function registerSettings(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.settings',
    path: 'settings',
    scope: 'cluster',
    title: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    when: (ctx) => registry.active('settings-page', ctx).length > 0,
  })
  registry.register({
    type: 'nav-item', id: 'core.nav.settings', label: 'Settings', order: 100, section: CoreSections.admin, route: 'core.settings',
  })
}
