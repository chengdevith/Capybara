import type { KubeObject, PluginApi, PluginResourceDef, ResourceType, Tone } from '@capybara/sdk'
import { NTag } from 'naive-ui'
import { h, shallowRef } from 'vue'
import { imagePullProblems } from './pulls'

export const PLUGIN = 'tekton'

// The console's API, set once by register() (components use its
// LogViewer, ResourceLink and useLiveList).
let current: PluginApi | null = null
export function setApi(api: PluginApi): void {
  current = api
}
export function api(): PluginApi {
  if (!current) throw new Error('tekton plugin is not registered')
  return current
}

const tekton = (plural: string, kind: string): ResourceType => ({ group: 'tekton.dev', version: 'v1', plural, kind, namespaced: true })
export const PIPELINE_RUNS = tekton('pipelineruns', 'PipelineRun')
export const TASK_RUNS = tekton('taskruns', 'TaskRun')
export const PIPELINES = tekton('pipelines', 'Pipeline')
export const TASKS = tekton('tasks', 'Task')

// --- Project namespaces: the only places Tekton objects may be written ---

interface ProjectView {
  spec: { cluster: string; namespace: string }
  status?: { phase?: string }
}
const projectKeys = shallowRef<Set<string> | null>(null)
let projectsLoading: Promise<void> | null = null
let projectsLoadedAt = 0

/** Loads the Ready Projects' namespaces (again when older than a minute,
 * or when forced). */
