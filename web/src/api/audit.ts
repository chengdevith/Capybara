import { apiGet } from './client'

export type AuditResult = 'success' | 'failure' | 'conflict' | 'denied' | 'unknown'

export interface AuditRecord {
  id: string
  time: string
  completedAt?: string
  user: string
  cluster: string
  namespace?: string
  kind: string
  name: string
  action: string
  result: AuditResult
  detail?: string
}

export interface AuditFilter {
  cluster?: string
  namespace?: string
  user?: string
  action?: string
  result?: string
  before?: string
  limit?: number
}

export async function listAudit(filter: AuditFilter = {}): Promise<AuditRecord[]> {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  const qs = q.toString()
  const res = await apiGet<{ items: AuditRecord[] }>(`/api/audit${qs ? `?${qs}` : ''}`)
  return res.items
}

export interface Health {
  status: string
  /** "ok" or "failing: <reason>" */
  audit: string
}

export function getHealth(): Promise<Health> {
  return apiGet<Health>('/healthz')
}
