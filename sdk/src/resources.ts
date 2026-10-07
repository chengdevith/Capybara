import type { Component, Ref, VNodeChild } from 'vue'

// Kubernetes object shapes and the resource-page definition a plugin passes
// to api.registerResource(). They describe the same values the console's
// own resource pages use, so plugin kinds get the generic list and detail
// pages (live updates, YAML, Events, actions) instead of copies of them.

export interface KubeObjectMeta {
  name: string
  namespace?: string
  uid: string
  resourceVersion?: string
  creationTimestamp: string
  deletionTimestamp?: string
  generation?: number
  labels?: Record<string, string>
  annotations?: Record<string, string>
  ownerReferences?: { apiVersion: string; kind: string; name: string; uid: string; controller?: boolean }[]
}

export interface KubeObject {
  apiVersion?: string
  kind?: string
  metadata: KubeObjectMeta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any
  [key: string]: unknown
}

/** A resource type in the Kubernetes API. */
export interface ResourceType {
  /** '' for the core group. */
  group: string
  version: string
  /** Plural resource name used in URLs, e.g. 'pipelineruns'. */
  plural: string
  kind: string
  namespaced: boolean
}

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'default'

export interface ResourceColumn {
  key: string
  title: string
  /** `now` (ms) ticks, for durations and ages. */
  render: (obj: KubeObject, now: number) => VNodeChild
  sortValue?: (obj: KubeObject) => string | number
  width?: number
  minWidth?: number
  ellipsis?: boolean
}

export interface ResourceField {
  label: string
  render: (obj: KubeObject) => VNodeChild
}

/** A kind shown with the console's generic list and detail pages. */
export interface PluginResourceDef {
  /** '<plugin>.<plural>'. Routes are `<id>.list` / `<id>.detail`. */
  id: string
  type: ResourceType
  label: string
  singular: string
  /** List page path under /c/:cluster/, e.g. 'pipelines/runs'. */
  path: string
  /** Columns after Name (and Namespace); Age is always last. */
  columns: ResourceColumn[]
  overview?: ResourceField[]
  status?: (obj: KubeObject) => { text: string; tone: Tone }
  /** Shown when the cluster refuses to list this kind (403). */
  forbiddenHint?: string
}

/** Where a resource's sidebar item goes. */
export interface ResourceNav {
  order: number
  /** nav-section id (the plugin's own, or a core one). */
  section?: string
}

/** What useLiveList keeps live: a kind in a cluster, optionally filtered. */
export interface LiveListSource {
  cluster: string
  type: ResourceType
  /** Empty or null: all namespaces. */
  namespace?: string | null
  labelSelector?: string
  fieldSelector?: string
}

export interface LiveListOptions {
  sort?: (a: KubeObject, b: KubeObject) => number
  /** Keep at most this many (the ones sorting last are dropped). */
  max?: number
}

export interface LiveList {
  items: Ref<KubeObject[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  /** The cluster refused the list (403). */
  forbidden: Ref<boolean>
  live: Ref<boolean>
  reload: () => void
}

/** Components the console lends to plugins. */
export interface PluginComponents {
  /**
   * Streams a pod's container logs (follow, tail, timestamps, wrap).
   * Props: cluster, namespace, pod, containers ({label, value}[]),
   * container? (initially selected).
   */
  LogViewer: Component
  /**
   * Link to an object's detail page. Props: resource (a resource id such
   * as 'core.pods' or '<plugin>.<plural>'), namespace?, name, cluster?
   * (default: the one in the URL). Plain text when that page is not
   * registered.
   */
  ResourceLink: Component
}

export interface PluginComposables {
  /** Lists a kind and keeps it live through the watch websocket. Pass a
   * getter (or ref) so a changed source restarts it; null = nothing yet. */
  useLiveList(source: () => LiveListSource | null, opts?: LiveListOptions): LiveList
}
