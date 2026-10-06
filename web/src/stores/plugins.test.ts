import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePluginsStore } from './plugins'

const inst = (cluster: string, phase: string, enabled = true, deleting = false) => ({
  id: `monitoring.${cluster}`, uid: 'u', config: {}, deleting,
  spec: { plugin: 'monitoring', cluster, mode: 'install', enabled, version: '0.1.0' },
  status: { phase },
})

describe('plugins store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.unstubAllGlobals())

  it('knows which plugins are enabled on each cluster', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      { name: 'monitoring', spec: {}, status: { available: true }, trusted: true, installations: [
        inst('dev-1', 'Ready'), inst('dev-2', 'Ready', false), inst('dev-3', 'Installing'), inst('dev-4', 'Ready', true, true),
      ] },
    ]))))
    const s = usePluginsStore()
    const seen: number[] = []
    s.onChange((c) => seen.push(c.length))
    await s.load()
    expect([...s.enabledOn('dev-1')]).toEqual(['monitoring'])
    for (const c of ['dev-2', 'dev-3', 'dev-4', null]) expect(s.enabledOn(c).size).toBe(0)
    expect(seen).toEqual([1])
  })
})
