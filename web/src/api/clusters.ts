import { apiGet, apiSend } from './client'

export type ClusterPhase = 'Pending' | 'Connected' | 'Error'
export type Environment = 'dev' | 'uat' | 'prod'

/** Health as the Cluster controller last recorded it. */
export interface ClusterStatus {
  phase: ClusterPhase
  /** Connected, Unreachable, AuthFailed, CredentialsExpired, PermissionsLimited, ... */
  reason?: string
  message?: string
  version?: string
  /** Unset when the credentials cannot list nodes. */
  nodeCount?: number
  identity?: string
  credentialsExpireAt?: string
  lastChecked?: string
  /** Enabled (installer credential works), Disabled (none) or Error. */
  pluginInstalls?: 'Enabled' | 'Disabled' | 'Error'
  installerMessage?: string
  installerIdentity?: string
}

export interface Cluster {
  id: string
  displayName: string
  environment: Environment | string
  status: ClusterStatus
}

/** What the server learned from a kubeconfig. Never contains credentials. */
export interface KubeconfigSummary {
  context: string
  server: string
  authMethod: string
  caIncluded: boolean
  insecureSkipTLSVerify: boolean
  identity?: string
  expiresAt?: string
  warnings?: string[]
}

export interface PermissionCheck {
  name: string
  allowed: boolean
}

export interface TestResult {
  summary: KubeconfigSummary
  ok: boolean
  reason?: string
  message?: string
  identity?: string
  version?: string
  nodeCount?: number
  clusterAdmin: boolean
  checks?: PermissionCheck[]
}

export interface ClusterOverview extends Cluster {
  nodes: number | null
  namespaces: number | null
  pods?: Record<string, number>
  deployments: number | null
  services: number | null
  projects: number | null
}

export function listClusters(): Promise<Cluster[]> {
  return apiGet<Cluster[]>('/api/clusters')
}

const enc = encodeURIComponent

/** Parses a kubeconfig on the server. Nothing is stored. */
export async function validateKubeconfig(kubeconfig: string): Promise<KubeconfigSummary> {
  return (await apiSend<{ summary: KubeconfigSummary }>('POST', '/api/clusters/_validate', { kubeconfig })).summary
}

/** Connects with a kubeconfig and reports what it can do. Nothing is stored. */
/** Tests a kubeconfig; with `cluster`, it must also reach that registered cluster. */
export function testKubeconfig(kubeconfig: string, cluster?: string): Promise<TestResult> {
  return apiSend<TestResult>('POST', '/api/clusters/_test', { kubeconfig, ...(cluster ? { cluster } : {}) })
}

export interface RegisterRequest {
  id: string
  displayName?: string
  environment: Environment
  kubeconfig: string
}

export function registerCluster(req: RegisterRequest): Promise<{ id: string; summary: KubeconfigSummary }> {
  return apiSend('POST', '/api/clusters', req)
}

export function updateCluster(id: string, patch: { displayName?: string; environment?: Environment }): Promise<unknown> {
  return apiSend('PATCH', `/api/clusters/${enc(id)}`, patch)
}

export function replaceKubeconfig(id: string, kubeconfig: string): Promise<{ summary: KubeconfigSummary }> {
  return apiSend('PUT', `/api/clusters/${enc(id)}/kubeconfig`, { kubeconfig })
}

/** Removes a cluster. Refused (409, body.projects) while Projects use it
 * unless `abandon` leaves their remote resources in place. */
export function removeCluster(id: string, abandon = false): Promise<unknown> {
  const q = new URLSearchParams({ confirm: id })
  if (abandon) q.set('abandon', 'true')
  return apiSend('DELETE', `/api/clusters/${enc(id)}?${q.toString()}`)
}

export function clusterOverview(id: string, signal?: AbortSignal): Promise<ClusterOverview> {
  return apiGet<ClusterOverview>(`/api/clusters/${enc(id)}/overview`, { signal })
}

/** Short status text: "Connected", or the reason when something is wrong. */
export function statusLabel(c: Cluster): string {
  const s = c.status
  if (s.phase === 'Connected') return s.reason === 'PermissionsLimited' ? 'Connected (limited)' : 'Connected'
  if (s.phase === 'Pending') return 'Checking…'
  return s.reason ?? 'Error'
}

export function statusTone(c: Cluster): 'success' | 'warning' | 'error' | 'default' {
  const s = c.status
  if (s.phase === 'Pending') return 'default'
  if (s.phase === 'Error') return 'error'
  return s.reason && s.reason !== 'Connected' ? 'warning' : 'success'
}

/** Days until the credentials expire (negative if expired), or null. */
export function expiresInDays(c: Cluster, now: number): number | null {
  const at = c.status.credentialsExpireAt
  if (!at) return null
  return Math.floor((Date.parse(at) - now) / 86_400_000)
}

/** Stores the cluster's installer credential (write-only). */
export function setInstaller(id: string, kubeconfig: string): Promise<{ summary: KubeconfigSummary }> {
  return apiSend('PUT', `/api/clusters/${enc(id)}/installer`, { kubeconfig })
}

/** Removes the installer credential: plugin installs are disabled there. */
export function removeInstaller(id: string): Promise<unknown> {
  return apiSend('DELETE', `/api/clusters/${enc(id)}/installer`)
}
