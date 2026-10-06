import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createRegistry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createAppRouter } from './router'

const clusters = [
  { id: 'dev-1', displayName: 'Dev 1', environment: 'dev', status: { phase: 'Connected', version: 'v1.35.5+k3s1', nodeCount: 1, lastChecked: '' } },
  { id: 'dev-2', displayName: 'Dev 2', environment: 'dev', status: { phase: 'Error', nodeCount: 0, message: 'down', lastChecked: '' } },
]

async function boot(path: string) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(clusters), { status: 200 })))
  const registry = createRegistry()
  registerCoreExtensions(registry)
  const router = createAppRouter(registry, createMemoryHistory())
  await router.push(path)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router], provide: { [registryKey as symbol]: registry } },
  })
  // Lazy route components and the cluster fetch settle over a few ticks.
  for (let i = 0; i < 5; i++) await flushPromises()
  return { wrapper, router }
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

  it('renders the OCP-style layout and the cluster home page', async () => {
    const { wrapper } = await boot('/c/dev-2/home')
    const text = wrapper.text()
    expect(text).toContain('Capybara') // top bar
    expect(text).toContain('Home') // sidebar, from the registry
    expect(text).toContain('Dev 2') // home page for the cluster in the URL
    expect(text).toContain('down') // its status message
  })

  it('shows "cluster not found" for an unknown cluster id', async () => {
    const { wrapper } = await boot('/c/prod/home')
    expect(wrapper.text()).toContain('Cluster not found')
  })
})
