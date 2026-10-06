import type { ExtensionRegistry } from '../registry'
import { registerActions } from './actions'
import { registerAudit } from './audit'
import { registerDetailTabs } from './detail-tabs'
import { registerHome } from './home'
import { registerProjects } from './projects'
import { registerCoreResources } from './resources'
import { registerNavSections } from './sections'

/** Registers everything the core console ships with. Each feature area has
 * its own file; pages are never wired anywhere else. */
export function registerCoreExtensions(registry: ExtensionRegistry): void {
  registerNavSections(registry)
  registerHome(registry)
  registerProjects(registry)
  registerCoreResources(registry)
  registerDetailTabs(registry)
  registerActions(registry)
  registerAudit(registry)
}
