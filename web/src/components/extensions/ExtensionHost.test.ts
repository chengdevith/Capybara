/* eslint-disable vue/one-component-per-file, vue/require-render-return -- deliberately broken test components */
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import ExtensionHost from './ExtensionHost.vue'

const host = (id: string, component: () => Promise<unknown>, attrs: Record<string, unknown> = {}) =>
  mount(ExtensionHost, {
    props: { id, source: 'monitoring', label: 'Metrics tab', component: component as never },
    attrs,
  })

describe('ExtensionHost', () => {
  // Vue logs handled errors in dev; keep the test output readable.
  vi.spyOn(console, 'warn').mockImplementation(() => {})

  it('renders the component with the attributes passed through', async () => {
    const ok = defineComponent({ props: { cluster: { type: String, default: '' } }, setup: (p) => () => h('p', { 'data-test': 'ok' }, p.cluster) })
    const w = host('t.ok', async () => ({ default: ok }), { cluster: 'dev-1' })
    await vi.waitFor(async () => {
      await flushPromises()
      expect(w.find('[data-test="ok"]').text()).toBe('dev-1')
    })
    expect(w.find('[data-test="extension-error"]').exists()).toBe(false)
  })

  it('shows an error when the component cannot be loaded', async () => {
    const w = host('t.load', () => Promise.reject(new Error('chunk missing')))
    await flushPromises()
    const err = w.find('[data-test="extension-error"]')
    expect(err.exists()).toBe(true)
    expect(err.text()).toContain('Metrics tab could not be shown')
    expect(err.text()).toContain('chunk missing')
    expect(err.text()).toContain('monitoring plugin')
  })

  it('shows an error when the component throws while setting up or rendering', async () => {
    const inSetup = defineComponent({ setup() { throw new Error('setup broke') } })
    const inRender = defineComponent({ render() { throw new Error('render broke') } })
    for (const [c, msg] of [[inSetup, 'setup broke'], [inRender, 'render broke']] as const) {
      const w = host(`t.${msg}`, async () => ({ default: c }))
      await vi.waitFor(async () => {
        await flushPromises()
        expect(w.find('[data-test="extension-error"]').text()).toContain(msg)
      })
    }
  })
})
