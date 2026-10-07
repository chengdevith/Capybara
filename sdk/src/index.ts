/**
 * @capybara/sdk — what Capybara offers plugin UI bundles.
 *
 * Plugins import it (and vue, pinia, naive-ui) as bare modules; Capybara
 * provides the one shared copy through its import map, so plugin bundles
 * never include them. The extension API is versioned: a bundle declares
 * the major version it was written for (refused by a Capybara that provides
 * another) and the minimum minor version it needs (minApi, refused by an
 * older Capybara).
 */
import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { Extension } from './extensions'
import type { PluginComponents, PluginComposables, PluginResourceDef, ResourceNav } from './resources'

export * from './extensions'
export * from './resources'

/** An extension contributed by a plugin. Its id must start with
 * "<plugin>." and it is active only on clusters where the plugin is
 * installed and enabled (Capybara adds that condition). */
export type PluginExtension = Extension

/** What a plugin's register function receives. */
export interface PluginApi {
  /** The plugin's name (from its manifest). */
  readonly name: string
  /** The extension API version this Capybara provides. */
  readonly apiVersion: number
  /** Its minor version (EXTENSION_API_MINOR). */
  readonly apiMinor: number
  /** Adds an extension (see PluginExtension). */
  register(ext: PluginExtension): void
  /**
   * Shows a kind with the console's generic list and detail pages, plus a
   * sidebar item (1.1). `def.id` must start with "<plugin>.". Detail tabs
   * and actions for the kind are ordinary extensions matched by kind.
   */
  registerResource(def: PluginResourceDef, nav: ResourceNav): void
  /** Console components plugins may use (1.1). */
  readonly components: PluginComponents
  /** Console composables plugins may use (1.1). */
  readonly composables: PluginComposables
}

/** A plugin UI bundle's default export. */
export interface PluginModule {
  name: string
  /** EXTENSION_API_VERSION the bundle was written for. */
  apiVersion: number
  /** Lowest extension API it needs, '<major>.<minor>' (e.g. '1.1').
   * Must agree with minExtensionApi in plugin.yaml. Default '1.0'. */
  minApi?: string
  register(api: PluginApi): void | Promise<void>
}

/** Declares a plugin bundle (typed identity helper). */
export function definePlugin(m: PluginModule): PluginModule {
  return m
}

/** The cluster id in the current URL, or null on global pages. */
export function useCluster(): ComputedRef<string | null> {
  const route = useRoute()
  return computed(() => {
    const c = route.params.cluster
    return typeof c === 'string' && c !== '' ? c : null
  })
}

/** Error from a plugin backend, with its HTTP status. */
export class PluginRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Calls the plugin's own backend through Capybara (GET by default):
 * pluginFetch('monitoring', '/clusters/dev-1/overview'). */
export async function pluginFetch<T>(plugin: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/plugins/${encodeURIComponent(plugin)}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) msg = body.error
    } catch {
      // not JSON
    }
    throw new PluginRequestError(res.status, msg)
  }
  return (await res.json()) as T
}

/** A run of an action the plugin declares in plugin.yaml (`actions`). */
export interface PluginActionTarget {
  namespace?: string
  name: string
  /** The object's uid as loaded: Capybara refuses if it changed since. */
  uid: string
}

/**
 * Runs a declared action on an object (1.1): Capybara does the write with
 * the plugin's console permissions and audits it as "<plugin>.<action>".
 * Resolves to the name of the object a copy action created ('' for patch).
 */
export async function pluginAction(cluster: string, plugin: string, action: string, target: PluginActionTarget): Promise<string> {
  const path = ['clusters', cluster, 'plugin-actions', plugin, action].map(encodeURIComponent).join('/')
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(target),
  })
  let body: { error?: string; created?: string } = {}
  try {
    body = (await res.json()) as typeof body
  } catch {
    // not JSON
  }
  if (!res.ok) throw new PluginRequestError(res.status, body.error ?? `${res.status} ${res.statusText}`)
  return body.created ?? ''
}
