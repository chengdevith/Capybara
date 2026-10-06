import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useThemeStore } from './theme'

function fakeMatchMedia(dark: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null
  const mql = {
    matches: dark,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => (listener = fn),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
  return { flip: (d: boolean) => listener?.({ matches: d }) }
}

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  afterEach(() => vi.unstubAllGlobals())

  it('defaults to system and follows the OS, live', async () => {
    const os = fakeMatchMedia(true)
    const theme = useThemeStore()
    expect(theme.preference).toBe('system')
    expect(theme.isDark).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')

    os.flip(false)
    await nextTick()
    expect(theme.isDark).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('an explicit choice wins over the OS and is remembered', async () => {
    fakeMatchMedia(true)
    useThemeStore().setPreference('light')
    expect(useThemeStore().isDark).toBe(false)
    expect(localStorage.getItem('capybara.theme')).toBe('light')

    setActivePinia(createPinia()) // like a page reload
    expect(useThemeStore().preference).toBe('light')
  })

  it('ignores junk in storage and survives blocked storage', () => {
    fakeMatchMedia(false)
    localStorage.setItem('capybara.theme', 'purple')
    expect(useThemeStore().preference).toBe('system')

    setActivePinia(createPinia())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const theme = useThemeStore()
    expect(() => theme.setPreference('dark')).not.toThrow()
    expect(theme.isDark).toBe(true)
  })
})
