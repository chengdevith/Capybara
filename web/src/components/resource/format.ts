/** Kubernetes-style short age: 45s, 12m, 3h, 5d, 2y. */
export function age(timestamp: string | undefined, now: number): string {
  if (!timestamp) return '—'
  const s = Math.max(0, Math.floor((now - Date.parse(timestamp)) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 365) return `${d}d`
  return `${Math.floor(d / 365)}y`
}

/** "app=web, tier=frontend" */
export function formatLabels(labels: Record<string, string> | undefined): string {
  return Object.entries(labels ?? {})
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
}
