import { inject, type InjectionKey } from 'vue'
import { createRegistry, type ExtensionRegistry } from './registry'

export * from './types'
export * from './registry'
export * from './resolve'

/** The app-wide registry. Core registers into it at startup; the runtime
 * plugin loader (Phase 4.5) will register into the same instance. */
export const registry = createRegistry()

export const registryKey: InjectionKey<ExtensionRegistry> = Symbol('extension-registry')

/** The registry provided by the app (tests provide their own). */
export function useRegistry(): ExtensionRegistry {
  return inject(registryKey, registry)
}
