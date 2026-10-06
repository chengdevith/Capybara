import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { isActiveInstallation, listPlugins, type CatalogEntry } from '@/api/plugins'

/** The plugin catalog with installations, polled like the cluster list. */
export const usePluginsStore = defineStore('plugins', () => {
  const catalog = shallowRef<CatalogEntry[]>([])
  const loaded = ref(false)
  const error = ref<string | null>(null)
  /** Why a plugin's UI could not be loaded (by plugin name). */
  const loadErrors = ref<Record<string, string>>({})
  const listeners = new Set<(c: CatalogEntry[]) => void>()

  let inflight: Promise<void> | null = null
  function load(): Promise<void> {
    inflight ??= (async () => {
      try {
        catalog.value = await listPlugins()
        error.value = null
        listeners.forEach((fn) => fn(catalog.value))
      } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
      } finally {
        loaded.value = true
        inflight = null
      }
    })()
    return inflight
  }

  let timer: ReturnType<typeof setInterval> | undefined
  function startPolling(intervalMs = 10000) {
    if (timer) return
    void load()
    timer = setInterval(() => void load(), intervalMs)
  }
  function stopPolling() {
    clearInterval(timer)
    timer = undefined
  }

  /** Calls fn with every new catalog (the UI loader subscribes). */
  function onChange(fn: (c: CatalogEntry[]) => void): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  /** Plugins installed and enabled on a cluster. */
  const enabledByCluster = computed(() => {
    const out = new Map<string, Set<string>>()
    for (const p of catalog.value) {
      for (const i of p.installations) {
        if (!isActiveInstallation(i)) continue
        let set = out.get(i.spec.cluster)
        if (!set) out.set(i.spec.cluster, (set = new Set()))
        set.add(p.name)
      }
    }
    return out
  })
  const none: ReadonlySet<string> = new Set()
  function enabledOn(cluster: string | null): ReadonlySet<string> {
    return (cluster && enabledByCluster.value.get(cluster)) || none
  }

  function setLoadError(name: string, msg: string | null) {
    const next = { ...loadErrors.value }
    if (msg) next[name] = msg
    else delete next[name]
    loadErrors.value = next
  }

  return { catalog, loaded, error, loadErrors, load, startPolling, stopPolling, onChange, enabledOn, setLoadError }
})
