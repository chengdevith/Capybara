// The Create/Edit Application form's fields and the Application they
// stand for. Pure, so it is tested with node --test. Capybara's server
// fills in and checks the rest (Argo CD project, destination, repository
// rules): the form only sends what the user chose.

export interface AppForm {
  name: string
  repoURL: string
  targetRevision: string
  path: string
  autoSync: boolean
  selfHeal: boolean
  prune: boolean
  /** Deleting the Application also deletes what it deployed. */
  cascade: boolean
}

export const CASCADE = 'resources-finalizer.argocd.argoproj.io'

export const emptyForm = (): AppForm => ({
  name: '', repoURL: '', targetRevision: 'HEAD', path: '', autoSync: false, selfHeal: false, prune: false, cascade: true,
})

type Json = Record<string, unknown>

/**
 * The Application for a form, in namespace ns. `base` (when editing) keeps
 * every field the form does not show (e.g. helm values, ignoreDifferences).
 */
export function applicationOf(f: AppForm, ns: string, base?: Json): Json {
  const obj = structuredClone(base ?? {}) as Json
  obj.apiVersion = 'argoproj.io/v1alpha1'
  obj.kind = 'Application'
  const meta = (obj.metadata ?? {}) as Json
  meta.name = f.name
  meta.namespace = ns
  const finalizers = ((meta.finalizers as string[] | undefined) ?? []).filter((x) => !x.startsWith(CASCADE))
  if (f.cascade) finalizers.push(CASCADE)
  if (finalizers.length) meta.finalizers = finalizers
  else delete meta.finalizers
  obj.metadata = meta

  const spec = (obj.spec ?? {}) as Json
  const source = (spec.source ?? {}) as Json
  source.repoURL = f.repoURL.trim()
  source.targetRevision = f.targetRevision.trim() || 'HEAD'
  if (f.path.trim()) source.path = f.path.trim()
  else delete source.path
  spec.source = source
  const policy = (spec.syncPolicy ?? {}) as Json
  if (f.autoSync) {
    policy.automated = { ...((policy.automated as Json | undefined) ?? {}), selfHeal: f.selfHeal, prune: f.prune }
  } else {
    delete policy.automated
  }
  if (Object.keys(policy).length) spec.syncPolicy = policy
  else delete spec.syncPolicy
  // Project and destination: Capybara sets them (its Project's own).
  spec.destination = { ...((spec.destination as Json | undefined) ?? {}), namespace: ns, server: 'https://kubernetes.default.svc' }
  obj.spec = spec
  return obj
}

/** The form for an Application (editing, or switching from YAML). */
export function formOf(obj: Json): AppForm {
  const meta = (obj.metadata ?? {}) as { name?: string; finalizers?: string[] }
  const spec = (obj.spec ?? {}) as { source?: Json; syncPolicy?: { automated?: { selfHeal?: boolean; prune?: boolean } } }
  const automated = spec.syncPolicy?.automated
  return {
    name: meta.name ?? '',
    repoURL: String(spec.source?.repoURL ?? ''),
    targetRevision: String(spec.source?.targetRevision ?? 'HEAD'),
    path: String(spec.source?.path ?? ''),
    autoSync: !!automated,
    selfHeal: !!automated?.selfHeal,
    prune: !!automated?.prune,
    cascade: (meta.finalizers ?? []).some((x) => x.startsWith(CASCADE)),
  }
}

/** What the form cannot show (YAML only); switching to the form keeps it. */
export function formHides(obj: Json): string[] {
  const spec = (obj.spec ?? {}) as Json
  const source = (spec.source ?? {}) as Json
  const out: string[] = []
  for (const k of ['helm', 'kustomize', 'directory', 'plugin', 'chart', 'ref']) if (source[k] !== undefined) out.push(`spec.source.${k}`)
  for (const k of ['sources', 'ignoreDifferences', 'info', 'revisionHistoryLimit']) if (spec[k] !== undefined) out.push(`spec.${k}`)
  const policy = (spec.syncPolicy ?? {}) as Json
  for (const k of ['syncOptions', 'retry', 'managedNamespaceMetadata']) if (policy[k] !== undefined) out.push(`spec.syncPolicy.${k}`)
  return out
}

/** Quick checks before asking the server (which checks everything). */
export function formProblems(f: AppForm): string[] {
  const out: string[] = []
  if (!/^[a-z0-9]([-a-z0-9]{0,51}[a-z0-9])?$/.test(f.name)) out.push('Name: lowercase letters, digits and dashes (at most 53).')
  if (!f.repoURL.trim()) out.push('Repository URL is required.')
  else if (!/^(https|http|git):\/\//.test(f.repoURL.trim())) out.push('Repository URL: https://, or http:// / git:// to a service in this cluster (no SSH).')
  if (f.path.includes('..')) out.push('Path may not contain "..".')
  return out
}
