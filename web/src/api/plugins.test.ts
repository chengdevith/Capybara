import { describe, expect, it } from 'vitest'
import { hasData, type PluginSpec } from './plugins'

const spec = (rules: PluginSpec['permissions']) => ({ permissions: rules }) as PluginSpec

describe('hasData', () => {
  it('is true only when the installer may list and delete PersistentVolumeClaims', () => {
    expect(hasData(spec({ install: { clusterRules: [{ apiGroups: [''], resources: ['pods', 'persistentvolumeclaims'], verbs: ['get', 'list', 'watch', 'delete'] }] } }))).toBe(true)
    expect(hasData(spec({ install: { clusterRules: [{ apiGroups: [''], resources: ['namespaces'], verbs: ['delete'] }] } }))).toBe(false)
    expect(hasData(spec({ install: { clusterRules: [{ apiGroups: [''], resources: ['persistentvolumeclaims'], verbs: ['get'] }] } }))).toBe(false)
    expect(hasData(spec({ install: { clusterRules: [{ apiGroups: [''], resources: ['persistentvolumeclaims'], resourceNames: ['x'], verbs: ['list', 'delete'] }] } }))).toBe(false)
    expect(hasData(spec(undefined))).toBe(false)
  })
})
