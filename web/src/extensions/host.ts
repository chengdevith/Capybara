import { defineAsyncComponent, type Component } from 'vue'
import type { LazyComponent } from './types'

const cache = new Map<string, { load: LazyComponent; component: Component }>()

/**
 * The async component for an extension, one per extension id (so pages keep
 * their state). If loading fails, Vue reports the error to the parent's
 * error hooks: ExtensionHost shows it.
 */
export function extensionComponent(id: string, load: LazyComponent): Component {
  const hit = cache.get(id)
  if (hit && hit.load === load) return hit.component
  // Accept { default: C } from plain objects too (Vue only unwraps real
  // module namespaces; hand-written plugin bundles may return either).
  const component = defineAsyncComponent(() =>
    load().then((m) => (m && typeof m === 'object' && 'default' in m ? (m as { default: Component }).default : (m as Component))),
  )
  cache.set(id, { load, component })
  return component
}
