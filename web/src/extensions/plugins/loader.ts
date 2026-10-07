import type { PluginApi, PluginExtension, PluginModule, PluginResourceDef } from '@capybara/sdk'
import { defineAsyncComponent } from 'vue'
import type { CatalogEntry } from '@/api/plugins'
import { isActiveInstallation } from '@/api/plugins'
import type { ResourceDef } from '@/components/resource/types'
import { useLiveList } from '@/composables/useLiveList'
import { registerResource } from '../core/resources/register'
import type { ExtensionRegistry } from '../registry'
import { EXTENSION_API_MINOR, EXTENSION_API_VERSION, type Extension, type ExtensionContext } from '../types'

/**
 * Loads plugin UI bundles at runtime into the extension registry.
 *
 * A bundle is loaded once some cluster has its plugin installed and
 * enabled, and unloaded when none has. Before importing, the bytes are
 * checked against the sha256 pinned in the plugin's manifest (the server
 * already refuses to serve anything else; this is the browser's own check).
 * Every extension a plugin registers must be named "<plugin>.…" and is
 * active only on clusters where that plugin is enabled.
 *
 * Bundles run with full console access (no sandbox yet; see ADR 0006).
 */
export interface LoaderDeps {
  registry: ExtensionRegistry
  fetchText?: (url: string) => Promise<string>
  importModule?: (code: string) => Promise<{ default?: unknown }>
  sha256Hex?: (text: string) => Promise<string>
  onError?: (plugin: string, message: string | null) => void
}

interface Loaded {
  key: string
  unregister: (() => void)[]
}

async function defaultSha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function defaultFetchText(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`bundle request failed (${res.status})`)
  return res.text()
}

// Import the verified text itself (not the URL again), so what runs is
// exactly what was checked. Bare imports resolve through the import map.
async function defaultImport(code: string): Promise<{ default?: unknown }> {
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    return (await import(/* @vite-ignore */ url)) as { default?: unknown }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function gate(plugin: string, when?: (ctx: ExtensionContext) => boolean) {
  return (ctx: ExtensionContext) => ctx.cluster !== null && ctx.plugins.has(plugin) && (when ? when(ctx) : true)
}

/** Why a bundle's minApi cannot be served ('' when it can). */
export function checkMinApi(minApi: string | undefined): string {
  if (minApi === undefined) return ''
  const m = /^(\d+)\.(\d+)$/.exec(minApi)
  if (!m) return `minApi "${minApi}" is not <major>.<minor>`
  const [major, minor] = [Number(m[1]), Number(m[2])]
  if (major !== EXTENSION_API_VERSION || minor > EXTENSION_API_MINOR) {
    return `needs extension API ${minApi}; this Capybara provides ${EXTENSION_API_VERSION}.${EXTENSION_API_MINOR}`
  }
  return ''
}

// Shared with every plugin; loaded on first use.
const components: PluginApi['components'] = Object.freeze({
  LogViewer: defineAsyncComponent(() => import('@/components/logs/LogViewer.vue')),
  ResourceLink: defineAsyncComponent(() => import('@/components/resource/ResourceLink.vue')),
})
type Composables = PluginApi['composables']
const composables: Composables = Object.freeze({
  // Same objects as the console's own; only the SDK's narrower types differ.
  useLiveList: ((source, opts) => useLiveList(source, { sort: opts?.sort, max: opts?.max })) as Composables['useLiveList'],
})

function isPluginModule(m: unknown): m is PluginModule {
  const p = m as PluginModule
  return !!p && typeof p.name === 'string' && typeof p.apiVersion === 'number' && typeof p.register === 'function'
}

export function createPluginLoader(deps: LoaderDeps) {
  const fetchText = deps.fetchText ?? defaultFetchText
  const importModule = deps.importModule ?? defaultImport
  const sha256Hex = deps.sha256Hex ?? defaultSha256Hex
  const report = deps.onError ?? (() => {})
  const loaded = new Map<string, Loaded>()
  let queue = Promise.resolve()

  function unload(name: string) {
    const l = loaded.get(name)
    if (!l) return
    l.unregister.reverse().forEach((fn) => fn())
    loaded.delete(name)
  }

  async function load(entry: CatalogEntry, key: string) {
    const ui = entry.ui!
    const name = entry.name
    const code = await fetchText(ui.url)
    if (!ui.dev) {
      const got = await sha256Hex(code)
      if (got !== ui.sha256) throw new Error(`bundle sha256 ${got.slice(0, 12)}… does not match the pinned ${ui.sha256?.slice(0, 12)}…`)
    }
    const mod = (await importModule(code)).default
    if (!isPluginModule(mod)) throw new Error('the bundle does not export a plugin (definePlugin) as default')
    if (mod.name !== name) throw new Error(`the bundle is for plugin "${mod.name}"`)
    if (mod.apiVersion !== EXTENSION_API_VERSION) {
      throw new Error(`written for extension API v${mod.apiVersion}; this console provides v${EXTENSION_API_VERSION}`)
    }
    const tooNew = checkMinApi(mod.minApi)
    if (tooNew) throw new Error(tooNew)
    const unregister: (() => void)[] = []
    // Everything a plugin adds goes through here: its own ids only, tagged
    // with its name, active only where it is installed and enabled.
    const scoped = {
      register(ext: Extension) {
        if (!ext.id.startsWith(`${name}.`)) throw new Error(`plugin ${name}: extension id "${ext.id}" must start with "${name}."`)
        const off = deps.registry.register({ ...ext, source: name, when: gate(name, ext.when) } as PluginExtension)
        unregister.push(off)
        return off
      },
    }
    const api: PluginApi = {
      name,
      apiVersion: EXTENSION_API_VERSION,
      apiMinor: EXTENSION_API_MINOR,
      register(ext: PluginExtension) {
        scoped.register(ext)
      },
      registerResource(def: PluginResourceDef, nav) {
        if (!def.id.startsWith(`${name}.`)) throw new Error(`plugin ${name}: resource id "${def.id}" must start with "${name}."`)
        const core: ResourceDef = def
        registerResource(scoped, Object.freeze({ ...core }), nav)
      },
      components,
      composables,
    }
    try {
      await mod.register(api)
    } catch (e) {
      unregister.reverse().forEach((fn) => fn())
      throw e
    }
    loaded.set(name, { key, unregister })
  }

  /** Brings loaded bundles in line with the catalog. Calls are serialised. */
  function sync(catalog: CatalogEntry[]): Promise<void> {
    queue = queue.then(async () => {
      const wanted = new Map<string, CatalogEntry>()
      for (const p of catalog) {
        if (p.ui && p.trusted && p.installations.some(isActiveInstallation)) wanted.set(p.name, p)
      }
      for (const name of [...loaded.keys()]) {
        if (!wanted.has(name)) unload(name)
      }
      for (const [name, entry] of wanted) {
        const key = entry.ui!.dev ? `dev:${entry.spec.version}` : entry.ui!.sha256!
        if (loaded.get(name)?.key === key) continue
        unload(name)
        try {
          await load(entry, key)
          report(name, null)
        } catch (e) {
          report(name, e instanceof Error ? e.message : String(e))
        }
      }
    })
    return queue
  }

  return { sync, loaded: () => [...loaded.keys()] }
}
