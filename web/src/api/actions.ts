import { apiGet, apiSend } from './client'
import type { KubeObject, ResourceType } from './k8s'

/** The object an action is about (see pkg/action.Target). */
export interface Target {
  group: string
  version: string
  resource: string
  kind: string
  namespace?: string
  name: string
}

export function targetOf(type: ResourceType, obj: KubeObject): Target {
  return {
    group: type.group,
    version: type.version,
    resource: type.plural,
    kind: type.kind,
    namespace: type.namespaced ? obj.metadata.namespace : undefined,
    name: obj.metadata.name,
  }
}

/** A field another field manager owns with a different value. */
export interface Conflict {
  field: string
  manager?: string
  subresource?: string
  message: string
}

const base = (cluster: string) => `/api/clusters/${encodeURIComponent(cluster)}`

/** Server-side apply as field manager "capybara". Dry runs are not audited. */
export function applyObject(
  cluster: string,
  target: Target,
  object: Record<string, unknown>,
  opts: { dryRun?: boolean; force?: boolean } = {},
): Promise<{ object: KubeObject; dryRun: boolean }> {
  const q = new URLSearchParams()
  if (opts.dryRun) q.set('dryRun', 'true')
  if (opts.force) q.set('force', 'true')
  const qs = q.toString()
  return apiSend('POST', `${base(cluster)}/apply${qs ? `?${qs}` : ''}`, { target, object })
}

export function scaleObject(cluster: string, target: Target, replicas: number): Promise<{ replicas: number }> {
  return apiSend('POST', `${base(cluster)}/actions/scale`, { target, replicas })
}

export function restartObject(cluster: string, target: Target): Promise<{ restartedAt: string }> {
  return apiSend('POST', `${base(cluster)}/actions/restart`, { target })
}

export function deleteObject(cluster: string, target: Target, uid: string): Promise<{ deleted: boolean }> {
  return apiSend('POST', `${base(cluster)}/actions/delete`, { target, uid })
}

/** Fetches a Secret with its values. Audited server-side as "reveal". */
export function revealSecret(cluster: string, namespace: string, name: string): Promise<KubeObject> {
  return apiGet(`${base(cluster)}/secrets/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`, {
    cache: 'no-store',
  })
}
