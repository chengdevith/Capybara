import { pluginFetch } from '@capybara/sdk'

export const RANGES = ['1h', '6h', '24h', '7d'] as const
export type RangeName = (typeof RANGES)[number]

export interface Series {
  label: string
  points: [number, number][]
}
export interface Metrics {
  range: string
  step: number
  cpu: Series[]
  memory: Series[]
  cpuCapacity?: number
  memoryCapacity?: number
}
export interface Overview {
  cpuUsed: number
  cpuCapacity: number
  memoryUsed: number
  memoryCapacity: number
  targetsUp: number
  targetsDown: number
}
export interface Alert {
  name: string
  state: string
  severity?: string
  summary?: string
  activeAt?: string
}

const enc = encodeURIComponent
const get = <T>(path: string) => pluginFetch<T>('monitoring', path)

export const metrics = (cluster: string, kind: string, namespace: string | undefined, name: string, range: RangeName) =>
  get<Metrics>(`/clusters/${enc(cluster)}/metrics/${kind}?${new URLSearchParams({ namespace: namespace ?? '', name, range })}`)
export const overview = (cluster: string) => get<Overview>(`/clusters/${enc(cluster)}/overview`)
export const status = (cluster: string) => get<{ version: string; targetsUp: number; targetsDown: number }>(`/clusters/${enc(cluster)}/status`)
export const alerts = (cluster: string) => get<Alert[]>(`/clusters/${enc(cluster)}/alerts`)
export const usage = (cluster: string, ns: string) => get<{ cpu: number; memory: number; pods: number }>(`/clusters/${enc(cluster)}/namespaces/${enc(ns)}/usage`)
export const grafanaURL = (cluster: string) => `/api/plugins/monitoring/grafana/${enc(cluster)}/`

export function bytes(n: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`
}
export const cores = (n: number) => (n < 1 ? `${Math.round(n * 1000)}m` : `${n.toFixed(2)} cores`)
