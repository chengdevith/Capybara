/**
 * @capybara/sdk — what Capybara offers plugin UI bundles.
 *
 * Plugins import it (and vue, pinia, naive-ui) as bare modules; Capybara
 * provides the one shared copy through its import map, so plugin bundles
 * never include them. The extension API is versioned: a bundle declares
 * the version it was written for and is refused by a Capybara that
 * provides another.
 */
import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { Extension } from './extensions'

export * from './extensions'

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
  /** Adds an extension (see PluginExtension). */
  register(ext: PluginExtension): void
}

/** A plugin UI bundle's default export. */
export interface PluginModule {
  name: string
  /** EXTENSION_API_VERSION the bundle was written for. */
  apiVersion: number
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
