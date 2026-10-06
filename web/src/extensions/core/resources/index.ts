import type { ExtensionRegistry } from '../../registry'
import { CoreSections } from '../sections'
import { deployments } from './deployments'
import { namespaces } from './namespaces'
import { pods } from './pods'
import { registerResource } from './register'
import { services } from './services'

export { deployments, namespaces, pods, services }

export function registerCoreResources(registry: ExtensionRegistry): void {
  // Top level, right after Home. Phase 3 moves it to an admin section and
  // gives this spot to Projects: only `nav` below changes.
  registerResource(registry, namespaces, { order: 5 })
  registerResource(registry, pods, { section: CoreSections.workloads, order: 10 })
  registerResource(registry, deployments, { section: CoreSections.workloads, order: 20 })
  registerResource(registry, services, { section: CoreSections.networking, order: 10 })
}
