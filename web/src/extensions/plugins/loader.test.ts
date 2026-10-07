import { describe, expect, it, vi } from 'vitest'
import type { PluginApi } from '@capybara/sdk'
import type { CatalogEntry, Installation } from '@/api/plugins'
import { createRegistry } from '../registry'
import { EXTENSION_API_MINOR, EXTENSION_API_VERSION } from '../types'
import { checkMinApi, createPluginLoader } from './loader'

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

  it('refuses a bundle that needs a newer minor API, with a clear message', async () => {
    expect(checkMinApi(undefined)).toBe('')
    expect(checkMinApi('1.0')).toBe('')
    expect(checkMinApi(`1.${EXTENSION_API_MINOR}`)).toBe('')
    expect(checkMinApi('1.x')).toMatch(/not <major>.<minor>/)
    const { registry, loader, errors } = setup(plugin({ minApi: '1.9' }))
    await loader.sync([entry()])
    expect(errors.monitoring).toBe(`needs extension API 1.9; this Capybara provides 1.${EXTENSION_API_MINOR}`)
    expect(registry.all('resource-detail-tab')).toHaveLength(0)
  })

  it('registers plugin resources on the generic pages, gated and removed on unload', async () => {
    const def = {
      id: 'monitoring.widgets', label: 'Widgets', singular: 'Widget', path: 'widgets', columns: [],
      type: { group: 'example.com', version: 'v1', plural: 'widgets', kind: 'Widget', namespaced: true },
    }
    const mod = plugin({
      minApi: '1.1',
      register(api: PluginApi) {
        expect(api.apiMinor).toBe(EXTENSION_API_MINOR)
        expect(api.components.LogViewer).toBeDefined()
        expect(api.composables.useLiveList).toBeTypeOf('function')
        api.registerResource(def, { order: 10, section: 'monitoring.section' })
      },
    })
    const { registry, loader, errors } = setup(mod)
    await loader.sync([entry()])
    expect(errors.monitoring).toBeNull()
    const detail = registry.get('monitoring.widgets.detail')
    expect(detail).toMatchObject({ type: 'route', source: 'monitoring', path: 'widgets/:namespace/:name' })
    const ctx = (cluster: string, plugins: string[]) => ({ cluster, plugins: new Set(plugins) })
    expect(registry.active('route', ctx('dev-1', ['monitoring'])).map((r) => r.id)).toEqual(['monitoring.widgets.list', 'monitoring.widgets.detail'])
    expect(registry.active('nav-item', ctx('dev-2', []))).toHaveLength(0)
    await loader.sync([])
    expect(registry.get('monitoring.widgets.list')).toBeUndefined()
    expect(registry.get('monitoring.widgets.nav')).toBeUndefined()
  })

  it('refuses resources outside the plugin namespace', async () => {
    const mod = plugin({
      register(api: PluginApi) {
        api.registerResource({ id: 'core.widgets', label: 'W', singular: 'W', path: 'w', columns: [], type: { group: '', version: 'v1', plural: 'w', kind: 'W', namespaced: false } }, { order: 1 })
      },
    })
    const { registry, loader, errors } = setup(mod)
    await loader.sync([entry()])
    expect(errors.monitoring).toMatch(/resource id "core.widgets" must start with "monitoring\."/)
    expect(registry.all('route')).toHaveLength(0)
  })
})
