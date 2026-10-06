import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { ExtensionContext } from '@/extensions'

/** Cluster id from a route's params, or null on global pages. */
export function clusterFromParams(params: Record<string, unknown>): string | null {
  const c = params.cluster
  return typeof c === 'string' && c !== '' ? c : null
}

/** The extension context for the current route. The cluster always comes
 * from the URL, never from a global default. */
export function useExtensionContext(): ComputedRef<ExtensionContext> {
  const route = useRoute()
  return computed(() => ({ cluster: clusterFromParams(route.params) }))
}
