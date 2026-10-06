import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'
import ThemeSwitcher from './ThemeSwitcher.vue'

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('shows the light-mode icon when Light is selected', async () => {
    const wrapper = mount(ThemeSwitcher)
    useThemeStore().setPreference('light')
    await nextTick()
    const button = wrapper.find('[data-test="theme-switcher"]')
    expect(button.text()).toContain('Light')
    expect(button.find('svg path').attributes('d')).toMatch(/^M565-395/)
    expect(button.find('svg').attributes('fill')).toBe('currentColor')
  })

  it('shows the current choice for the other modes', async () => {
    const wrapper = mount(ThemeSwitcher)
    useThemeStore().setPreference('dark')
    await nextTick()
    expect(wrapper.find('[data-test="theme-switcher"]').text()).toContain('Dark')
    expect(wrapper.find('[data-test="theme-switcher"] svg').exists()).toBe(false)
  })
})
