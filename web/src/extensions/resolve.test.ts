import { describe, expect, it, vi } from 'vitest'
import { createRegistry } from './registry'
import { detailTabs, firstNavRoute, navTree } from './resolve'

const page = () => Promise.resolve({ default: {} })

function sample() {
  const r = createRegistry()
  r.register({ type: 'nav-section', id: 'workloads', label: 'Workloads', order: 10 })
  r.register({ type: 'nav-section', id: 'storage', label: 'Storage', order: 30 })
  for (const id of ['home', 'pods', 'deploys', 'metrics']) {
    r.register({ type: 'route', id: `route.${id}`, path: id, scope: 'cluster', component: page })
  }
  r.register({ type: 'nav-item', id: 'nav.deploys', label: 'Deployments', order: 2, section: 'workloads', route: 'route.deploys' })
  r.register({ type: 'nav-item', id: 'nav.pods', label: 'Pods', order: 1, section: 'workloads', route: 'route.pods' })
  r.register({ type: 'nav-item', id: 'nav.home', label: 'Home', order: 0, route: 'route.home' })
  r.register({
    type: 'nav-item', id: 'nav.metrics', label: 'Metrics', order: 50, route: 'route.metrics', source: 'monitoring',
    when: (ctx) => ctx.cluster === 'dev-2',
  })
  return r
}

const labels = (r: ReturnType<typeof sample>, cluster: string) =>
  navTree(r, { cluster }).map((e) =>
    e.kind === 'item' ? e.item.label : `${e.section.label}[${e.items.map((i) => i.label).join(',')}]`,
  )

describe('navTree', () => {
  it('orders items and sections, and hides empty sections', () => {
    expect(labels(sample(), 'dev-1')).toEqual(['Home', 'Workloads[Pods,Deployments]'])
  })

  it('shows per-cluster contributions only where they are active', () => {
    expect(labels(sample(), 'dev-2')).toEqual(['Home', 'Workloads[Pods,Deployments]', 'Metrics'])
  })

  it('drops items pointing at unknown sections or missing routes', () => {
    const r = sample()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    r.register({ type: 'nav-item', id: 'nav.orphan', label: 'Orphan', order: 5, section: 'nope', route: 'route.pods' })
    r.register({ type: 'nav-item', id: 'nav.dangling', label: 'Dangling', order: 6, route: 'route.missing' })
    expect(labels(r, 'dev-1')).toEqual(['Home', 'Workloads[Pods,Deployments]'])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('leaves out cluster pages when there is no current cluster', () => {
    const r = sample()
    r.register({ type: 'route', id: 'route.settings', path: 'settings', scope: 'global', component: page })
    r.register({ type: 'nav-item', id: 'nav.settings', label: 'Settings', order: 90, route: 'route.settings' })
    const tree = navTree(r, { cluster: null })
    expect(tree.map((e) => (e.kind === 'item' ? e.item.label : e.section.label))).toEqual(['Settings'])
  })

  it('firstNavRoute is the landing page for a cluster', () => {
    expect(firstNavRoute(sample(), { cluster: 'dev-1' })).toBe('route.home')
    expect(firstNavRoute(createRegistry(), { cluster: 'dev-1' })).toBeUndefined()
  })
})

describe('detailTabs', () => {
  it('matches kinds, respects when() and sorts by order', () => {
    const r = createRegistry()
    r.register({ type: 'resource-detail-tab', id: 'yaml', label: 'YAML', order: 20, kinds: '*', component: page })
    r.register({ type: 'resource-detail-tab', id: 'overview', label: 'Overview', order: 10, kinds: '*', component: page })
    r.register({ type: 'resource-detail-tab', id: 'logs', label: 'Logs', order: 40, kinds: ['Pod'], component: page })
    r.register({
      type: 'resource-detail-tab', id: 'metrics', label: 'Metrics', order: 50, kinds: ['Pod'], component: page,
      when: (ctx) => ctx.cluster === 'dev-2',
    })
    const ids = (kind: string, cluster: string) => detailTabs(r, kind, { cluster }).map((t) => t.id)
    expect(ids('Pod', 'dev-1')).toEqual(['overview', 'yaml', 'logs'])
    expect(ids('Pod', 'dev-2')).toEqual(['overview', 'yaml', 'logs', 'metrics'])
    expect(ids('Service', 'dev-2')).toEqual(['overview', 'yaml'])
  })
})
