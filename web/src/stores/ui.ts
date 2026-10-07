import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'capybara.sidebar'
/** Below this width the sidebar starts collapsed (unless the user chose otherwise). */
export const NARROW_WIDTH = 1024

function readStored(): boolean | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'collapsed' ? true : v === 'open' ? false : null
  } catch {
    return null // storage blocked
  }
}

function narrow(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < NARROW_WIDTH
}

/** Layout preferences: whether the sidebar is collapsed. Remembered per browser. */
export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref<boolean>(readStored() ?? narrow())

  function setSidebarCollapsed(v: boolean) {
    sidebarCollapsed.value = v
    try {
      localStorage.setItem(STORAGE_KEY, v ? 'collapsed' : 'open')
    } catch {
      // not persisted
    }
  }
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed.value)

  return { sidebarCollapsed, setSidebarCollapsed, toggleSidebar }
})
