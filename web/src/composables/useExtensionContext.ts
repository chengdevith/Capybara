import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { ExtensionContext } from '@/extensions'
import { usePluginsStore } from '@/stores/plugins'

/** Cluster id from a route's params, or null on global pages. */
export function clusterFromParams(params: Record<string, unknown>): string | null {
  const c = params.cluster
  return typeof c === 'string' && c !== '' ? c : null
}

/** The extension context for the current route. The cluster always comes
 * from the URL, never from a global default; plugins are those installed
 * and enabled on that cluster. */
export function useExtensionContext(): ComputedRef<ExtensionContext> {
  const route = useRoute()
  const plugins = usePluginsStore()
  return computed(() => {
    const cluster = clusterFromParams(route.params)
    return { cluster, plugins: plugins.enabledOn(cluster) }
  })
}
