import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Target } from '@/api/actions'
import type { ResourceType } from '@/api/k8s'
import { parseObject, toEditableYaml, toYaml } from '@/components/resource/yaml'
import { useApplyFlow } from './useApplyFlow'

const type: ResourceType = { group: 'apps', version: 'v1', plural: 'deployments', kind: 'Deployment', namespaced: true }
const target: Target = { group: 'apps', version: 'v1', resource: 'deployments', kind: 'Deployment', namespace: 'demo', name: 'web' }
const obj = {
  metadata: {
    name: 'web', namespace: 'demo', uid: 'u1', resourceVersion: '7', creationTimestamp: '2026-01-01T00:00:00Z',
    managedFields: [{ manager: 'kubectl' }],
  },
  spec: { replicas: 2 },
  status: { readyReplicas: 2 },
}

function reply(status: number, body: unknown) {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('yaml helpers', () => {
  it('shows kubectl key order and hides managed fields unless asked', () => {
    const text = toYaml(type, obj)
    expect(text.startsWith('apiVersion: apps/v1\nkind: Deployment\nmetadata:')).toBe(true)
    expect(text).not.toContain('managedFields')
    expect(toYaml(type, obj, { managedFields: true })).toContain('managedFields')
    expect(text).toContain('status:')
  })

  it('editable YAML drops status and server-owned metadata but keeps resourceVersion', () => {
    const text = toEditableYaml(type, obj)
    expect(text).not.toMatch(/status:|managedFields|creationTimestamp/)
    expect(text).toContain('resourceVersion: "7"')
  })

  it('rejects YAML that is not one object', () => {
    expect(() => parseObject('- a\n- b')).toThrow(/one object/)
    expect(() => parseObject('a: [1, 2')).toThrow(/not valid/)
    expect(parseObject('a: 1')).toEqual({ a: 1 })
  })
})

describe('useApplyFlow', () => {
  afterEach(() => vi.unstubAllGlobals())
  const flow = () => useApplyFlow(() => 'dev-1', () => target, () => type)

  it('review runs a dry run and shows the server result', async () => {
    const fetch = reply(200, { object: { ...obj, spec: { replicas: 3 } }, dryRun: true })
    const f = flow()
    await f.review(toEditableYaml(type, obj).replace('replicas: 2', 'replicas: 3'))
    const [url, init] = fetch.mock.calls[0]!
    expect(url).toBe('/api/clusters/dev-1/apply?dryRun=true')
    expect(JSON.parse(String(init!.body)).object.spec.replicas).toBe(3)
    expect(f.phase.value).toBe('reviewing')
    expect(f.preview.value).toContain('replicas: 3')
  })

  it('apply sends a real apply, force only when asked', async () => {
    const fetch = reply(200, { object: obj, dryRun: false })
    const f = flow()
    await f.apply('apiVersion: apps/v1\nkind: Deployment\nmetadata: {name: web}')
    expect(fetch.mock.calls[0]![0]).toBe('/api/clusters/dev-1/apply')
    expect(f.phase.value).toBe('done')
    await f.apply('a: 1', { force: true })
    expect(fetch.mock.calls[1]![0]).toBe('/api/clusters/dev-1/apply?force=true')
  })

  it('lists field-manager conflicts', async () => {
    reply(409, { error: 'Apply failed', conflicts: [{ field: '.spec.replicas', manager: 'kubectl-client-side-apply', message: 'm' }] })
    const f = flow()
    await f.apply('a: 1')
    expect(f.phase.value).toBe('conflict')
    expect(f.conflicts.value[0]).toMatchObject({ field: '.spec.replicas', manager: 'kubectl-client-side-apply' })
  })

  it('flags a stale object separately from conflicts', async () => {
    reply(409, { error: 'the object has been modified', stale: true })
    const f = flow()
    await f.apply('a: 1')
    expect(f.phase.value).toBe('stale')
    expect(f.conflicts.value).toEqual([])
  })

  it('shows parse and server errors without leaving editing', async () => {
    const fetch = reply(400, { error: 'metadata.name must stay "web"' })
    const f = flow()
    await f.review('- not\n- an object')
    expect(f.error.value).toMatch(/one object/)
    expect(fetch).not.toHaveBeenCalled()
    await f.apply('a: 1')
    expect(f.error.value).toBe('metadata.name must stay "web"')
    expect(f.phase.value).toBe('editing')
  })
})
