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

/** A rule an object breaks, at a field path such as "spec.steps[0].image". */
export interface ObjectProblem {
  path: string
  message: string
}

/** Error from Capybara or a plugin backend, with its HTTP status. A refused
 * object write (422) carries the problems and warnings. */
export class PluginRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly problems: ObjectProblem[] = [],
    readonly warnings: string[] = [],
  ) {
    super(message)
  }
}

async function capybaraRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  let body: { error?: string; problems?: ObjectProblem[]; warnings?: string[] } & Record<string, unknown> = {}
  try {
    body = (await res.json()) as typeof body
  } catch {
    // not JSON
  }
  if (!res.ok) {
    throw new PluginRequestError(res.status, body.error ?? `${res.status} ${res.statusText}`, body.problems ?? [], body.warnings ?? [])
  }
  return body as T
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
  const body = await capybaraRequest<{ created?: string }>(`/api/${path}`, { method: 'POST', body: JSON.stringify(target) })
  return body.created ?? ''
}

/** A Kubernetes object as plain JSON. */
export type PlainObject = Record<string, unknown>

/** What validating an object found (nothing is written). */
export interface ObjectCheck {
  problems: ObjectProblem[]
  warnings: string[]
  /** The object as it would be written (defaults applied). */
  object?: PlainObject
}

/**
 * Writes the objects a plugin declares in plugin.yaml (`objects`), in
 * Project namespaces only (1.2). Capybara checks every write against the
 * object's policy, the Project's ServiceAccounts and quota, dry-runs it,
 * then writes and audits it; a refusal throws PluginRequestError with
 * `problems` (status 422).
 */
export const pluginObjects = {
  url(cluster: string, plugin: string, object: string, namespace: string, name?: string): string {
    const parts = ['clusters', cluster, 'plugin-objects', plugin, object, namespace, ...(name ? [name] : [])]
    return '/api/' + parts.map(encodeURIComponent).join('/')
  },
  /** Checks a new object, or an edit of `name`. */
  validate(cluster: string, plugin: string, object: string, namespace: string, obj: PlainObject, name?: string): Promise<ObjectCheck> {
    return capybaraRequest(`${this.url(cluster, plugin, object, namespace)}/_validate`, {
      method: 'POST',
      body: JSON.stringify({ object: obj, ...(name ? { name } : {}) }),
    })
  },
  create(cluster: string, plugin: string, object: string, namespace: string, obj: PlainObject): Promise<{ object: PlainObject; warnings: string[] }> {
    return capybaraRequest(this.url(cluster, plugin, object, namespace), { method: 'POST', body: JSON.stringify({ object: obj }) })
  },
  /** Updates `name`; uid and resourceVersion are the ones loaded (a change since is refused). */
  update(
    cluster: string, plugin: string, object: string, namespace: string, name: string, obj: PlainObject,
    loaded: { uid: string; resourceVersion: string },
  ): Promise<{ object: PlainObject; warnings: string[] }> {
    return capybaraRequest(this.url(cluster, plugin, object, namespace, name), {
      method: 'PUT',
      body: JSON.stringify({ object: obj, uid: loaded.uid, resourceVersion: loaded.resourceVersion }),
    })
  },
  remove(cluster: string, plugin: string, object: string, namespace: string, name: string, uid: string): Promise<unknown> {
    return capybaraRequest(`${this.url(cluster, plugin, object, namespace, name)}?uid=${encodeURIComponent(uid)}`, { method: 'DELETE' })
  },
  /** Deletes finished objects, keeping the newest `keep` per group. */
  cleanup(
    cluster: string, plugin: string, object: string, namespace: string, opts: { keep: number; group?: string; dryRun?: boolean },
  ): Promise<{ deleted: string[] }> {
    return capybaraRequest(`${this.url(cluster, plugin, object, namespace)}/_cleanup`, { method: 'POST', body: JSON.stringify(opts) })
  },
}
