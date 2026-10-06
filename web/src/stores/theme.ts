import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'capybara.theme'
const PREFERENCES: ThemePreference[] = ['light', 'dark', 'system']

function readStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return PREFERENCES.includes(v as ThemePreference) ? (v as ThemePreference) : 'system'
  } catch {
    return 'system' // storage blocked (private mode, policies)
  }
}

function osQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
}

/**
 * Light/dark theme. The preference is per browser (localStorage);
 * 'system' follows the OS setting and reacts when it changes.
 */
export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readStored())

  const query = osQuery()
  const osDark = ref(query?.matches ?? false)
  query?.addEventListener('change', (e) => (osDark.value = e.matches))

  const isDark = computed(() => (preference.value === 'system' ? osDark.value : preference.value === 'dark'))

  function setPreference(p: ThemePreference) {
    preference.value = p
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      // not persisted; still applies for this session
    }
  }

  // CSS variables in App.vue key off this attribute.
  watch(
    isDark,
    (dark) => {
      if (typeof document !== 'undefined') document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    },
    { immediate: true },
  )

  return { preference, isDark, setPreference }
})
