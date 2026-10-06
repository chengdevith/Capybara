import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listClusters, type Cluster } from '@/api/clusters'

export const useClustersStore = defineStore('clusters', () => {
  const items = ref<Cluster[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let inflight: Promise<void> | null = null

  /** Loads the cluster list. Concurrent calls share one request. */
  function load(): Promise<void> {
    inflight ??= (async () => {
      loading.value = true
      try {
        items.value = await listClusters()
        error.value = null
      } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
      } finally {
        loading.value = false
        loaded.value = true
        inflight = null
      }
    })()
    return inflight
  }

  /** Loads once; later calls are no-ops. */
  async function ensureLoaded(): Promise<void> {
    if (!loaded.value) await load()
  }

  function byId(id: string | null | undefined): Cluster | undefined {
    return id ? items.value.find((c) => c.id === id) : undefined
  }

  return { items, loaded, loading, error, load, ensureLoaded, byId }
})
