import type { KubeObject, PluginApi, PluginResourceDef, ResourceType, Tone } from '@capybara/sdk'
import { NTag } from 'naive-ui'
import { h, shallowRef } from 'vue'
import { appProjectsSummary, explainRefusal, healthOf, shortRevision, syncOf } from './status'

export const PLUGIN = 'argocd'

// The console's API, set once by register().
let current: PluginApi | null = null
export function setApi(api: PluginApi): void {
  current = api
}
export function api(): PluginApi {
  if (!current) throw new Error('argocd plugin is not registered')
  return current
}

const argo = (plural: string, kind: string): ResourceType => ({ group: 'argoproj.io', version: 'v1alpha1', plural, kind, namespaced: true })
export const APPLICATIONS = argo('applications', 'Application')
export const APP_PROJECTS = argo('appprojects', 'AppProject')

/** The cascade finalizer: deleting the Application deletes what it deployed. */
export const CASCADE_FINALIZER = 'resources-finalizer.argocd.argoproj.io'

// --- Project namespaces: the only places Applications may be written ---

interface ProjectView {
  metadata: { name: string }
  spec: { cluster: string; namespace: string }
  status?: { phase?: string }
}
const projectKeys = shallowRef<Map<string, string> | null>(null)
let projectsLoading: Promise<void> | null = null
let projectsLoadedAt = 0

