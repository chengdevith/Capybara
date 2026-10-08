import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import type { CatalogEntry } from '@/api/plugins'
import { usePluginsStore } from './plugins'

describe('plugins store', () => {
  it('names the plugin that governs writes of a kind', () => {
    setActivePinia(createPinia())
    const store = usePluginsStore()
    store.catalog = [{
      name: 'tekton', status: { available: true }, trusted: true, installations: [],
      spec: { displayName: 'Pipelines', objects: [{ name: 'tasks', group: 'tekton.dev', version: 'v1', resource: 'tasks', kind: 'Task', verbs: ['create'] }] },
    } as unknown as CatalogEntry]
    expect(store.governing('tekton.dev', 'tasks')).toEqual({ plugin: 'tekton', object: 'tasks', displayName: 'Pipelines' })
    expect(store.governing('tekton.dev', 'taskruns')).toBeNull()
    expect(store.governing('apps', 'deployments')).toBeNull()
  })
})
