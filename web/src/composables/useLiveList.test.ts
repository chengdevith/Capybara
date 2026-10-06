import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { KubeObject, ResourceType } from '@/api/k8s'
import { useLiveList, type LiveListSource, type SocketLike } from './useLiveList'

const pods: ResourceType = { group: '', version: 'v1', plural: 'pods', kind: 'Pod', namespaced: true }

function pod(name: string, rv: string, extra: Partial<KubeObject['metadata']> = {}): KubeObject {
  return {
    metadata: { name, namespace: 'demo', uid: `uid-${name}`, resourceVersion: rv, creationTimestamp: '', ...extra },
  }
}

class FakeSocket implements SocketLike {
  static all: FakeSocket[] = []
  onopen: SocketLike['onopen'] = null
  onmessage: SocketLike['onmessage'] = null
  onclose: SocketLike['onclose'] = null
  onerror: SocketLike['onerror'] = null
  closed = false
  constructor(readonly url: string) {
    FakeSocket.all.push(this)
  }
  open() {
    this.onopen?.(new Event('open'))
  }
  send(msg: unknown) {
    this.onmessage?.({ data: JSON.stringify(msg) } as MessageEvent)
  }
  drop() {
    this.onclose?.({ code: 1006 } as CloseEvent)
  }
  close() {
    this.closed = true
  }
  get rv() {
    return new URL(this.url).searchParams.get('resourceVersion')
  }
}

/** Queue of list responses; each fetch takes the next one. */
function stubLists(...lists: { rv: string; items: KubeObject[] }[]) {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => {
    const next = lists.shift()
    if (!next) return new Response(JSON.stringify({ error: 'boom' }), { status: 500 })
    return new Response(JSON.stringify({ metadata: { resourceVersion: next.rv }, items: next.items }), { status: 200 })
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const settle = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
  await nextTick()
}

function run(source: LiveListSource | null | (() => LiveListSource | null), opts = {}) {
  const scope = effectScope()
  const list = scope.run(() =>
    useLiveList(source, { flushMs: 0, createSocket: (u) => new FakeSocket(u), ...opts }),
  )!
  return { list, scope, names: () => list.items.value.map((o) => o.metadata.name) }
}

const src: LiveListSource = { cluster: 'dev-1', type: pods, namespace: 'demo' }

describe('useLiveList', () => {
  beforeEach(() => {
    FakeSocket.all = []
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('lists, then watches from the list resourceVersion and applies events', async () => {
    const fetch = stubLists({ rv: '100', items: [pod('b', '90'), pod('a', '95')] })
    const { list, names } = run(src)
    await settle()

    expect(fetch.mock.calls[0]![0]).toBe('/api/clusters/dev-1/k8s/api/v1/namespaces/demo/pods?limit=500')
    expect(names()).toEqual(['a', 'b'])
    expect(list.loading.value).toBe(false)

    const ws = FakeSocket.all[0]!
    expect(ws.url).toContain('/api/clusters/dev-1/watch?')
    expect(ws.rv).toBe('100')
    ws.open()
    expect(list.live.value).toBe(true)

    ws.send({ type: 'ADDED', object: pod('c', '101') })
    ws.send({ type: 'MODIFIED', object: pod('a', '102', { labels: { x: 'y' } }) })
    ws.send({ type: 'DELETED', object: pod('b', '103') })
    expect(names()).toEqual(['a', 'c'])
    expect(list.items.value[0]!.metadata.labels).toEqual({ x: 'y' })
  })

  it('reconnects after a drop, resuming from the last resourceVersion', async () => {
    stubLists({ rv: '100', items: [] })
    const { list } = run(src)
    await settle()
    const first = FakeSocket.all[0]!
    first.open()
    first.send({ type: 'ADDED', object: pod('a', '150') })
    first.send({ type: 'BOOKMARK', object: pod('', '160') })
    first.drop()
    expect(list.live.value).toBe(false)

    await vi.advanceTimersByTimeAsync(1000)
    const second = FakeSocket.all[1]!
    expect(second.rv).toBe('160')
  })

  it('re-lists when the watch reports 410 Gone', async () => {
    const fetch = stubLists({ rv: '100', items: [pod('old', '1')] }, { rv: '500', items: [pod('new', '499')] })
    const { names } = run(src)
    await settle()
    FakeSocket.all[0]!.send({ type: 'ERROR', status: { code: 410, reason: 'Expired' } })
    await settle()

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(FakeSocket.all[0]!.closed).toBe(true)
    expect(names()).toEqual(['new'])
    expect(FakeSocket.all[1]!.rv).toBe('500')
  })

  it('keeps at most `max` objects in sort order', async () => {
    stubLists({ rv: '1', items: [pod('a', '1'), pod('b', '1'), pod('c', '1')] })
    const newestFirst = (x: KubeObject, y: KubeObject) => y.metadata.name.localeCompare(x.metadata.name)
    const { names } = run(src, { sort: newestFirst, max: 2 })
    await settle()
    expect(names()).toEqual(['c', 'b'])

    FakeSocket.all[0]!.send({ type: 'ADDED', object: pod('d', '2') })
    expect(names()).toEqual(['d', 'c'])
  })

  it('shows list errors and retries', async () => {
    const fetch = stubLists() // first call fails
    const { list } = run(src)
    await settle()
    expect(list.error.value).toBe('boom')

    stubLists({ rv: '7', items: [pod('a', '7')] })
    await vi.advanceTimersByTimeAsync(1000)
    await settle()
    expect(fetch).toHaveBeenCalledOnce()
    expect(list.error.value).toBeNull()
    expect(list.items.value).toHaveLength(1)
  })

  it('flags a 403 as not permitted and clears it once listing works', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })))
    const { list } = run(src)
    await settle()
    expect(list.forbidden.value).toBe(true)

    stubLists({ rv: '1', items: [] })
    await vi.advanceTimersByTimeAsync(1000)
    await settle()
    expect(list.forbidden.value).toBe(false)
  })

  it('restarts when the source changes and stops when disposed', async () => {
    stubLists({ rv: '1', items: [pod('a', '1')] }, { rv: '2', items: [] })
    const ns = ref('demo')
    const { scope } = run(() => ({ cluster: 'dev-1', type: pods, namespace: ns.value }))
    await settle()
    const first = FakeSocket.all[0]!

    ns.value = 'other'
    await settle()
    expect(first.closed).toBe(true)
    const second = FakeSocket.all[1]!
    expect(new URL(second.url).searchParams.get('namespace')).toBe('other')

    scope.stop()
    expect(second.closed).toBe(true)
  })

  it('does nothing without a source', async () => {
    const fetch = stubLists()
    const { list } = run(null)
    await settle()
    expect(fetch).not.toHaveBeenCalled()
    expect(list.loading.value).toBe(false)
  })

  it('works with a custom list/watch source and restarts only when its key changes', async () => {
    const list = vi.fn(async () => ({ metadata: { resourceVersion: '42' }, items: [pod('p1', '40')] }))
    const key = ref('projects')
    const src = () => ({ key: key.value, list, watchUrl: (rv: string) => `ws://x/api/projects/_watch?resourceVersion=${rv}` })
    const { names } = run(src)
    await settle()
    expect(names()).toEqual(['p1'])
    expect(FakeSocket.all[0]!.url).toBe('ws://x/api/projects/_watch?resourceVersion=42')

    // A new function identity with the same key does not restart.
    key.value = 'projects'
    await settle()
    expect(list).toHaveBeenCalledOnce()
    key.value = 'projects-2'
    await settle()
    expect(list).toHaveBeenCalledTimes(2)
  })
})