export function loadProjects(force = false): Promise<void> {
  if (projectsLoading && !force && Date.now() - projectsLoadedAt < 60_000) return projectsLoading
  projectsLoadedAt = Date.now()
  projectsLoading = (async () => {
    try {
      const res = await fetch('/api/projects', { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const body = (await res.json()) as { items?: ProjectView[] } | ProjectView[]
      const items = Array.isArray(body) ? body : (body.items ?? [])
      projectKeys.value = new Set(items.filter((p) => p.status?.phase === 'Ready').map((p) => `${p.spec.cluster}/${p.spec.namespace}`))
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

/** Project namespaces on a cluster (reactive). */
export function projectNamespaces(cluster: string): string[] {
  void loadProjects()
  return [...(projectKeys.value ?? [])].filter((k) => k.startsWith(`${cluster}/`)).map((k) => k.slice(cluster.length + 1)).sort()
}

interface Condition {
  type: string
  status: string
  reason?: string
  message?: string
}

/** A run's state from its Succeeded condition (PipelineRun and TaskRun).
 * A TaskRun stuck pulling an image says so instead of "Running". */
export function runStatus(o: KubeObject): { text: string; tone: Tone; running: boolean } {
  const c = ((o.status?.conditions as Condition[] | undefined) ?? []).find((x) => x.type === 'Succeeded')
  if (c?.status !== 'True' && c?.status !== 'False' && imagePullProblems(o).length > 0) {
    return { text: 'Image pull failed', tone: 'error', running: true }
  }
  if (!c) return { text: 'Pending', tone: 'default', running: true }
  if (c.status === 'True') return { text: 'Succeeded', tone: 'success', running: false }
  if (c.status === 'False') {
    const cancelled = /Cancelled/.test(c.reason ?? '')
    return { text: c.reason || 'Failed', tone: cancelled ? 'warning' : 'error', running: false }
  }
  return { text: c.reason || 'Running', tone: 'info', running: true }
}

export function runMessage(o: KubeObject): string {
  const c = ((o.status?.conditions as Condition[] | undefined) ?? []).find((x) => x.type === 'Succeeded')
  return c?.message ?? ''
}

/** "1m 05s" from start to completion (or now while running). */
export function duration(o: KubeObject, now: number): string {
  const start = Date.parse(o.status?.startTime ?? '')
  if (!start) return '—'
  const end = Date.parse(o.status?.completionTime ?? '') || now
  const s = Math.max(0, Math.round((end - start) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

export const startedAt = (o: KubeObject): number => Date.parse(o.status?.startTime ?? '') || Date.parse(o.metadata.creationTimestamp) || 0
/** Newest first. */
export const byNewest = (a: KubeObject, b: KubeObject): number => startedAt(b) - startedAt(a)

export function pipelineOf(run: KubeObject): string {
  return run.spec?.pipelineRef?.name ?? (run.spec?.pipelineSpec ? '(inline)' : '—')
}

export function statusTag(o: KubeObject) {
  const s = runStatus(o)
  return h(NTag, { size: 'small', type: s.tone, bordered: false, 'data-test': 'run-status' }, () => s.text)
}

const link = (resource: string, o: KubeObject, name: string | undefined) =>
  name ? h(api().components.ResourceLink, { resource, namespace: o.metadata.namespace, name }) : '—'

/** Create buttons: only where writing is possible (a Project namespace, or
 * any namespace when the cluster has Projects and the form picks one). */
const creatable = (cluster: string, ns: string | null) => (ns ? isProjectNamespace(ns, cluster) : projectNamespaces(cluster).length > 0)

const forbiddenHint = "Capybara's account on this cluster lacks the Pipelines console permissions: reinstall or reconnect the plugin."

export const pipelineRunsDef: PluginResourceDef = {
  id: 'tekton.pipelineruns',
  type: PIPELINE_RUNS,
  label: 'PipelineRuns',
  singular: 'PipelineRun',
  path: 'tekton/pipelineruns',
  create: { label: 'Create PipelineRun', route: 'tekton.pipelineruns.new', when: creatable },
  columns: [
    { key: 'status', title: 'Status', width: 140, ellipsis: false, render: statusTag, sortValue: (o) => runStatus(o).text },
    { key: 'pipeline', title: 'Pipeline', minWidth: 140, render: (o) => (o.spec?.pipelineRef?.name ? link('tekton.pipelines', o, o.spec.pipelineRef.name) : pipelineOf(o)), sortValue: pipelineOf },
    { key: 'started', title: 'Started', width: 180, render: (o) => (o.status?.startTime ? new Date(o.status.startTime).toLocaleString() : '—'), sortValue: startedAt },
    { key: 'duration', title: 'Duration', width: 100, render: (o, now) => duration(o, now) },
  ],
  status: (o) => runStatus(o),
  overview: [
    { label: 'Pipeline', render: (o) => (o.spec?.pipelineRef?.name ? link('tekton.pipelines', o, o.spec.pipelineRef.name) : pipelineOf(o)) },
    { label: 'Service account', render: (o) => o.spec?.taskRunTemplate?.serviceAccountName ?? 'default' },
    { label: 'Started', render: (o) => (o.status?.startTime ? new Date(o.status.startTime).toLocaleString() : '—') },
    { label: 'Duration', render: (o) => duration(o, Date.now()) },
    { label: 'Message', render: (o) => runMessage(o) || '—' },
    { label: 'Rerun of', render: (o) => link('tekton.pipelineruns', o, o.metadata.annotations?.['platform.capybara.io/copy-of']) },
  ],
  forbiddenHint,
}

export const taskRunsDef: PluginResourceDef = {
  id: 'tekton.taskruns',
  type: TASK_RUNS,
  label: 'TaskRuns',
  singular: 'TaskRun',
  path: 'tekton/taskruns',
  create: { label: 'Create TaskRun', route: 'tekton.taskruns.new', when: creatable },
  columns: [
    { key: 'status', title: 'Status', width: 140, ellipsis: false, render: statusTag, sortValue: (o) => runStatus(o).text },
    { key: 'pipelinerun', title: 'PipelineRun', minWidth: 160, render: (o) => link('tekton.pipelineruns', o, o.metadata.labels?.['tekton.dev/pipelineRun']) },
    { key: 'task', title: 'Task', minWidth: 120, render: (o) => o.metadata.labels?.['tekton.dev/pipelineTask'] ?? o.spec?.taskRef?.name ?? '—' },
    { key: 'duration', title: 'Duration', width: 100, render: (o, now) => duration(o, now) },
  ],
  status: (o) => runStatus(o),
  overview: [
    { label: 'PipelineRun', render: (o) => link('tekton.pipelineruns', o, o.metadata.labels?.['tekton.dev/pipelineRun']) },
    { label: 'Pod', render: (o) => link('core.pods', o, o.status?.podName) },
    { label: 'Duration', render: (o) => duration(o, Date.now()) },
    { label: 'Message', render: (o) => runMessage(o) || '—' },
  ],
  forbiddenHint,
}

export const pipelinesDef: PluginResourceDef = {
  id: 'tekton.pipelines',
  type: PIPELINES,
  label: 'Pipelines',
  singular: 'Pipeline',
  path: 'tekton/pipelines',
  create: { label: 'Create Pipeline', route: 'tekton.pipelines.new', when: creatable },
  columns: [
    { key: 'tasks', title: 'Tasks', width: 90, render: (o) => String((o.spec?.tasks as unknown[] | undefined)?.length ?? 0) },
    { key: 'description', title: 'Description', minWidth: 200, render: (o) => o.spec?.description ?? '' },
  ],
  overview: [
    { label: 'Tasks', render: (o) => ((o.spec?.tasks as { name: string }[] | undefined) ?? []).map((t) => t.name).join(', ') || '—' },
    { label: 'Parameters', render: (o) => ((o.spec?.params as { name: string }[] | undefined) ?? []).map((p) => p.name).join(', ') || '—' },
    { label: 'Workspaces', render: (o) => ((o.spec?.workspaces as { name: string }[] | undefined) ?? []).map((w) => w.name).join(', ') || '—' },
  ],
  forbiddenHint,
}

export const tasksDef: PluginResourceDef = {
  id: 'tekton.tasks',
  type: TASKS,
  label: 'Tasks',
  singular: 'Task',
  path: 'tekton/tasks',
  create: { label: 'Create Task', route: 'tekton.tasks.new', when: creatable },
  columns: [
    { key: 'steps', title: 'Steps', width: 90, render: (o) => String((o.spec?.steps as unknown[] | undefined)?.length ?? 0) },
    { key: 'description', title: 'Description', minWidth: 200, render: (o) => o.spec?.description ?? '' },
  ],
  overview: [
    { label: 'Steps', render: (o) => ((o.spec?.steps as { name?: string; image?: string }[] | undefined) ?? []).map((s) => `${s.name ?? '?'} (${s.image ?? '—'})`).join(', ') || '—' },
    { label: 'Parameters', render: (o) => ((o.spec?.params as { name: string }[] | undefined) ?? []).map((p) => p.name).join(', ') || '—' },
    { label: 'Workspaces', render: (o) => ((o.spec?.workspaces as { name: string }[] | undefined) ?? []).map((w) => w.name).join(', ') || '—' },
  ],
  forbiddenHint,
}

/** The plugin object (manifest `objects`) of each kind. */
export const objectOf: Record<string, 'tasks' | 'pipelines' | 'pipelineruns' | 'taskruns'> = { Task: 'tasks', Pipeline: 'pipelines', PipelineRun: 'pipelineruns', TaskRun: 'taskruns' }
