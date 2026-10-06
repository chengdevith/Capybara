import { apiGet, apiSend } from './client'
import type { KubeList, KubeObject } from './k8s'

export type ProjectSize = 'S' | 'M' | 'L'
export type ProjectPhase = 'Pending' | 'Ready' | 'Error' | 'Terminating'

export interface Condition {
  type: string
  status: 'True' | 'False' | 'Unknown'
  reason: string
  message?: string
  lastTransitionTime?: string
  observedGeneration?: number
}

export interface ManagedResource {
  apiVersion: string
  kind: string
  name: string
  namespace?: string
}

export interface Project extends KubeObject {
  spec: {
    displayName?: string
    description?: string
    cluster: string
    namespace: string
    owner: string
    size: ProjectSize
  }
  status?: {
    phase?: ProjectPhase
    observedGeneration?: number
    conditions?: Condition[]
    resources?: ManagedResource[]
  }
}

export type ResourceList = Record<string, string>

export interface SizeSpec {
  quota: ResourceList
  limits: { defaultRequest?: ResourceList; default?: ResourceList; max?: ResourceList }
}

export interface ProjectConfig {
  sizes: Record<ProjectSize, SizeSpec>
  protected: string[]
  clusters: string[]
}

export interface CreateProject {
  name: string
  displayName?: string
  description?: string
  cluster: string
  namespace?: string
  owner: string
  size: ProjectSize
}

export const listProjects = (signal?: AbortSignal) => apiGet<KubeList>('/api/projects', { signal })
export const getProject = (name: string) => apiGet<Project>(`/api/projects/${encodeURIComponent(name)}`)
export const getProjectConfig = () => apiGet<ProjectConfig>('/api/projects/_config')
export const createProject = (req: CreateProject) => apiSend<Project>('POST', '/api/projects', req)
export const updateProject = (name: string, req: { displayName?: string; owner?: string; size?: ProjectSize }) =>
  apiSend<Project>('PATCH', `/api/projects/${encodeURIComponent(name)}`, req)
export const deleteProject = (name: string, uid: string) =>
  apiSend<{ deleting: boolean }>('DELETE', `/api/projects/${encodeURIComponent(name)}?uid=${encodeURIComponent(uid)}`)

export function projectsWatchUrl(resourceVersion: string): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const q = resourceVersion ? `?resourceVersion=${encodeURIComponent(resourceVersion)}` : ''
  return `${proto}//${window.location.host}/api/projects/_watch${q}`
}

/** A live source of all Projects for useLiveList. */
export const projectsSource = { key: 'projects', list: listProjects, watchUrl: projectsWatchUrl }

export const readyCondition = (p: Project) => p.status?.conditions?.find((c) => c.type === 'Ready')

const order: Record<ProjectSize, number> = { S: 0, M: 1, L: 2 }
export const isSmaller = (to: ProjectSize, from: ProjectSize) => order[to] < order[from]
