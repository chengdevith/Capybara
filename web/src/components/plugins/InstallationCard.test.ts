import { flushPromises, mount } from '@vue/test-utils'
import { NMessageProvider } from 'naive-ui'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { CatalogEntry, Installation } from '@/api/plugins'
import InstallationCard from './InstallationCard.vue'
import { currentStep, installationView } from './installationView'

const refusal =
  'pre-flight refused: the installer credential (system:serviceaccount:capybara-system:capybara-installer) lacks 34 permission(s) this plugin declares for install mode; regenerate it with: hack/capybara-sa.sh dev-1 --installer tekton'

const steps = [
  { name: 'chart', title: 'Chart installing', state: 'Pending' as const },
  { name: 'api', title: 'Pipelines API served', state: 'Pending' as const },
]

function installation(status: Partial<Installation['status']>, over: Partial<Installation> = {}): Installation {
  return {
    id: 'tekton.dev-1',
    uid: 'u1',
    spec: { plugin: 'tekton', cluster: 'dev-1', mode: 'install', enabled: true, version: '0.1.0' },
    status: { steps, ...status },
    config: {},
    ...over,
  }
}

const refused = () =>
  installation({
    phase: 'Error',
    message: refusal,
    conditions: [{ type: 'PreflightPassed', status: 'False', reason: 'Refused', message: refusal }],
  })

describe('installationView', () => {
  it('shows a refused request as not installed, with its own failed pre-flight step and the fix command', () => {
    const v = installationView(refused())
    expect(v).toMatchObject({ deployed: false, refused: true, label: 'Refused', tone: 'error', subtitle: 'install requested · v0.1.0' })
    expect(v.steps.map((s) => `${s.title}:${s.state}`)).toEqual(['Pre-flight check:Failed', 'Chart installing:Pending', 'Pipelines API served:Pending'])
    expect(v.fixCommand).toBe('hack/capybara-sa.sh dev-1 --installer tekton')
  })

  it('a refusal without a command (e.g. OpenShift) has no fix command', () => {
    const i = refused()
    i.status.message = 'pre-flight refused: this is OpenShift, which ships its own Pipelines: use Connect existing instead'
    expect(installationView(i).fixCommand).toBeUndefined()
  })

  it('an installed one stays "installed", even when a later check fails', () => {
    const v = installationView(installation({ phase: 'Error', installedVersion: '0.1.0', message: 'step failed' }))
    expect(v).toMatchObject({ deployed: true, refused: false, label: 'Error', subtitle: 'installed · v0.1.0' })
    expect(v.steps).toEqual(steps)
  })

  it('a request in progress is "requested", and connect mode says connected once applied', () => {
    expect(installationView(installation({ phase: 'Installing' })).subtitle).toBe('install requested · v0.1.0')
    const c = installation({ phase: 'Ready', installedVersion: '0.1.0' })
    c.spec.mode = 'connect'
    expect(installationView(c).subtitle).toBe('connected · v0.1.0')
  })
})

describe('currentStep', () => {
  it('an informational step that is off does not hold the steps back', () => {
    const st = (state: 'Done' | 'Off' | 'Running') => ({ name: state, title: state, state })
    expect(currentStep([st('Done'), st('Off'), st('Done')])).toBe(4)
    expect(currentStep([st('Done'), st('Off'), st('Running')])).toBe(3)
  })
})

describe('InstallationCard', () => {
  afterEach(() => vi.unstubAllGlobals())

  function mountCard(inst: Installation) {
    setActivePinia(createPinia())
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/clusters/:id', name: 'core.clusters.detail', component: { render: () => null } }],
    })
    const plugin = { name: 'tekton', spec: { displayName: 'Pipelines', version: '0.1.0' }, status: { available: true }, trusted: true, installations: [inst] } as unknown as CatalogEntry
    const Host = defineComponent(() => () => h(NMessageProvider, null, () => h(InstallationCard, { plugin, installation: inst })))
    return mount(Host, { global: { plugins: [router] }, attachTo: document.body })
  }

  it('a refused request: no UI switch, Cancel request instead of Uninstall, and a fix-it box', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`)
      return new Response(JSON.stringify(init?.method === 'DELETE' ? { ok: true } : []), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const w = mountCard(refused())
    await flushPromises()
    const t = (id: string) => w.find(`[data-test="${id}"]`)
    expect(t('installation-phase').text()).toBe('Refused')
    expect(t('installation-subtitle').text()).toBe('install requested · v0.1.0')
    expect(t('installation-enabled').exists()).toBe(false)
    expect(t('uninstall').exists()).toBe(false)
    expect(t('fix-command').text()).toBe('hack/capybara-sa.sh dev-1 --installer tekton')
    expect(t('fix-cluster-link').attributes('href')).toBe('/clusters/dev-1')
    expect(t('installation-fix').text()).toContain('Nothing has been changed in the cluster')

    await t('cancel-request').trigger('click')
    await flushPromises()
    const confirm = document.querySelector<HTMLButtonElement>('[data-test="confirm-cancel"]')
    expect(confirm).not.toBeNull()
    confirm!.click()
    await flushPromises()
    expect(calls).toContain('DELETE /api/plugins/installations/tekton.dev-1?confirm=tekton.dev-1&uid=u1&keepData=false')
    w.unmount()
  })

  it('an installed one keeps the UI switch and Uninstall', async () => {
    const w = mountCard(installation({ phase: 'Ready', installedVersion: '0.1.0', steps: steps.map((s) => ({ ...s, state: 'Done' as const })) }))
    await flushPromises()
    expect(w.find('[data-test="installation-enabled"]').exists()).toBe(true)
    expect(w.find('[data-test="uninstall"]').exists()).toBe(true)
    expect(w.find('[data-test="cancel-request"]').exists()).toBe(false)
    expect(w.find('[data-test="installation-subtitle"]').text()).toBe('installed · v0.1.0')
    w.unmount()
  })
})
