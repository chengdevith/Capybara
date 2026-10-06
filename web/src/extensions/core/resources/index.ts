import type { ExtensionRegistry } from '../../registry'
import { CoreSections } from '../sections'
import { configmaps } from './configmaps'
import { deployments } from './deployments'
import { namespaces } from './namespaces'
import { pods } from './pods'
import { registerResource } from './register'
import { secrets } from './secrets'
import { services } from './services'

export { configmaps, deployments, namespaces, pods, secrets, services }

export function registerCoreResources(registry: ExtensionRegistry): void {
  registerResource(registry, namespaces, { section: CoreSections.admin, order: 10 })
  registerResource(registry, pods, { section: CoreSections.workloads, order: 10 })
  registerResource(registry, deployments, { section: CoreSections.workloads, order: 20 })
  registerResource(registry, services, { section: CoreSections.networking, order: 10 })
  registerResource(registry, configmaps, { section: CoreSections.config, order: 10 })
  registerResource(registry, secrets, { section: CoreSections.config, order: 20 })
}
