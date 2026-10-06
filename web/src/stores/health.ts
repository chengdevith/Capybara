import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getHealth } from '@/api/audit'

/** Server health, polled. Tells the UI whether write actions are possible. */
export const useHealthStore = defineStore('health', () => {
  const audit = ref('ok')
  let timer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      audit.value = (await getHealth()).audit ?? 'ok'
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
  return { audit, auditFailing, refresh, start, stop }
})
