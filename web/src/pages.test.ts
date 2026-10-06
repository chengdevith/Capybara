import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import type { KubeObject } from './api/k8s'
import { createRegistry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createAppRouter } from './router'

// End-to-end through the real router, registry, pages and composables,
// with the network faked: fetch for lists, a fake WebSocket for watches.

class FakeSocket {
  static all: FakeSocket[] = []
  onopen: ((e: Event) => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onclose: ((e: CloseEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  closed = false
  constructor(readonly url: string) {
    FakeSocket.all.push(this)
    queueMicrotask(() => this.onopen?.(new Event('open')))
  }
  send(msg: unknown) {
    this.onmessage?.({ data: JSON.stringify(msg) } as MessageEvent)
  }
  close() {
    this.closed = true
  }
  static find(resource: string) {
    return FakeSocket.all.find((s) => !s.closed && new URL(s.url).searchParams.get('resource') === resource)
  }
}

const meta = (name: string, namespace?: string) => ({
  name,
  namespace,
  uid: `uid-${name}`,
  resourceVersion: '10',
  creationTimestamp: new Date().toISOString(),
})
const pod = (name: string): KubeObject => ({
  metadata: meta(name, 'capybara-demo'),
  spec: { nodeName: 'node-1', containers: [{ name: 'app' }] },
  status: { phase: 'Running', podIP: '10.42.0.9', containerStatuses: [{ name: 'app', image: 'busybox:1.36', ready: true, restartCount: 0 }] },
})

const clusters = [{ id: 'dev-1', displayName: 'Dev 1', environment: 'dev', status: { phase: 'Connected', nodeCount: 1, lastChecked: '' } }]

function respond(url: string): unknown {
  const path = new URL(url, 'http://x').pathname
  if (path === '/api/clusters') return clusters
  if (path.endsWith('/pods')) return { metadata: { resourceVersion: '10' }, items: [pod('demo-a'), pod('demo-b')] }
  if (path.endsWith('/pods/demo-a')) return pod('demo-a')
  if (path.endsWith('/namespaces')) return { metadata: { resourceVersion: '10' }, items: [{ metadata: meta('capybara-demo'), status: { phase: 'Active' } }] }
  if (path.endsWith('/secrets/summary')) {
    return { items: [{ namespace: 'capybara-demo', name: 'demo-credentials', uid: 'uid-demo-credentials', resourceVersion: '10', type: 'Opaque', keys: ['password', 'username'] }] }
  }
  if (path.endsWith('/secrets')) return { metadata: { resourceVersion: '10' }, items: [{ metadata: meta('demo-credentials', 'capybara-demo') }] }
  if (path === '/api/clusters/dev-1/secrets/capybara-demo/demo-credentials') {
    return { apiVersion: 'v1', kind: 'Secret', metadata: meta('demo-credentials', 'capybara-demo'), data: { password: 'c2VjcmV0LXZhbHVl' } }
  }
  if (path.endsWith('/deployments')) {
    return { metadata: { resourceVersion: '10' }, items: [{ metadata: meta('demo-logger', 'capybara-demo'), spec: { replicas: 2 }, status: {} }] }
  }
  if (path.endsWith('/services')) return { metadata: { resourceVersion: '10' }, items: [{ metadata: meta('demo-logger', 'capybara-demo'), spec: { type: 'ClusterIP' } }] }
  return { metadata: { resourceVersion: '10' }, items: [] }
}

async function boot(path: string) {
  const registry = createRegistry()
  registerCoreExtensions(registry)
  const router = createAppRouter(registry, createMemoryHistory())
  await router.push(path)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router], provide: { [registryKey as symbol]: registry } },
  })
  await vi.waitFor(async () => {
    await flushPromises()
    expect(wrapper.find('[data-test="live-indicator"]').exists()).toBe(true)
  })
  return { wrapper, router }
}

