import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHealthStore } from './health'

describe('health store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.unstubAllGlobals())

  it('reports a failing audit log', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'ok', audit: 'failing: disk full' }))))
    const h = useHealthStore()
    await h.refresh()
    expect(h.auditFailing).toBe(true)
    expect(h.audit).toBe('failing: disk full')
  })

  it('stays ok while the audit log works', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'ok', audit: 'ok' }))))
    const h = useHealthStore()
    await h.refresh()
    expect(h.auditFailing).toBe(false)
  })

  it('reports the Project size presets source', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'ok', audit: 'ok', projectConfig: 'using built-in size defaults' }))))
    const h = useHealthStore()
    await h.refresh()
    expect(h.projectConfigNotice).toBe('using built-in size defaults')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'ok', audit: 'ok', projectConfig: 'ok' }))))
    await h.refresh()
    expect(h.projectConfigNotice).toBeNull()
  })
})
