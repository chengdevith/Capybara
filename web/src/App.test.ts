import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createRegistry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createAppRouter } from './router'
import { usePluginsStore } from './stores/plugins'

const defaultClusters = [
  { id: 'dev-1', displayName: 'Dev 1', environment: 'dev', status: { phase: 'Connected', version: 'v1.35.5+k3s1', nodeCount: 1 } },
  { id: 'dev-2', displayName: 'Dev 2', environment: 'dev', status: { phase: 'Error', reason: 'Unreachable', message: 'down' } },
  { id: 'prod-1', displayName: 'Prod 1', environment: 'prod', status: { phase: 'Connected' } },
]

async function boot(path: string, clusters: unknown[] = defaultClusters) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const overview = /^\/api\/clusters\/([^/]+)\/overview/.exec(url)
      if (overview) {
        const c = clusters.find((x) => (x as { id: string }).id === overview[1])
        return new Response(JSON.stringify({ ...(c as object), nodes: 1, namespaces: 4, pods: { Running: 3 }, deployments: 2, services: 1, projects: 5 }))
      }
      if (url === '/api/plugins') return new Response(JSON.stringify([]))
      if (url.startsWith('/healthz')) return new Response(JSON.stringify({ status: 'ok', audit: 'ok', projectConfig: 'ok' }))
      return new Response(JSON.stringify(clusters), { status: 200 })
    }),
  )
  const registry = createRegistry()
  registerCoreExtensions(registry)
  const pinia = createPinia()
  const router = createAppRouter(registry, createMemoryHistory())
  await router.push(path)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [pinia, router], provide: { [registryKey as symbol]: registry } },
  })
  // Lazy route components and the cluster fetch settle over a few ticks.
  for (let i = 0; i < 5; i++) await flushPromises()
  return { wrapper, router, pinia }
}

describe('App (smoke)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('redirects / to the first registered cluster', async () => {
    const { router } = await boot('/')
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/c/dev-1/home'))
  })

  it('sends / to the Clusters page when no cluster is registered', async () => {
    const { router, wrapper } = await boot('/', [])
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/clusters'))
    await vi.waitFor(() => expect(wrapper.find('[data-test="add-first-cluster"]').exists()).toBe(true))
  })

  it('renders the OCP-style layout and the cluster overview', async () => {
    const { wrapper } = await boot('/c/dev-2/home')
    await vi.waitFor(() => expect(wrapper.text()).toContain('3 Running'))
    const text = wrapper.text()
    expect(text).toContain('Capybara') // top bar
    expect(text).toContain('Home') // sidebar, from the registry
    expect(text).toContain('Clusters') // global page in the sidebar
    expect(text).toContain('Dev 2') // home page for the cluster in the URL
    expect(text).toContain('down') // its status message (Health card)
    expect(wrapper.find('[data-test="project-count"]').text()).toBe('5')
    expect(wrapper.find('[data-test="theme-switcher"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="prod-masthead"]').exists()).toBe(false)
  })

  it('says when an enabled plugin\'s UI failed to load, on that cluster only', async () => {
    const { wrapper, pinia, router } = await boot('/c/dev-1/home')
    const plugins = usePluginsStore(pinia)
    plugins.catalog = [{
      name: 'monitoring', spec: {} as never, status: { available: true }, trusted: true,
      installations: [{ id: 'monitoring.dev-1', uid: 'u', config: {}, spec: { plugin: 'monitoring', cluster: 'dev-1', mode: 'install', enabled: true, version: '0.1.0' }, status: { phase: 'Ready' } }],
    }]
    plugins.setLoadError('monitoring', 'bundle sha256 does not match')
    await flushPromises()
    expect(wrapper.find('[data-test="plugin-load-error"]').text()).toContain('bundle sha256 does not match')
    await router.push('/c/dev-2/home')
    await flushPromises()
    expect(wrapper.find('[data-test="plugin-load-error"]').exists()).toBe(false)
  })

  it('hides and shows the sidebar with the top bar button', async () => {
    localStorage.removeItem('capybara.sidebar')
    const { wrapper } = await boot('/c/dev-1/home')
    const sider = () => wrapper.find('[data-test="sidebar"]')
    const toggle = wrapper.find('[data-test="sidebar-toggle"]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(sider().classes()).toContain('n-layout-sider--collapsed')
    expect(localStorage.getItem('capybara.sidebar')).toBe('collapsed')
    await toggle.trigger('click')
    await flushPromises()
    expect(sider().classes()).not.toContain('n-layout-sider--collapsed')
    localStorage.removeItem('capybara.sidebar')
  })

  it('marks a prod cluster in the top bar', async () => {
    const { wrapper } = await boot('/c/prod-1/home')
    await vi.waitFor(() => expect(wrapper.find('[data-test="prod-masthead"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="current-environment"]').text()).toBe('prod')
  })

  it('lists clusters with their health on the global Clusters page', async () => {
    const { wrapper } = await boot('/clusters')
    await vi.waitFor(() => expect(wrapper.find('[data-test="status-dev-2"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="status-dev-2"]').text()).toBe('Unreachable')
    expect(wrapper.find('[data-test="status-dev-1"]').text()).toBe('Connected')
  })

  it('shows "cluster not found" for an unknown cluster id', async () => {
    const { wrapper } = await boot('/c/prod/home')
    expect(wrapper.text()).toContain('Cluster not found')
  })
})
