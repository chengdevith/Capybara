import type { ExtensionRegistry } from '../registry'
import { registerActions } from './actions'
import { registerAudit } from './audit'
import { registerClusters } from './clusters'
import { registerDetailTabs } from './detail-tabs'
import { registerHome } from './home'
import { registerMarketplace } from './marketplace'
import { registerProjects } from './projects'
import { registerCoreResources } from './resources'
import { registerNavSections } from './sections'
import { registerSettings } from './settings'

/** Registers everything the core console ships with. Each feature area has
 * its own file; pages are never wired anywhere else. */
export function registerCoreExtensions(registry: ExtensionRegistry): void {
  registerNavSections(registry)
  registerHome(registry)
  registerProjects(registry)
  registerCoreResources(registry)
  registerDetailTabs(registry)
  registerActions(registry)
  registerMarketplace(registry)
  registerClusters(registry)
  registerSettings(registry)
  registerAudit(registry)
}
