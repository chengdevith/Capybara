// Reading an Argo CD Application's state, explaining Argo CD's refusals in
// Project terms, and finding which Application manages an object. Pure, so
// it is tested with node --test.

type Tone = 'success' | 'warning' | 'error' | 'info' | 'default'

// Only the fields read here.
interface Obj {
  metadata: { name: string; namespace?: string; labels?: Record<string, string>; annotations?: Record<string, string> }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any
}

export function syncOf(o: Obj): { text: string; tone: Tone } {
  if (o.status?.operationState?.phase === 'Running') return { text: 'Syncing', tone: 'info' }
  const s: string = o.status?.sync?.status ?? 'Unknown'
  return { text: s, tone: s === 'Synced' ? 'success' : s === 'OutOfSync' ? 'warning' : 'default' }
}

export function healthOf(o: Obj | { health?: { status?: string } }): { text: string; tone: Tone } {
  const s: string = ('status' in o ? o.status?.health?.status : (o as { health?: { status?: string } }).health?.status) ?? 'Unknown'
  const tones: Record<string, Tone> = { Healthy: 'success', Progressing: 'info', Suspended: 'default', Degraded: 'error', Missing: 'warning' }
  return { text: s, tone: tones[s] ?? 'default' }
}

/** A Git commit as its first 7 characters; anything else as it is. */
export function shortRevision(rev: string | undefined): string {
  if (!rev) return '—'
  return /^[0-9a-f]{40}$/.test(rev) ? rev.slice(0, 7) : rev
}

/**
 * What a refusal by Argo CD means for a Project's Application, or '' when
 * it is not one of these. Argo CD checks each resource against the
 * Project's AppProject when it syncs.
 */
export function explainRefusal(message: string): string {
  const m = message ?? ''
  if (/RoleBinding/.test(m) && /not permitted|is not allowed|blacklist|denied/i.test(m)) {
    return 'RoleBindings are refused in Projects: a chart that needs one cannot be deployed through GitOps yet (roles are granted per user from Phase 5).'
  }
  if (/(ResourceQuota|LimitRange|NetworkPolicy)/.test(m) && /not permitted|is not allowed|blacklist/i.test(m)) {
    return "A Project's quota, limits and network policies are set by Capybara; an Application may not change them."
  }
  if (/cluster level|cluster-scoped|cluster scoped/i.test(m) && /not permitted|is not allowed/i.test(m)) {
    return 'Cluster-scoped resources (namespaces, CRDs, ClusterRoles, …) are refused: an Application deploys only into its Project namespace.'
  }
  if (/namespace .* is not permitted|destination .* is not permitted|not permitted in project/i.test(m)) {
    return "Every resource must go into the Project's own namespace on this cluster."
  }
  if (/exceeded quota|forbidden: exceeded/i.test(m)) {
    return "The Project's quota does not allow it: lower the requests or ask for a larger Project size."
  }
  if (/not permitted to use project|is not allowed to use project|application .* not allowed/i.test(m)) {
    return "Applications in this namespace must use their Project's Argo CD project (capybara-<project>)."
  }
  return ''
}

/** Sources and destinations of an AppProject, in words. */
export function appProjectsSummary(o: Obj): { sources: string; destinations: string } {
  const sources = ((o.spec?.sourceNamespaces as string[] | undefined) ?? []).join(', ')
  const destinations = ((o.spec?.destinations as { server?: string; name?: string; namespace?: string }[] | undefined) ?? [])
    .map((d) => `${d.namespace ?? '*'}${d.server === 'https://kubernetes.default.svc' || d.name === 'in-cluster' ? '' : ` on ${d.server ?? d.name ?? '?'}`}`)
    .join(', ')
  return { sources: sources || `${o.metadata.namespace ?? ''} only`, destinations: destinations || 'nowhere' }
}

export const TRACKING_ANNOTATION = 'argocd.argoproj.io/tracking-id'

/**
 * The Application that manages an object: from Argo CD's tracking
 * annotation ("<app>:<group>/<kind>:<namespace>/<name>", where <app> is
 * "<namespace>_<name>" for Applications outside Argo CD's namespace), or the
 * app.kubernetes.io/instance label (label tracking). null: not managed.
 */
export function managedBy(o: Obj, argoNamespace = 'argocd'): { namespace: string; name: string; via: 'annotation' | 'label' } | null {
  const id = o.metadata.annotations?.[TRACKING_ANNOTATION]
  if (id) {
    const app = id.split(':')[0] ?? ''
    if (app) {
      const i = app.indexOf('_')
      return i > 0 ? { namespace: app.slice(0, i), name: app.slice(i + 1), via: 'annotation' } : { namespace: argoNamespace, name: app, via: 'annotation' }
    }
  }
  const instance = o.metadata.labels?.['app.kubernetes.io/instance']
  if (instance && o.metadata.labels?.['app.kubernetes.io/managed-by'] !== 'Helm') {
    const i = instance.indexOf('_')
    return i > 0 ? { namespace: instance.slice(0, i), name: instance.slice(i + 1), via: 'label' } : { namespace: o.metadata.namespace ?? argoNamespace, name: instance, via: 'label' }
  }
  return null
}

export interface HistoryEntry {
  id: number
  revision: string
  deployedAt?: string
  source?: { repoURL?: string; path?: string; targetRevision?: string }
}

/** Sync history, newest first; the newest is the one deployed now. */
export function historyOf(o: Obj): HistoryEntry[] {
  return [...((o.status?.history as HistoryEntry[] | undefined) ?? [])].sort((a, b) => b.id - a.id)
}

/** Why "Sync to this revision" is not offered for an Application ('' when it is). */
export function rollbackBlocked(o: Obj): string {
  if (o.spec?.syncPolicy?.automated) return 'Auto-sync is on: it would sync back to the target revision. Turn it off first.'
  if (o.spec?.sources) return 'Applications with several sources cannot be synced to an earlier revision here.'
  if ((o as { operation?: unknown }).operation) return 'A sync is in progress.'
  return ''
}
