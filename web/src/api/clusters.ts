import { apiGet } from './client'

export type ClusterPhase = 'Connected' | 'Error'

export interface ClusterStatus {
  phase: ClusterPhase
  version?: string
  nodeCount: number
  message?: string
  lastChecked: string
}

export interface Cluster {
  id: string
  displayName: string
  environment: string
  status: ClusterStatus
}

export function listClusters(): Promise<Cluster[]> {
  return apiGet<Cluster[]>('/api/clusters')
}
