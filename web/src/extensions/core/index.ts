import type { ExtensionRegistry } from '../registry'
import { registerHome } from './home'
import { registerNavSections } from './sections'

/** Registers everything the core console ships with. Each feature area has
 * its own file; pages are never wired anywhere else. */
export function registerCoreExtensions(registry: ExtensionRegistry): void {
  registerNavSections(registry)
  registerHome(registry)
}
