import { apiGet } from './client'

export interface OwnerReference {
  apiVersion: string
  kind: string
  name: string
  uid: string
  controller?: boolean
}

export interface ObjectMeta {
  name: string
  namespace?: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  deletionTimestamp?: string
  generation?: number
  labels?: Record<string, string>
  annotations?: Record<string, string>
  ownerReferences?: OwnerReference[]
  managedFields?: unknown[]
}

/** Any Kubernetes object. Kind-specific code narrows spec/status itself. */
export interface KubeObject {
  apiVersion?: string
  kind?: string
  metadata: ObjectMeta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any
  [key: string]: unknown
}

export interface KubeList<T extends KubeObject = KubeObject> {
  metadata: { resourceVersion: string; continue?: string }
  items: T[]
}

/** Identifies a resource type in the Kubernetes API. */
export interface ResourceType {
  /** '' for the core group. */
  group: string
  version: string
  /** Plural resource name used in URLs, e.g. 'pods'. */
  plural: string
  kind: string
  namespaced: boolean
}

export interface Selectors {
  labelSelector?: string
  fieldSelector?: string
}

/** Path of a resource (collection or single object) under the passthrough proxy. */
export function resourcePath(
  cluster: string,
  type: ResourceType,
  opts: { namespace?: string | null; name?: string } = {},
): string {
  const gv = type.group ? `apis/${type.group}/${type.version}` : `api/${type.version}`
  const ns = type.namespaced && opts.namespace ? `namespaces/${encodeURIComponent(opts.namespace)}/` : ''
  const name = opts.name ? `/${encodeURIComponent(opts.name)}` : ''
  return `/api/clusters/${encodeURIComponent(cluster)}/k8s/${gv}/${ns}${type.plural}${name}`
}

function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

const PAGE_SIZE = 500

/**
 * Lists every object of a type, following `continue` tokens. All pages of a
 * paginated list share the first page's resourceVersion, which is where a
 * watch should start.
 */
export async function listAll(
  cluster: string,
  type: ResourceType,
  opts: { namespace?: string | null } & Selectors = {},
  signal?: AbortSignal,
): Promise<KubeList> {
  const base = resourcePath(cluster, type, { namespace: opts.namespace })
  const items: KubeObject[] = []
  let resourceVersion = ''
  let cont: string | undefined
  do {
    const page = await apiGet<KubeList>(
      base +
        query({
          limit: PAGE_SIZE,
          continue: cont,
          labelSelector: opts.labelSelector,
          fieldSelector: opts.fieldSelector,
        }),
      { signal },
    )
    if (!resourceVersion) resourceVersion = page.metadata.resourceVersion
    items.push(...page.items)
    cont = page.metadata.continue
  } while (cont)
  return { metadata: { resourceVersion }, items }
}

export function getObject(
  cluster: string,
  type: ResourceType,
  namespace: string | null,
  name: string,
  signal?: AbortSignal,
): Promise<KubeObject> {
  return apiGet<KubeObject>(resourcePath(cluster, type, { namespace, name }), { signal })
}

function wsBase(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}`
}

/** Websocket URL of the watch hub for a resource type. */
export function watchUrl(
  cluster: string,
  type: ResourceType,
  opts: { namespace?: string | null; resourceVersion?: string } & Selectors = {},
): string {
  return (
    `${wsBase()}/api/clusters/${encodeURIComponent(cluster)}/watch` +
    query({
      group: type.group,
      version: type.version,
      resource: type.plural,
      namespace: type.namespaced ? opts.namespace : undefined,
      resourceVersion: opts.resourceVersion,
      labelSelector: opts.labelSelector,
      fieldSelector: opts.fieldSelector,
    })
  )
}

export interface LogOptions {
  namespace: string
  pod: string
  container?: string
  tailLines?: number
  previous?: boolean
  timestamps?: boolean
}

/** Websocket URL of the log stream for a container. */
export function logsUrl(cluster: string, opts: LogOptions): string {
  return (
    `${wsBase()}/api/clusters/${encodeURIComponent(cluster)}/logs` +
    query({
      namespace: opts.namespace,
      pod: opts.pod,
      container: opts.container,
      tailLines: opts.tailLines,
      previous: opts.previous || undefined,
      timestamps: opts.timestamps || undefined,
    })
  )
}

/** Message types on the watch websocket (see pkg/stream/watch.go). */
export type WatchMessage =
  | { type: 'ADDED' | 'MODIFIED' | 'DELETED' | 'BOOKMARK'; object: KubeObject }
  | { type: 'ERROR'; status: { code: number; reason?: string; message?: string } }

/** Message types on the logs websocket (see pkg/stream/logs.go). */
export type LogMessage = { type: 'log'; data: string } | { type: 'end' } | { type: 'error'; message: string }
