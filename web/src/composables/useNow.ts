import { onScopeDispose, ref, type Ref } from 'vue'

const clocks = new Map<number, { now: Ref<number>; users: number; timer: ReturnType<typeof setInterval> }>()

/** A shared clock that ticks every `intervalMs` (for "age" columns). */
export function useNow(intervalMs = 5000): Ref<number> {
  let clock = clocks.get(intervalMs)
  if (!clock) {
    const now = ref(Date.now())
    clock = { now, users: 0, timer: setInterval(() => (now.value = Date.now()), intervalMs) }
    clocks.set(intervalMs, clock)
  }
  clock.users++
  const c = clock
  onScopeDispose(() => {
    if (--c.users === 0) {
      clearInterval(c.timer)
      clocks.delete(intervalMs)
    }
  })
  return c.now
}
