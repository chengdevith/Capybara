import { describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { createRegistry, ExtensionError } from './registry'
import { EXTENSION_API_VERSION } from './types'

const page = () => Promise.resolve({ default: {} })

describe('extension registry', () => {
  it('fills defaults and freezes registered extensions', () => {
    const r = createRegistry()
    r.register({ type: 'nav-section', id: 's', label: 'S', order: 1 })
    const s = r.get('s')!
    expect(s.source).toBe('core')
    expect(s.apiVersion).toBe(EXTENSION_API_VERSION)
    expect(Object.isFrozen(s)).toBe(true)
  })

  it('rejects duplicate ids across types', () => {
    const r = createRegistry()
    r.register({ type: 'nav-section', id: 'x', label: 'X', order: 1 })
    expect(() => r.register({ type: 'nav-item', id: 'x', label: 'X', order: 1, route: 'r' })).toThrow(ExtensionError)
  })

  it('rejects extensions built for a newer API', () => {
    const r = createRegistry()
    expect(() =>
      r.register({ type: 'nav-section', id: 'new', label: 'N', order: 1, apiVersion: EXTENSION_API_VERSION + 1 }),
    ).toThrow(/needs extension API/)
  })

  it('rejects absolute route paths', () => {
    const r = createRegistry()
    expect(() => r.register({ type: 'route', id: 'r', path: '/abs', scope: 'cluster', component: page })).toThrow(
      /relative/,
    )
  })

  it('filters by when() with the given context', () => {
    const r = createRegistry()
    r.register({ type: 'nav-section', id: 'always', label: 'A', order: 1 })
    r.register({ type: 'nav-section', id: 'dev2', label: 'B', order: 2, when: (ctx) => ctx.cluster === 'dev-2' })
    expect(r.active('nav-section', { cluster: 'dev-1', plugins: new Set<string>() }).map((e) => e.id)).toEqual(['always'])
    expect(r.active('nav-section', { cluster: 'dev-2', plugins: new Set<string>() }).map((e) => e.id)).toEqual(['always', 'dev2'])
  })

  it('notifies subscribers and supports unregistering', () => {
    const r = createRegistry()
    const events = vi.fn()
    r.subscribe((ev) => events(ev.kind, ev.extension.id))
    const off = r.register({ type: 'nav-section', id: 's', label: 'S', order: 1 })
    off()
    expect(events.mock.calls).toEqual([
      ['add', 's'],
      ['remove', 's'],
    ])
    expect(r.get('s')).toBeUndefined()
  })

  it('is reactive, so late registrations update computed views', () => {
    const r = createRegistry()
    const count = computed(() => r.all('nav-section').length)
    expect(count.value).toBe(0)
    r.register({ type: 'nav-section', id: 's', label: 'S', order: 1 })
    expect(count.value).toBe(1)
  })
})