describe('resource pages (integration)', () => {
  beforeEach(() => {
    FakeSocket.all = []
    vi.stubGlobal('WebSocket', FakeSocket)
    vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(respond(url)), { status: 200 })))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('builds the sidebar from the registry in the agreed order', async () => {
    const { wrapper } = await boot('/c/dev-1/workloads/pods')
    const labels = wrapper.findAll('.n-menu-item-content, .n-submenu > .n-menu-item-content').map((n) => n.text().trim())
    expect(labels.slice(0, 2)).toEqual(['Home', 'Projects'])
    const text = wrapper.text()
    expect(text.indexOf('Workloads')).toBeLessThan(text.indexOf('Networking'))
  })

  it('keeps the Pods page live: deletions and additions show up without a reload', async () => {
    const { wrapper } = await boot('/c/dev-1/workloads/pods')
    await vi.waitFor(() => expect(wrapper.text()).toContain('demo-b'))
    expect(wrapper.text()).toContain('demo-a')
    expect(wrapper.text()).toContain('Running')

    const ws = FakeSocket.find('pods')!
    expect(new URL(ws.url).searchParams.get('resourceVersion')).toBe('10')
    ws.send({ type: 'DELETED', object: pod('demo-b') })
    ws.send({ type: 'ADDED', object: pod('demo-c') })

    await vi.waitFor(() => {
      expect(wrapper.text()).not.toContain('demo-b')
      expect(wrapper.text()).toContain('demo-c')
    })
  })

  it('scopes lists to the namespace in ?ns=', async () => {
    await boot('/c/dev-1/workloads/pods?ns=capybara-demo')
    const urls = vi.mocked(fetch).mock.calls.map((c) => String(c[0]))
    expect(urls).toContain('/api/clusters/dev-1/k8s/api/v1/namespaces/capybara-demo/pods?limit=500')
    expect(new URL(FakeSocket.find('pods')!.url).searchParams.get('namespace')).toBe('capybara-demo')
  })

  it('shows registry tabs on the detail page, Logs and Terminal only for Pods', async () => {
    const podPage = await boot('/c/dev-1/workloads/pods/capybara-demo/demo-a')
    await vi.waitFor(() => expect(podPage.wrapper.text()).toContain('Overview'))
    const podTabs = podPage.wrapper.findAll('.n-tabs-tab').map((t) => t.text().trim())
    expect(podTabs).toEqual(['Overview', 'YAML', 'Events', 'Logs', 'Terminal'])
    podPage.wrapper.unmount()

    const svcPage = await boot('/c/dev-1/networking/services/capybara-demo/demo-logger')
    await vi.waitFor(() => expect(svcPage.wrapper.text()).toContain('Overview'))
    expect(svcPage.wrapper.findAll('.n-tabs-tab').map((t) => t.text().trim())).toEqual(['Overview', 'YAML', 'Events'])
  })

  it('tells the user when the object they are looking at is deleted', async () => {
    const { wrapper } = await boot('/c/dev-1/workloads/pods/capybara-demo/demo-a')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Overview'))
    const ws = FakeSocket.all.find((s) => new URL(s.url).searchParams.get('fieldSelector') === 'metadata.name=demo-a')!
    ws.send({ type: 'DELETED', object: pod('demo-a') })
    await vi.waitFor(() => expect(wrapper.text()).toContain('This Pod was deleted'))
  })

  it('never asks for Secret values until Reveal is clicked', async () => {
    const { wrapper } = await boot('/c/dev-1/config/secrets/capybara-demo/demo-credentials?tab=core.tab.yaml')
    await vi.waitFor(() => expect(wrapper.find('[data-test="secret-hidden"]').exists()).toBe(true))
    const revealCalls = () => vi.mocked(fetch).mock.calls.filter((c) => String(c[0]).includes('/secrets/capybara-demo/'))
    expect(revealCalls()).toHaveLength(0)

    await wrapper.find('[data-test="secret-reveal"]').trigger('click')
    await vi.waitFor(() => expect(revealCalls()).toHaveLength(1))
    await vi.waitFor(() => expect(wrapper.find('[data-test="secret-hide"]').exists()).toBe(true))
  })

  it('offers Scale and Restart only on Deployments and guards Delete by name', async () => {
    const pods = await boot('/c/dev-1/workloads/pods/capybara-demo/demo-a')
    await vi.waitFor(() => expect(pods.wrapper.find('[data-test="actions"]').exists()).toBe(true))
    await pods.wrapper.find('[data-test="actions"]').trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain('Edit YAML'))
    expect(document.body.textContent).not.toContain('Scale')
    pods.wrapper.unmount()
    document.body.innerHTML = ''

    const dep = await boot('/c/dev-1/workloads/deployments/capybara-demo/demo-logger')
    await vi.waitFor(() => expect(dep.wrapper.find('[data-test="actions"]').exists()).toBe(true))
    await dep.wrapper.find('[data-test="actions"]').trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain('Restart rollout'))
    expect(document.body.textContent).toContain('Scale')

    const del = [...document.querySelectorAll('.n-dropdown-option-body')].find((o) => o.textContent?.includes('Delete')) as HTMLElement
    del.click()
    const confirm = () => document.querySelector('[data-test="confirm"]') as HTMLButtonElement | null
    await vi.waitFor(() => expect(confirm()).not.toBeNull())
    expect(confirm()!.disabled).toBe(true) // until the name is typed
    const input = document.querySelector('[data-test="confirm-name"] input') as HTMLInputElement
    input.value = 'demo-logger'
    input.dispatchEvent(new Event('input'))
    await vi.waitFor(() => expect(confirm()!.disabled).toBe(false))
  })

  it('shows Secret types and key names from the server summary', async () => {
    const { wrapper } = await boot('/c/dev-1/config/secrets?ns=capybara-demo')
    await vi.waitFor(() => expect(wrapper.text()).toContain('password, username'))
    expect(wrapper.text()).toContain('Opaque')
  })
})
