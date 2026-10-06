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
})
