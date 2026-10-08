import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import type { Project } from './api/projects'
import { createRegistry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createAppRouter } from './router'

// Projects UI through the real router, registry and pages, network faked.

class FakeSocket {
  onopen: ((e: Event) => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onclose: ((e: CloseEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  constructor(readonly url: string) {
    queueMicrotask(() => this.onopen?.(new Event('open')))
  }
  close() {}
}

const project = (name: string, cluster: string, extra: Partial<Project['spec']> = {}): Project => ({
  metadata: { name, uid: `uid-${name}`, resourceVersion: '5', creationTimestamp: new Date().toISOString(), generation: 1 },
  spec: { cluster, namespace: name, owner: `team-${name}`, size: 'M', ...extra },
  status: {
    phase: 'Ready',
    observedGeneration: 1,
    conditions: [{ type: 'Ready', status: 'True', reason: 'Reconciled', message: 'ok' }],
    resources: [{ apiVersion: 'v1', kind: 'Namespace', name }],
  },
})

const shop = project('shop', 'dev-1', { displayName: 'Shop' })
shop.status!.podSecurity = {
  enforce: 'baseline', warn: 'restricted', checkedAt: new Date().toISOString(),
  violations: ['existing pods in namespace "shop" violate the new PodSecurity enforce level "baseline:latest"', 'legacy-agent: privileged'],
}
const projects = [shop, project('billing', 'dev-2')]
const sizes = {
  S: { quota: { pods: '10', 'limits.cpu': '2', 'limits.memory': '4Gi' }, limits: {} },
  M: { quota: { pods: '30', 'limits.cpu': '8', 'limits.memory': '16Gi' }, limits: {} },
  L: { quota: { pods: '60', 'limits.cpu': '16', 'limits.memory': '32Gi' }, limits: {} },
}
const clusters = [
  { id: 'dev-1', displayName: 'Dev 1', environment: 'dev', status: { phase: 'Connected', nodeCount: 1, lastChecked: '' } },
  { id: 'dev-2', displayName: 'Dev 2', environment: 'dev', status: { phase: 'Connected', nodeCount: 1, lastChecked: '' } },
]

function respond(url: string, init?: RequestInit): unknown {
  const path = new URL(url, 'http://x').pathname
  if (path === '/api/clusters') return clusters
  if (path === '/api/projects' && init?.method === 'POST') return project('new-one', 'dev-1')
  if (path === '/api/projects') return { metadata: { resourceVersion: '5' }, items: projects }
  if (path === '/api/projects/_config') return { sizes, protected: ['kube-system', 'openshift-*'], clusters: ['dev-1', 'dev-2'] }
  if (path.endsWith('/resourcequotas/capybara-project-quota')) {
    return { status: { used: { pods: '20', 'limits.cpu': '1', 'limits.memory': '6Gi' } } }
  }
  return { metadata: { resourceVersion: '1' }, items: [] }
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

const body = () => document.body.textContent ?? ''

describe('Projects UI', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('WebSocket', FakeSocket)
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => new Response(JSON.stringify(respond(url, init)), { status: 200 })))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('puts Projects after Home and Namespaces under Administration', async () => {
    const { wrapper } = await boot('/c/dev-1/projects')
    const items = wrapper.findAll('.n-menu-item-content').map((n) => n.text().trim())
    expect(items.slice(0, 2)).toEqual(['Home', 'Projects'])
    const text = wrapper.find('.n-layout-sider').text()
    expect(text.indexOf('Administration')).toBeGreaterThan(text.indexOf('Config'))
    expect(text.indexOf('Namespaces')).toBeGreaterThan(text.indexOf('Administration'))
  })

  it("lists the current cluster's Projects, all clusters on request", async () => {
    const { wrapper } = await boot('/c/dev-1/projects')
    await vi.waitFor(() => expect(wrapper.find('[data-test="projects-table"]').text()).toContain('shop'))
    expect(wrapper.find('[data-test="projects-table"]').text()).not.toContain('billing')
  })

  it('create form blocks protected namespaces and posts the request', async () => {
    const { wrapper } = await boot('/c/dev-1/projects')
    await wrapper.find('[data-test="create-project"]').trigger('click')
    const input = (id: string) => document.querySelector(`[data-test="${id}"] input`) as HTMLInputElement
    const submit = () => document.querySelector('[data-test="create-submit"]') as HTMLButtonElement
    await vi.waitFor(() => expect(submit()).not.toBeNull())

    const type = async (id: string, v: string) => {
      input(id).value = v
      input(id).dispatchEvent(new Event('input'))
      await flushPromises()
    }
    await type('project-name', 'ops')
    await type('project-owner', 'team-ops')
    await type('project-namespace', 'openshift-ops')
    await vi.waitFor(() => expect(body()).toContain('is protected'))
    expect(submit().disabled).toBe(true)

    await type('project-namespace', '')
    await vi.waitFor(() => expect(submit().disabled).toBe(false))
    submit().click()
    await vi.waitFor(() => {
      const post = vi.mocked(fetch).mock.calls.find((c) => (c[1] as RequestInit | undefined)?.method === 'POST')
      expect(post).toBeDefined()
      expect(JSON.parse(String((post![1] as RequestInit).body))).toMatchObject({ name: 'ops', owner: 'team-ops', cluster: 'dev-1', size: 'S' })
    })
  })

  it('shows status, the baseline note, and usage against new limits when reducing the size', async () => {
    const { wrapper } = await boot('/c/dev-1/projects/shop')
    await vi.waitFor(() => expect(wrapper.find('[data-test="project-conditions"]').text()).toContain('Reconciled'))
    expect(wrapper.find('[data-test="baseline-note"]').text()).toContain('restored by the controller')

    await wrapper.find('[data-test="project-edit"]').trigger('click')
    await vi.waitFor(() => expect(document.querySelector('[data-test="edit-size"]')).not.toBeNull())
    const small = [...document.querySelectorAll('[data-test="edit-size"] .n-radio-button')].find((b) => b.textContent?.trim() === 'S') as HTMLElement
    small.querySelector('input')!.click()
    await vi.waitFor(() => expect(document.querySelector('[data-test="usage-table"]')).not.toBeNull())
    const table = document.querySelector('[data-test="usage-table"]')!.textContent!
    expect(table).toContain('pods')
    expect(body()).toContain('Current usage is above the new limits') // 20 pods > 10, 6Gi > 4Gi
    expect(document.querySelectorAll('[data-test="usage-table"] tr.over')).toHaveLength(2)
  })

  it('shows the Pod Security level and the pods that violated it when it was set', async () => {
    const { wrapper } = await boot('/c/dev-1/projects/shop')
    await vi.waitFor(() => expect(wrapper.find('[data-test="pod-security"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="pod-security"]').text()).toBe('baseline')
    const v = wrapper.find('[data-test="pod-security-violations"]').text()
    expect(v).toContain('legacy-agent: privileged')
    expect(v).toContain('fail on their next restart or rollout')
  })

  it('the top-bar selector can switch to Projects and filter by a Project namespace', async () => {
    localStorage.setItem('capybara.namespaceSelector.mode', 'projects') // remembered choice
    const { wrapper, router } = await boot('/c/dev-1/workloads/pods')
    await wrapper.find('[data-test="namespace-selector"] .n-base-selection').trigger('click')
    await vi.waitFor(() => expect(body()).toContain('Shop (shop)'))
    expect(body()).not.toContain('billing')
    const option = [...document.querySelectorAll('.n-base-select-option')].find((o) => o.textContent?.includes('Shop (shop)')) as HTMLElement
    option.click()
    await vi.waitFor(() => expect(router.currentRoute.value.query.ns).toBe('shop'))
  })
})
