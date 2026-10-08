import { apiGet, apiSend } from './client'

export type InstallMode = 'install' | 'connect'
export type InstallationPhase = 'Pending' | 'Installing' | 'Ready' | 'Error' | 'Disabled' | 'Uninstalling'

export interface PolicyRule {
  apiGroups?: string[]
  resources?: string[]
  resourceNames?: string[]
  verbs: string[]
}

export interface ServiceAccess {
  name: string
  namespace?: string
  service?: string
  port?: string
  methods: string[]
  paths: string[]
  modes?: InstallMode[]
}

export interface ConfigProperty {
  type: 'string' | 'integer' | 'number' | 'boolean'
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
  pattern?: string
  minimum?: number
  maximum?: number
}

export interface ConfigSchema {
  type: 'object'
  properties?: Record<string, ConfigProperty>
  required?: string[]
}

export interface PluginSpec {
  repository: string
  displayName: string
  version: string
  description?: string
  icon?: string
  extensionApi: number
  scope: string
  modes: InstallMode[]
  extensionPoints?: string[]
  chart?: { archive: string; sha256: string; releaseName: string; namespace: string; version: string; refuseInstallOn?: string[] }
  ui?: { bundle: string; sha256: string }
  backend?: string
  permissions?: {
    install?: { clusterRules?: PolicyRule[]; namespaceRules?: PolicyRule[] }
    connect?: { clusterRules?: PolicyRule[]; namespaceRules?: PolicyRule[] }
    services?: ServiceAccess[]
  }
  configSchema?: ConfigSchema
  steps?: { name: string; title: string; modes?: InstallMode[] }[]
  /** Kinds the plugin writes (in Project namespaces) through Capybara. */
  objects?: { name: string; group: string; version: string; resource: string; kind: string; verbs: string[] }[]
}

/** Whether a plugin keeps data in volumes: its installer may delete
 * PersistentVolumeClaims (pkg/plugin HasData). Only then does uninstall
 * offer to keep the data. */
export function hasData(spec: PluginSpec): boolean {
  const rules = [...(spec.permissions?.install?.clusterRules ?? []), ...(spec.permissions?.install?.namespaceRules ?? [])]
  const allows = (verb: string) =>
    rules.some(
      (r) =>
        !r.resourceNames?.length &&
        (r.apiGroups ?? []).some((g) => g === '' || g === '*') &&
        (r.resources ?? []).some((x) => x === 'persistentvolumeclaims' || x === '*') &&
        r.verbs.some((v) => v === verb || v === '*'),
    )
  return allows('list') && allows('delete')
}

export interface StepStatus {
  name: string
  title: string
  /** Off: an informational step that does not hold (not a failure). */
  state: 'Pending' | 'Running' | 'Done' | 'Failed' | 'Off'
  message?: string
}

export interface CRDScan {
  request: string
  scannedAt: string
  crds?: string[]
  foreign?: string[]
  hash: string
  error?: string
}

export interface Installation {
  id: string
  uid: string
  spec: { plugin: string; cluster: string; mode: InstallMode; enabled: boolean; version: string }
  status: {
    phase?: InstallationPhase
    message?: string
    currentStep?: string
    steps?: StepStatus[]
    installedVersion?: string
    crdScan?: CRDScan
    conditions?: { type: string; status: string; reason: string; message?: string }[]
  }
  config: Record<string, unknown>
  deleting?: boolean
}

export interface CatalogEntry {
  name: string
  spec: PluginSpec
  status: { available: boolean; problem?: string; syncedAt?: string }
  trusted: boolean
  installations: Installation[]
  ui?: { url: string; sha256?: string; dev?: boolean }
  installerRules?: Record<InstallMode, { clusterRules?: PolicyRule[]; namespaceRules?: PolicyRule[] }>
}

const enc = encodeURIComponent

export const listPlugins = () => apiGet<CatalogEntry[]>('/api/plugins')
export const getPlugin = (name: string) => apiGet<CatalogEntry>(`/api/plugins/_catalog/${enc(name)}`)
export const getInstallation = (id: string) => apiGet<Installation>(`/api/plugins/installations/${enc(id)}`)

export interface InstallRequest {
  plugin: string
  cluster: string
  mode: InstallMode
  config?: Record<string, unknown>
  enabled?: boolean
}
export const installPlugin = (req: InstallRequest) => apiSend<Installation>('POST', '/api/plugins/installations', req)

export const updateInstallation = (
  inst: Installation,
  change: { enabled?: boolean; config?: Record<string, unknown>; version?: string },
) => apiSend<Installation>('PATCH', `/api/plugins/installations/${enc(inst.id)}`, { ...change, uid: inst.uid })

export function uninstallPlugin(inst: Installation, opts: { keepData: boolean; removeCRDs?: string }): Promise<unknown> {
  const q = new URLSearchParams({ confirm: inst.id, uid: inst.uid, keepData: String(opts.keepData) })
  if (opts.removeCRDs) q.set('removeCRDs', opts.removeCRDs)
  return apiSend('DELETE', `/api/plugins/installations/${enc(inst.id)}?${q.toString()}`)
}

export const requestCRDScan = (id: string) =>
  apiSend<{ request: string }>('POST', `/api/plugins/installations/${enc(id)}/_crd-scan`)

export const setConnectToken = (id: string, token: string) =>
  apiSend('PUT', `/api/plugins/installations/${enc(id)}/connect-token`, { token })

/** Whether an installation's UI is shown: installed (Ready) and enabled. */
export const isActiveInstallation = (i: Installation) =>
  i.spec.enabled && !i.deleting &&
  (i.status.phase === 'Ready' ||
    // A step failing after installation keeps the UI (no unloading open pages); the card shows the error.
    (i.status.phase === 'Error' && !!i.status.installedVersion && !!i.status.conditions?.some((c) => c.type === 'Installed' && c.status === 'True')))
