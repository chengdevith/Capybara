import { mount, type DOMWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ThemeSwitcher from './ThemeSwitcher.vue'
import TopBar from './TopBar.vue'

// Masthead buttons must leave focus to the browser. In Safari (and in
// browsers Naive takes for Safari, e.g. headless Chrome) Naive's default
// cancels mouse down and focuses the button from script, which browsers
// treat as keyboard focus (:focus-visible): the button stayed highlighted
// after a click until the next click elsewhere. Naive reads the user agent
// once, at load, so present Safari before anything imports it.
vi.hoisted(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  })
})
async function mouseDownPrevented(button: DOMWrapper<Element>): Promise<boolean> {
  let prevented: boolean | null = null
  const record = (e: Event) => (prevented = e.defaultPrevented)
  document.addEventListener('mousedown', record)
  try {
    await button.trigger('mousedown')
  } finally {
    document.removeEventListener('mousedown', record)
  }
  if (prevented === null) throw new Error('mousedown did not reach the document')
  return prevented
}

describe('masthead buttons', () => {
  it('the sidebar toggle and the theme switcher do not take focus from script on click', async () => {
    setActivePinia(createPinia())
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => null } }] })
    const stubs = { ClusterSwitcher: true, NamespaceSelector: true }
    const bar = mount(TopBar, { global: { plugins: [router], stubs }, attachTo: document.body })
    const theme = mount(ThemeSwitcher, { attachTo: document.body })
    for (const [name, button] of [
      ['sidebar-toggle', bar.find('[data-test="sidebar-toggle"]')],
      ['theme-switcher', theme.find('[data-test="theme-switcher"]')],
    ] as const) {
      expect(await mouseDownPrevented(button), name).toBe(false)
      expect(document.activeElement === button.element, name).toBe(false)
      expect(button.classes(), name).toContain('masthead-button')
    }
    bar.unmount()
    theme.unmount()
  })
})
