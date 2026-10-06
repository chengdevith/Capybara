import type { PluginApi, PluginExtension, PluginModule } from '@capybara/sdk'
import type { CatalogEntry } from '@/api/plugins'
import { isActiveInstallation } from '@/api/plugins'
import type { ExtensionRegistry } from '../registry'
import { EXTENSION_API_VERSION, type ExtensionContext } from '../types'

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
    const unregister: (() => void)[] = []
    const api: PluginApi = {
      name,
      apiVersion: EXTENSION_API_VERSION,
      register(ext: PluginExtension) {
        if (!ext.id.startsWith(`${name}.`)) throw new Error(`plugin ${name}: extension id "${ext.id}" must start with "${name}."`)
        unregister.push(deps.registry.register({ ...ext, source: name, when: gate(name, ext.when) } as PluginExtension))
      },
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
