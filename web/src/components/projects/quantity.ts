// Kubernetes resource quantities ("500m", "2Gi", "1.5", "10") as numbers,
// for comparing usage with limits in the UI. Not for exact arithmetic.
const SUFFIX: Record<string, number> = {
  n: 1e-9, u: 1e-6, m: 1e-3, '': 1,
  k: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18,
  Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, Ti: 2 ** 40, Pi: 2 ** 50, Ei: 2 ** 60,
}

export function parseQuantity(q: string | undefined): number | null {
  if (q === undefined) return null
  const m = /^([+-]?\d+(?:\.\d+)?)(?:[eE]([+-]?\d+))?([a-zA-Z]*)$/.exec(q.trim())
  if (!m) return null
  const [, num, exp, suffix] = m
  const factor = SUFFIX[suffix ?? '']
  if (factor === undefined) return null
  return Number(num) * (exp ? 10 ** Number(exp) : 1) * factor
}

/** True when `used` is more than `limit` (unknown values never exceed). */
export function exceeds(used: string | undefined, limit: string | undefined): boolean {
  const u = parseQuantity(used)
  const l = parseQuantity(limit)
  return u !== null && l !== null && u > l
}
