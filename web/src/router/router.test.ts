import { describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createRegistry } from '@/extensions'
import { CLUSTER_ROUTE, LAYOUT_ROUTE, NOT_FOUND_ROUTE, createAppRouter } from '.'

const page = () => Promise.resolve({ default: { render: () => null } })
const STRUCTURAL = new Set([LAYOUT_ROUTE, CLUSTER_ROUTE, NOT_FOUND_ROUTE, 'root', 'cluster-index'])

function setup() {
  const r = createRegistry()
  r.register({ type: 'route', id: 'core.home', path: 'home', scope: 'cluster', component: page })
  r.register({ type: 'nav-item', id: 'nav.home', label: 'Home', order: 0, route: 'core.home' })
  r.register({ type: 'route', id: 'core.settings', path: 'settings', scope: 'global', component: page })
  return { r, router: createAppRouter(r, createMemoryHistory()) }
}

describe('router', () => {
  it('builds every feature route from route extensions', () => {
    const { r, router } = setup()
    const featureRoutes = router.getRoutes().map((rt) => String(rt.name)).filter((n) => !STRUCTURAL.has(n))
    expect(featureRoutes.sort()).toEqual(r.all('route').map((e) => e.id).sort())
  })

  it('puts cluster routes under /c/:cluster and global routes at the root', () => {
    const { router } = setup()
    expect(router.resolve({ name: 'core.home', params: { cluster: 'dev-2' } }).path).toBe('/c/dev-2/home')
    expect(router.resolve({ name: 'core.settings' }).path).toBe('/settings')
  })

  it('lands /c/:cluster on the first sidebar page of that cluster', async () => {
    const { router } = setup()
    await router.push('/c/dev-1')
    expect(router.currentRoute.value.fullPath).toBe('/c/dev-1/home')
  })

  it('adds and removes routes registered after startup', async () => {
    const { r, router } = setup()
    const off = r.register({ type: 'route', id: 'plugin.page', path: 'plugin', scope: 'cluster', component: page })
    await router.push('/c/dev-1/plugin')
    expect(router.currentRoute.value.name).toBe('plugin.page')
    off()
    expect(router.hasRoute('plugin.page')).toBe(false)
  })

  it('treats a route whose when() fails on this cluster as not found', async () => {
    const { r, router } = setup()
    r.register({
      type: 'route', id: 'plugin.metrics', path: 'metrics', scope: 'cluster', component: page,
      when: (ctx) => ctx.cluster === 'dev-2',
    })
    await router.push('/c/dev-1/metrics')
    expect(router.currentRoute.value.name).toBe(NOT_FOUND_ROUTE)
    await router.push('/c/dev-2/metrics')
    expect(router.currentRoute.value.name).toBe('plugin.metrics')
  })
})
