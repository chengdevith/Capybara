import { describe, expect, it } from 'vitest'
import { hasData, isActiveInstallation, type Installation, type PluginSpec } from './plugins'

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

describe('isActiveInstallation', () => {
  const inst = (phase: string, extra: Record<string, unknown> = {}) =>
    ({ spec: { enabled: true }, status: { phase, ...extra } }) as unknown as Installation
  const installed = { installedVersion: '0.2.0', conditions: [{ type: 'Installed', status: 'True', reason: 'AllStepsPassed' }] }
  it('keeps the UI of an installed plugin whose step fails later, not of a refused request', () => {
    expect(isActiveInstallation(inst('Ready', installed))).toBe(true)
    expect(isActiveInstallation(inst('Error', installed))).toBe(true)
    expect(isActiveInstallation(inst('Error'))).toBe(false)
    expect(isActiveInstallation(inst('Installing'))).toBe(false)
    expect(isActiveInstallation({ ...inst('Ready', installed), deleting: true })).toBe(false)
  })
})
