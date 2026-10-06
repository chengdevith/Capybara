import { describe, expect, it, vi } from 'vitest'
import type { CatalogEntry, Installation } from '@/api/plugins'
import { createRegistry } from '../registry'
import { EXTENSION_API_VERSION } from '../types'
import { createPluginLoader } from './loader'

const page = () => Promise.resolve({ default: {} })

function entry(over: Partial<CatalogEntry> = {}, inst: Partial<Installation['status']> & { enabled?: boolean } = {}): CatalogEntry {
  const { enabled = true, ...status } = inst
  return {
    name: 'monitoring',
    spec: { version: '0.1.0' } as CatalogEntry['spec'],
    status: { available: true },
    trusted: true,
    ui: { url: '/api/plugins/_ui/monitoring/abc.js', sha256: 'abc' },
    installations: [
      {
        id: 'monitoring.dev-1', uid: 'u', config: {},
        spec: { plugin: 'monitoring', cluster: 'dev-1', mode: 'install', enabled, version: '0.1.0' },
        status: { phase: 'Ready', ...status },
      },
    ],
    ...over,
  }
}

function setup(mod: unknown, digest = 'abc') {
  const registry = createRegistry()
  const errors: Record<string, string | null> = {}
  const fetchText = vi.fn(async () => 'export default …')
  const loader = createPluginLoader({
    registry,
    fetchText,
    sha256Hex: async () => digest,
    importModule: async () => ({ default: mod }),
    onError: (n, m) => (errors[n] = m),
  })
  return { registry, loader, errors, fetchText }
}

const plugin = (over: object = {}) => ({
  name: 'monitoring',
  apiVersion: EXTENSION_API_VERSION,
  register(api: { register: (e: unknown) => void }) {
    api.register({ type: 'resource-detail-tab', id: 'monitoring.tab.metrics', label: 'Metrics', order: 50, kinds: ['Pod'], component: page })
  },
  ...over,
})

describe('plugin loader', () => {
  it('loads a verified bundle and gates its extensions per cluster', async () => {
    const { registry, loader, errors } = setup(plugin())
    await loader.sync([entry()])
    expect(errors.monitoring).toBeNull()
    const tab = registry.get('monitoring.tab.metrics')
    expect(tab?.source).toBe('monitoring')
    const ctx = (cluster: string | null, plugins: string[]) => ({ cluster, plugins: new Set(plugins) })
    expect(registry.active('resource-detail-tab', ctx('dev-1', ['monitoring']))).toHaveLength(1)
    expect(registry.active('resource-detail-tab', ctx('dev-2', []))).toHaveLength(0)
    expect(registry.active('resource-detail-tab', ctx(null, ['monitoring']))).toHaveLength(0)
  })

  it('refuses a bundle whose sha256 does not match the pin', async () => {
    const { registry, loader, errors } = setup(plugin(), 'evil')
    await loader.sync([entry()])
    expect(errors.monitoring).toMatch(/does not match the pinned/)
    expect(registry.get('monitoring.tab.metrics')).toBeUndefined()
  })

  it('skips the hash for dev bundles only', async () => {
    const { registry, loader } = setup(plugin(), 'whatever')
    await loader.sync([entry({ ui: { url: '/api/plugins/_ui/monitoring/dev.js', dev: true } })])
    expect(registry.get('monitoring.tab.metrics')).toBeDefined()
  })

  it('refuses another extension API version, another plugin name, and foreign ids', async () => {
    for (const [mod, msg] of [
      [plugin({ apiVersion: EXTENSION_API_VERSION + 1 }), /extension API/],
      [plugin({ name: 'other' }), /for plugin "other"/],
      [plugin({ register: (api: { register: (e: unknown) => void }) => api.register({ type: 'nav-item', id: 'core.nav.x', label: 'x', order: 1, route: 'x' }) }), /must start with "monitoring\."/],
    ] as const) {
      const { registry, loader, errors } = setup(mod)
      await loader.sync([entry()])
      expect(errors.monitoring).toMatch(msg)
      expect(registry.all('nav-item')).toHaveLength(0)
      expect(registry.all('resource-detail-tab')).toHaveLength(0)
    }
  })

  it('does not load for disabled, not-ready or untrusted plugins, and unloads when none is enabled', async () => {
    const { registry, loader, fetchText } = setup(plugin())
    await loader.sync([entry({}, { enabled: false })])
    await loader.sync([entry({}, { phase: 'Installing' })])
    await loader.sync([entry({ trusted: false })])
    expect(fetchText).not.toHaveBeenCalled()
    await loader.sync([entry()])
    expect(registry.get('monitoring.tab.metrics')).toBeDefined()
    await loader.sync([entry({}, { enabled: false })])
    expect(registry.get('monitoring.tab.metrics')).toBeUndefined()
    expect(loader.loaded()).toEqual([])
  })
})
