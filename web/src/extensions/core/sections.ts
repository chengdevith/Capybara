import type { ExtensionRegistry } from '../registry'

/** Sidebar groups from CLAUDE.md. Hidden until something registers into them. */
export const CoreSections = {
  workloads: 'core.section.workloads',
  networking: 'core.section.networking',
  storage: 'core.section.storage',
  config: 'core.section.config',
} as const

export function registerNavSections(registry: ExtensionRegistry): void {
  registry.register({ type: 'nav-section', id: CoreSections.workloads, label: 'Workloads', order: 10 })
  registry.register({ type: 'nav-section', id: CoreSections.networking, label: 'Networking', order: 20 })
  registry.register({ type: 'nav-section', id: CoreSections.storage, label: 'Storage', order: 30 })
  registry.register({ type: 'nav-section', id: CoreSections.config, label: 'Config', order: 40 })
}
