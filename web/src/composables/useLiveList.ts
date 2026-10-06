import { onScopeDispose, ref, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { listAll, watchUrl, type KubeList, type KubeObject, type ResourceType, type Selectors, type WatchMessage } from '@/api/k8s'

/** A Kubernetes resource in a managed cluster. */
export interface ResourceSource extends Selectors {
  cluster: string
  type: ResourceType
  /** Namespace for namespaced types; empty/null = all namespaces. */
  namespace?: string | null
}

/** Any other list + watch endpoint with the same protocol (e.g. Projects). */
export interface CustomSource {
  /** Identifies the source; a new key restarts the list. */
  key: string
  list: (signal: AbortSignal) => Promise<KubeList>
  watchUrl: (resourceVersion: string) => string
}

/** What to list and keep live. `null` means "nothing yet" (e.g. no cluster). */
export type LiveListSource = ResourceSource | CustomSource

function normalize(src: LiveListSource): CustomSource {
  if ('list' in src) return src
  return {
    key: JSON.stringify(src),
    list: (signal) => listAll(src.cluster, src.type, src, signal),
    watchUrl: (resourceVersion) => watchUrl(src.cluster, src.type, { ...src, resourceVersion }),
  }
}

const keyOf = (src: LiveListSource | null) => (src ? normalize(src).key : null)

/** Minimal WebSocket surface, so tests can inject a fake. */
export interface SocketLike {
  onopen: ((ev: Event) => void) | null
  onmessage: ((ev: MessageEvent) => void) | null
  onclose: ((ev: CloseEvent) => void) | null
  onerror: ((ev: Event) => void) | null
  close(code?: number, reason?: string): void
}

export interface LiveListOptions {
  /** Order of `items`. Default: by namespace, then name. */
  sort?: (a: KubeObject, b: KubeObject) => number
  /** Keep at most this many objects; the ones sorting last are dropped. */
  max?: number
  /** Batch window for applying watch events, in ms. 0 = apply immediately. */
  flushMs?: number
  /** Socket factory (tests). */
  createSocket?: (url: string) => SocketLike
}

export interface LiveList {
  items: Ref<KubeObject[]>
  /** True until the first list has loaded. */
  loading: Ref<boolean>
  /** Last error, cleared on recovery. */
  error: Ref<string | null>
  /** True while the watch is connected. */
  live: Ref<boolean>
  /** Re-list from scratch. */
  reload: () => void
}

export const byNamespaceAndName = (a: KubeObject, b: KubeObject): number =>
  (a.metadata.namespace ?? '').localeCompare(b.metadata.namespace ?? '') ||
  a.metadata.name.localeCompare(b.metadata.name)

const BACKOFF_MS = [1000, 2000, 5000, 10000, 30000]

/**
 * Lists a resource, then keeps the list live through the watch websocket:
 * list → watch from the list's resourceVersion → apply events by uid.
 * Reconnects with backoff (resuming from the last resourceVersion) and
 * re-lists when the server says the version is too old (410).
 * Everything stops when the calling scope is disposed or the source changes.
 */
export function useLiveList(source: MaybeRefOrGetter<LiveListSource | null>, opts: LiveListOptions = {}): LiveList {
  const sort = opts.sort ?? byNamespaceAndName
  const flushMs = opts.flushMs ?? 100
  const createSocket = opts.createSocket ?? ((url: string) => new WebSocket(url) as SocketLike)

  const items = shallowRef<KubeObject[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const live = ref(false)

  // State of the current session; replaced wholesale when the source changes.
  let session = 0
  let objects = new Map<string, KubeObject>()
  let resourceVersion = ''
  let socket: SocketLike | null = null
  let abort: AbortController | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let flushTimer: ReturnType<typeof setTimeout> | undefined
  let attempts = 0

  function flush() {
    flushTimer = undefined
    let list = [...objects.values()].sort(sort)
    if (opts.max !== undefined && list.length > opts.max) {
      for (const dropped of list.slice(opts.max)) objects.delete(dropped.metadata.uid)
      list = list.slice(0, opts.max)
    }
    items.value = list
  }

  function scheduleFlush() {
    if (flushMs === 0) flush()
    else flushTimer ??= setTimeout(flush, flushMs)
  }

  function teardown() {
    session++
    abort?.abort()
    abort = null
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null
      socket.close(1000, 'done')
      socket = null
    }
    clearTimeout(retryTimer)
    clearTimeout(flushTimer)
    flushTimer = undefined
    live.value = false
  }

  function retry(src: CustomSource, fn: (src: CustomSource) => void) {
    const id = session
    const delay = BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)]!
    attempts++
    retryTimer = setTimeout(() => {
      if (id === session) fn(src)
    }, delay)
  }

  async function list(src: CustomSource) {
    const id = session
    abort = new AbortController()
    try {
      const result = await src.list(abort.signal)
      if (id !== session) return
      objects = new Map(result.items.map((o) => [o.metadata.uid, o]))
      resourceVersion = result.metadata.resourceVersion
      flush()
      loading.value = false
      error.value = null
      connect(src)
    } catch (e) {
      if (id !== session) return
      loading.value = false
      error.value = e instanceof Error ? e.message : String(e)
      retry(src, list)
    }
  }

  function connect(src: CustomSource) {
    const id = session
    const ws = createSocket(src.watchUrl(resourceVersion))
    socket = ws
    let relisting = false

    ws.onopen = () => {
      if (id !== session) return
      live.value = true
      attempts = 0
      error.value = null
    }
    ws.onmessage = (ev) => {
      if (id !== session) return
      const msg = JSON.parse(String(ev.data)) as WatchMessage
      if (msg.type === 'ERROR') {
        if (msg.status.code === 410) {
          relisting = true // resourceVersion too old: start over
          teardownSocket()
          void list(src)
        } else {
          error.value = msg.status.message ?? `watch failed (${msg.status.code})`
        }
        return
      }
      resourceVersion = msg.object.metadata.resourceVersion || resourceVersion
      if (msg.type === 'BOOKMARK') return
      if (msg.type === 'DELETED') objects.delete(msg.object.metadata.uid)
      else objects.set(msg.object.metadata.uid, msg.object)
      scheduleFlush()
    }
    ws.onclose = () => {
      if (id !== session || relisting) return
      live.value = false
      socket = null
      retry(src, connect) // resume from the last resourceVersion
    }
    ws.onerror = () => {
      /* onclose follows and handles the retry */
    }

    function teardownSocket() {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null
      ws.close(1000, 'relist')
      socket = null
      live.value = false
    }
  }

  function start(src: LiveListSource | null) {
    teardown()
    objects = new Map()
    resourceVersion = ''
    attempts = 0
    items.value = []
    error.value = null
    loading.value = src !== null
    if (src) void list(normalize(src))
  }

  let currentKey: string | null | undefined
  watch(
    () => toValue(source),
    (src) => {
      const key = keyOf(src)
      if (key !== currentKey) {
        currentKey = key
        start(src)
      }
    },
    { immediate: true },
  )
  onScopeDispose(teardown)

  return { items, loading, error, live, reload: () => start(toValue(source)) }
}
