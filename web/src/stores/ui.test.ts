import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NARROW_WIDTH, useUiStore } from './ui'

describe('ui store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  afterEach(() => vi.unstubAllGlobals())

  it('starts with the sidebar open on wide windows and collapsed on narrow ones', () => {
    vi.stubGlobal('innerWidth', NARROW_WIDTH + 200)
    expect(useUiStore().sidebarCollapsed).toBe(false)
    setActivePinia(createPinia())
    vi.stubGlobal('innerWidth', NARROW_WIDTH - 200)
    expect(useUiStore().sidebarCollapsed).toBe(true)
  })

  it('remembers the choice, which wins over the window width', () => {
    vi.stubGlobal('innerWidth', NARROW_WIDTH + 200)
    useUiStore().toggleSidebar()
    expect(localStorage.getItem('capybara.sidebar')).toBe('collapsed')
    setActivePinia(createPinia())
    expect(useUiStore().sidebarCollapsed).toBe(true)
  })
})
