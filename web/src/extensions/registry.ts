import { shallowReactive } from 'vue'
import {
  EXTENSION_API_VERSION,
  type Extension,
  type ExtensionContext,
  type ExtensionOf,
  type ExtensionType,
  type Registered,
} from './types'

export type RegistryEvent = { kind: 'add' | 'remove'; extension: Registered }

/**
 * The extension registry. Core pages and (later) plugin bundles register
 * here; the sidebar, router and detail tabs only read from it.
 *
 * The list is reactive so extensions registered at runtime (plugins enabled
 * later) show up without a reload.
 */
export interface ExtensionRegistry {
  /** Registers an extension. Returns a function that unregisters it. */
  register(ext: Extension): () => void
  /** All extensions of a type, in registration order. */
  all<T extends ExtensionType>(type: T): Registered<ExtensionOf<T>>[]
  /** Extensions of a type whose `when` passes for ctx. */
  active<T extends ExtensionType>(type: T, ctx: ExtensionContext): Registered<ExtensionOf<T>>[]
  get(id: string): Registered | undefined
  /** Listens for registrations and removals. Returns an unsubscribe function. */
  subscribe(fn: (ev: RegistryEvent) => void): () => void
}

export class ExtensionError extends Error {}

export function createRegistry(): ExtensionRegistry {
  const items = shallowReactive<Registered[]>([])
  const listeners = new Set<(ev: RegistryEvent) => void>()

  const emit = (ev: RegistryEvent) => listeners.forEach((fn) => fn(ev))

  function validate(ext: Extension) {
    if (!ext.id) throw new ExtensionError('extension id is required')
    if (items.some((e) => e.id === ext.id)) {
      throw new ExtensionError(`extension "${ext.id}" is already registered`)
    }
    const version = ext.apiVersion ?? EXTENSION_API_VERSION
    if (version > EXTENSION_API_VERSION) {
      throw new ExtensionError(
        `extension "${ext.id}" needs extension API v${version}, this console supports v${EXTENSION_API_VERSION}`,
      )
    }
    if (ext.type === 'route' && ext.path.startsWith('/')) {
      throw new ExtensionError(`route "${ext.id}": path must be relative (got "${ext.path}")`)
    }
  }

  return {
    register(ext) {
      validate(ext)
      const registered = Object.freeze({
        ...ext,
        source: ext.source ?? 'core',
        apiVersion: ext.apiVersion ?? EXTENSION_API_VERSION,
      }) as Registered
      items.push(registered)
      emit({ kind: 'add', extension: registered })

      return () => {
        const i = items.indexOf(registered)
        if (i === -1) return
        items.splice(i, 1)
        emit({ kind: 'remove', extension: registered })
      }
    },

    all(type) {
      return items.filter((e) => e.type === type) as Registered<ExtensionOf<typeof type>>[]
    },

    active(type, ctx) {
      return this.all(type).filter((e) => isActive(e, ctx))
    },

    get(id) {
      return items.find((e) => e.id === id)
    },

    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

export function isActive(ext: Pick<Extension, 'when'>, ctx: ExtensionContext): boolean {
  return ext.when ? ext.when(ctx) : true
}

export function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order
}
