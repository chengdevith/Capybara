import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getHealth } from '@/api/audit'

/** Server health, polled. Tells the UI whether write actions are possible. */
export const useHealthStore = defineStore('health', () => {
  const audit = ref('ok')
  /** "ok", "using built-in size defaults", or what is wrong with the sizes ConfigMap. */
  const projectConfig = ref('ok')
  let timer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const h = await getHealth()
      audit.value = h.audit ?? 'ok'
      projectConfig.value = h.projectConfig ?? 'ok'
    } catch {
      // server unreachable: other parts of the UI already show that
    }
  }
  function start(intervalMs = 15000) {
    if (timer) return
    void refresh()
    timer = setInterval(() => void refresh(), intervalMs)
  }
  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  const auditFailing = computed(() => audit.value !== 'ok')
  const projectConfigNotice = computed(() => (projectConfig.value === 'ok' ? null : projectConfig.value))
  return { audit, auditFailing, projectConfig, projectConfigNotice, refresh, start, stop }
})
