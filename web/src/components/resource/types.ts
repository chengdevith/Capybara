import type { VNodeChild } from 'vue'
import type { KubeObject, ResourceType } from '@/api/k8s'

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'default'

/** Extra per-row data a kind loads from the server (see ResourceDef.rowExtras). */
export type RowExtra = object

export interface Column {
  key: string
  title: string
  render: (obj: KubeObject, now: number, extra?: RowExtra) => VNodeChild
  /** Enables sorting on this column. */
  sortValue?: (obj: KubeObject) => string | number
  /** Fixed width (px). Use for short values (counts, IPs, types). */
  width?: number
  /** Minimum width (px) for flexible columns; the table scrolls sideways below it. */
  minWidth?: number
  /** One line with an ellipsis and the full text on hover (default). False for cells with chips. */
  ellipsis?: boolean
}

export interface Field {
  label: string
  render: (obj: KubeObject) => VNodeChild
}

/**
 * Everything the generic list and detail pages need to show one kind.
 * A resource page is one of these plus registerResource(); never a copy
 * of a page.
 */
export interface ResourceDef {
  /** Globally unique, e.g. 'core.pods'. Routes are `<id>.list` / `<id>.detail`. */
  id: string
  type: ResourceType
  /** Plural label, e.g. 'Pods'. */
  label: string
  /** Singular label, e.g. 'Pod'. */
  singular: string
  /** Route path of the list page, relative to /c/:cluster/. */
  path: string
  /** Columns after Name (and Namespace); Age is always last. */
  columns: Column[]
  /** Extra fields on the Overview tab. */
  overview?: Field[]
  /** Status shown next to the title on the detail page. */
  status?: (obj: KubeObject) => { text: string; tone: Tone }
  /**
   * Values are never sent with lists, watches or the detail object (the
   * server sends metadata only); they are fetched on Reveal or Edit.
   */
  sensitive?: boolean
  /** How to get access, shown when the cluster refuses to list this kind (403). */
  forbiddenHint?: string
  /** How deleting one is confirmed. Default 'simple'. */
  deleteConfirm?: 'simple' | 'type-name'
  /**
   * Loads extra per-row data (by uid) for the list, e.g. Secret types and
   * key names from a server-side summary. Reloaded when the list changes.
   */
  rowExtras?: (cluster: string, namespace: string | null) => Promise<Map<string, RowExtra>>
  /** A "Create" button on the list page, opening this route (with the
   * selected namespace as ?ns=); shown only once the route exists. */
  create?: { label: string; route: string; when?: (cluster: string, namespace: string | null) => boolean }
}

export const listRouteOf = (def: ResourceDef): string => `${def.id}.list`
export const detailRouteOf = (def: ResourceDef): string => `${def.id}.detail`

/** Props every resource-detail-tab component receives. */
export interface DetailTabProps {
  cluster: string
  resource: ResourceDef
  object: KubeObject
}
