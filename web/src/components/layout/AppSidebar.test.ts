import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createRegistry, registryKey } from '@/extensions'
import { createAppRouter } from '@/router'
import AppSidebar from './AppSidebar.vue'

const page = () => Promise.resolve({ default: { render: () => null } })

async function render(path: string) {
  const r = createRegistry()
  r.register({ type: 'nav-section', id: 'workloads', label: 'Workloads', order: 10 })
  r.register({ type: 'nav-section', id: 'storage', label: 'Storage', order: 30 })
  r.register({ type: 'route', id: 'home', path: 'home', scope: 'cluster', component: page })
  r.register({ type: 'route', id: 'pods', path: 'pods', scope: 'cluster', component: page })
  r.register({ type: 'route', id: 'metrics', path: 'metrics', scope: 'cluster', component: page })
  r.register({ type: 'nav-item', id: 'nav.home', label: 'Home', order: 0, route: 'home' })
  r.register({ type: 'nav-item', id: 'nav.pods', label: 'Pods', order: 1, section: 'workloads', route: 'pods' })
  r.register({
    type: 'nav-item', id: 'nav.metrics', label: 'Metrics', order: 50, route: 'metrics',
    when: (ctx) => ctx.cluster === 'dev-2',
  })

  const router = createAppRouter(r, createMemoryHistory())
  await router.push(path)
  return mount(AppSidebar, { global: { plugins: [createPinia(), router], provide: { [registryKey as symbol]: r } } })
}

describe('AppSidebar', () => {
  it('renders only what the registry contributes', async () => {
    const text = (await render('/c/dev-1/home')).text()
    expect(text).toContain('Home')
    expect(text).toContain('Workloads')
    expect(text).toContain('Pods')
    expect(text).not.toContain('Storage') // empty section hidden
    expect(text).not.toContain('Metrics') // not active on dev-1
  })

  it('links keep the current cluster in the URL', async () => {
    const wrapper = await render('/c/dev-2/home')
    expect(wrapper.text()).toContain('Metrics')
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['/c/dev-2/home', '/c/dev-2/pods', '/c/dev-2/metrics']))
  })

  it('expands sections that appear after the first render (e.g. "/" redirecting to a cluster)', async () => {
    const r = createRegistry()
    r.register({ type: 'nav-section', id: 'workloads', label: 'Workloads', order: 10 })
    r.register({ type: 'route', id: 'pods', path: 'pods', scope: 'cluster', component: page })
    r.register({ type: 'route', id: 'settings', path: 'settings', scope: 'global', component: page })
    r.register({ type: 'nav-item', id: 'nav.pods', label: 'Pods', order: 1, section: 'workloads', route: 'pods' })
    r.register({ type: 'nav-item', id: 'nav.settings', label: 'Settings', order: 9, route: 'settings' })
    const router = createAppRouter(r, createMemoryHistory())
    await router.push('/settings') // no cluster: no sections yet
    const wrapper = mount(AppSidebar, { global: { plugins: [createPinia(), router], provide: { [registryKey as symbol]: r } } })
    expect(wrapper.text()).not.toContain('Workloads')

    await router.push('/c/dev-1/pods')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Pods'))
  })
})