/** Loads the Ready Projects (again when older than a minute, or forced). */
export function loadProjects(force = false): Promise<void> {
  if (projectsLoading && !force && Date.now() - projectsLoadedAt < 60_000) return projectsLoading
  projectsLoadedAt = Date.now()
  projectsLoading = (async () => {
    try {
      const res = await fetch('/api/projects', { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const body = (await res.json()) as { items?: ProjectView[] } | ProjectView[]
      const items = Array.isArray(body) ? body : (body.items ?? [])
      projectKeys.value = new Map(items.filter((p) => p.status?.phase === 'Ready').map((p) => [`${p.spec.cluster}/${p.spec.namespace}`, p.metadata.name]))
    } catch {
      // keep the last known set
    }
  })()
  return projectsLoading
}

/** Whether ns on cluster is a Ready Project's namespace (reactive). */
export function isProjectNamespace(ns: string | undefined, cluster: string | null): boolean {
  void loadProjects()
  return !!ns && !!projectKeys.value?.has(`${cluster}/${ns}`)
}

/** The Project that owns ns on cluster (reactive). */
export function projectOf(ns: string | undefined, cluster: string | null): string | undefined {
  void loadProjects()
  return ns ? projectKeys.value?.get(`${cluster}/${ns}`) : undefined
}

/** Project namespaces on a cluster (reactive). */
export function projectNamespaces(cluster: string): string[] {
  void loadProjects()
  return [...(projectKeys.value?.keys() ?? [])].filter((k) => k.startsWith(`${cluster}/`)).map((k) => k.slice(cluster.length + 1)).sort()
}

// --- Writable: Argo CD accepts Applications in Project namespaces ---

/** The installation step that must pass for writes (plugin.yaml). */
export const WRITE_STEP = 'apps-in-any-namespace'
const writableBy = shallowRef<Map<string, { writable: boolean; mode: string }>>(new Map())
const writableLoading = new Map<string, number>()

/** Loads whether GitOps can write on a cluster (again after a minute). */
export async function loadWritable(cluster: string, force = false): Promise<void> {
  const at = writableLoading.get(cluster) ?? 0
  if (!force && Date.now() - at < 60_000) return
  writableLoading.set(cluster, Date.now())
  try {
    const res = await fetch(`/api/plugins/installations/${encodeURIComponent(`${PLUGIN}.${cluster}`)}`, { headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const inst = (await res.json()) as { spec: { mode: string }; status: { steps?: { name: string; state: string }[] } }
    const step = inst.status.steps?.find((s) => s.name === WRITE_STEP)
    const next = new Map(writableBy.value)
    next.set(cluster, { writable: step?.state === 'Done', mode: inst.spec.mode })
    writableBy.value = next
  } catch {
    // keep the last known state
  }
}

/** Whether Applications can be written on cluster (reactive; false until known). */
export function isWritable(cluster: string | null): boolean {
  if (!cluster) return false
  void loadWritable(cluster)
  return writableBy.value.get(cluster)?.writable ?? false
}

/** Known to be view-only (connected to an Argo CD that only watches its own namespace). */
export function isViewOnly(cluster: string | null): boolean {
  if (!cluster) return false
  void loadWritable(cluster)
  const s = writableBy.value.get(cluster)
  return !!s && !s.writable
}

// --- Rendering ---

export function tag(text: string, tone: Tone, test?: string) {
  return h(NTag, { size: 'small', type: tone, bordered: false, ...(test ? { 'data-test': test } : {}) }, () => text)
}
export const syncTag = (o: KubeObject) => {
  const s = syncOf(o)
  return tag(s.text, s.tone, 'app-sync')
}
export const healthTag = (o: KubeObject) => {
  const s = healthOf(o)
  return tag(s.text, s.tone, 'app-health')
}

const lastSync = (o: KubeObject): number => Date.parse(o.status?.operationState?.finishedAt ?? '') || 0

const creatable = (cluster: string, ns: string | null) =>
  isWritable(cluster) && (ns ? isProjectNamespace(ns, cluster) : projectNamespaces(cluster).length > 0)

const forbiddenHint = "Capybara's account on this cluster lacks the GitOps console permissions: reinstall or reconnect the plugin."

export const applicationsDef: PluginResourceDef = {
  id: 'argocd.applications',
  type: APPLICATIONS,
  label: 'Applications',
  singular: 'Application',
  path: 'gitops/applications',
  create: { label: 'Create Application', route: 'argocd.applications.new', when: creatable },
  columns: [
    { key: 'sync', title: 'Sync', width: 120, ellipsis: false, render: syncTag, sortValue: (o) => syncOf(o).text },
    { key: 'health', title: 'Health', width: 120, ellipsis: false, render: healthTag, sortValue: (o) => healthOf(o).text },
    { key: 'revision', title: 'Revision', width: 110, render: (o) => shortRevision(o.status?.sync?.revision) },
    {
      key: 'lastSync', title: 'Last sync', width: 180,
      render: (o) => (lastSync(o) ? new Date(lastSync(o)).toLocaleString() : '—'), sortValue: lastSync,
    },
    { key: 'repo', title: 'Repository', minWidth: 200, render: (o) => o.spec?.source?.repoURL ?? '—' },
  ],
  status: (o) => {
    const s = syncOf(o)
    const hl = healthOf(o)
    return hl.tone === 'error' ? hl : s.tone === 'warning' ? s : hl
  },
  overview: [
    { label: 'Sync', render: syncTag },
    { label: 'Health', render: healthTag },
    { label: 'Repository', render: (o) => o.spec?.source?.repoURL ?? '—' },
    { label: 'Path', render: (o) => o.spec?.source?.path || '—' },
    { label: 'Target revision', render: (o) => o.spec?.source?.targetRevision || 'HEAD' },
    { label: 'Synced revision', render: (o) => shortRevision(o.status?.sync?.revision) },
    { label: 'Argo CD project', render: (o) => o.spec?.project ?? '—' },
    {
      label: 'Sync policy',
      render: (o) => {
        const a = o.spec?.syncPolicy?.automated
        if (!a) return 'Manual'
        return ['Auto-sync', a.selfHeal ? 'self-heal' : '', a.prune ? 'prune' : ''].filter(Boolean).join(', ')
      },
    },
    { label: 'Delete', render: (o) => ((o.metadata.finalizers ?? []).some((f: string) => f.startsWith(CASCADE_FINALIZER)) ? 'Removes what it deployed' : 'Application only') },
    { label: 'Last sync', render: (o) => (lastSync(o) ? `${o.status?.operationState?.phase ?? ''} at ${new Date(lastSync(o)).toLocaleString()}` : '—') },
    {
      label: 'Message',
      render: (o) => {
        const msg = o.status?.operationState?.message ?? ''
        const hint = explainRefusal(msg)
        return hint ? `${msg} — ${hint}` : msg || '—'
      },
    },
  ],
  forbiddenHint,
}

export const appProjectsDef: PluginResourceDef = {
  id: 'argocd.appprojects',
  type: APP_PROJECTS,
  label: 'Argo CD projects',
  singular: 'Argo CD project',
  path: 'gitops/projects',
  columns: [
    { key: 'sources', title: 'Applications from', minWidth: 160, render: (o) => appProjectsSummary(o).sources },
    { key: 'destinations', title: 'Deploys to', minWidth: 160, render: (o) => appProjectsSummary(o).destinations },
    { key: 'description', title: 'Description', minWidth: 200, render: (o) => o.spec?.description ?? '' },
  ],
  overview: [
    { label: 'Applications from', render: (o) => appProjectsSummary(o).sources },
    { label: 'Deploys to', render: (o) => appProjectsSummary(o).destinations },
    { label: 'Repositories', render: (o) => ((o.spec?.sourceRepos as string[] | undefined) ?? []).join(', ') || 'none' },
    { label: 'Cluster-scoped kinds', render: (o) => ((o.spec?.clusterResourceWhitelist as unknown[] | undefined) ?? []).length ? 'some allowed' : 'none' },
    {
      label: 'Kinds refused',
      render: (o) => ((o.spec?.namespaceResourceBlacklist as { group: string; kind: string }[] | undefined) ?? []).map((k) => k.kind).join(', ') || '—',
    },
  ],
  forbiddenHint,
}

/** Kinds the console shows, by Kubernetes kind (for links). */
export const coreResource: Record<string, string> = {
  Deployment: 'core.deployments',
  Service: 'core.services',
  ConfigMap: 'core.configmaps',
  Secret: 'core.secrets',
  Pod: 'core.pods',
}

export async function getApplication(cluster: string, namespace: string, name: string): Promise<KubeObject> {
  const url = `/api/clusters/${encodeURIComponent(cluster)}/k8s/apis/argoproj.io/v1alpha1/namespaces/${encodeURIComponent(namespace)}/applications/${encodeURIComponent(name)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Application ${name} could not be loaded (${res.status})`)
  return (await res.json()) as KubeObject
}
