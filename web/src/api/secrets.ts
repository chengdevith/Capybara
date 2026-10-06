import { apiGet } from './client'

/** Type and key names of one Secret; never values (see pkg/resource). */
export interface SecretSummary {
  namespace: string
  name: string
  uid: string
  resourceVersion: string
  type: string
  keys: string[]
}

export async function secretSummaries(cluster: string, namespace: string | null): Promise<Map<string, SecretSummary>> {
  const q = namespace ? `?namespace=${encodeURIComponent(namespace)}` : ''
  const res = await apiGet<{ items: SecretSummary[] }>(`/api/clusters/${encodeURIComponent(cluster)}/secrets/summary${q}`, {
    cache: 'no-store',
  })
  return new Map(res.items.map((s) => [s.uid, s]))
}
