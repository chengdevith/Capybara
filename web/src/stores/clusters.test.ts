import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useClustersStore } from './clusters'

const cluster = (id: string) => ({
  id,
  displayName: id,
  environment: 'dev',
  status: { phase: 'Connected' as const, nodeCount: 1, lastChecked: '2026-01-01T00:00:00Z' },
})

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('clusters store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.unstubAllGlobals())

  it('loads clusters from /api/clusters', async () => {
    const fetch = mockFetch(200, [cluster('dev-1'), cluster('dev-2')])
    const store = useClustersStore()
    await store.load()
    expect(fetch).toHaveBeenCalledWith('/api/clusters', expect.anything())
    expect(store.items.map((c) => c.id)).toEqual(['dev-1', 'dev-2'])
    expect(store.byId('dev-2')?.id).toBe('dev-2')
    expect(store.byId('prod')).toBeUndefined()
    expect(store.loaded).toBe(true)
  })

  it('shares one request between concurrent loads and loads once', async () => {
    const fetch = mockFetch(200, [cluster('dev-1')])
    const store = useClustersStore()
    await Promise.all([store.ensureLoaded(), store.ensureLoaded(), store.load()])
    await store.ensureLoaded()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('keeps the API error message', async () => {
    mockFetch(500, { error: 'boom' })
    const store = useClustersStore()
    await store.load()
    expect(store.error).toBe('boom')
    expect(store.loaded).toBe(true)
  })

  it('polls so health changes show up', async () => {
    vi.useFakeTimers()
    const fetch = mockFetch(200, [cluster('dev-1')])
    const store = useClustersStore()
    store.startPolling(1000)
    store.startPolling(1000) // idempotent
    await vi.advanceTimersByTimeAsync(2500)
    expect(fetch).toHaveBeenCalledTimes(2)
    store.stopPolling()
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetch).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
