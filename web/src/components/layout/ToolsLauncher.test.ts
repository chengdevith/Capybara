import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ToolsLauncher from './ToolsLauncher.vue'

const tools = {
  'dev-1': [
    { plugin: 'argocd', name: 'argocd', title: 'Argo CD', icon: 'argocd', url: '/api/plugins/argocd/tools/argocd/dev-1/' },
    { plugin: 'monitoring', name: 'grafana', title: 'Grafana', icon: 'grafana', url: '/api/plugins/monitoring/grafana/dev-1/' },
  ],
  'dev-2': [],
}

async function mountAt(path: string) {
  setActivePinia(createPinia())
  const fetchMock = vi.fn(async (url: string) => {
    const id = /\/api\/clusters\/([^/]+)\/tools/.exec(url)?.[1] as keyof typeof tools
    return new Response(JSON.stringify(tools[id] ?? []), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/c/:cluster/:rest(.*)*', component: { render: () => null } },
      { path: '/:rest(.*)*', component: { render: () => null } },
    ],
  })
  await router.push(path)
  const w = mount(ToolsLauncher, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { w, router, fetchMock }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('ToolsLauncher', () => {
  it("lists the current cluster's tools, each opening in a new tab", async () => {
    const { w } = await mountAt('/c/dev-1/workloads/pods')
    await w.find('[data-test="tools-launcher"]').trigger('click')
    await flushPromises()
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-test^="tool-"]')]
    expect(links.map((a) => [a.textContent?.trim(), a.getAttribute('href'), a.target, a.rel])).toEqual([
      ['Argo CD', '/api/plugins/argocd/tools/argocd/dev-1/', '_blank', 'noopener noreferrer'],
      ['Grafana', '/api/plugins/monitoring/grafana/dev-1/', '_blank', 'noopener noreferrer'],
    ])
    w.unmount()
  })

  it('is hidden where no tools are installed, and follows the cluster', async () => {
    const { w, router, fetchMock } = await mountAt('/c/dev-2/workloads/pods')
    expect(w.find('[data-test="tools-launcher"]').exists()).toBe(false)
    await router.push('/c/dev-1/workloads/pods')
    await flushPromises()
    expect(w.find('[data-test="tools-launcher"]').exists()).toBe(true)
    expect(fetchMock).toHaveBeenLastCalledWith('/api/clusters/dev-1/tools', expect.anything())
    await router.push('/marketplace')
    await flushPromises()
    expect(w.find('[data-test="tools-launcher"]').exists()).toBe(false)
    w.unmount()
  })
})
