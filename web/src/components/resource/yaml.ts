import { parse, stringify } from 'yaml'
import type { KubeObject, ResourceType } from '@/api/k8s'

/** Metadata the server owns; hidden while editing (the server strips it too). */
const SERVER_METADATA = ['managedFields', 'creationTimestamp', 'generation', 'selfLink', 'deletionTimestamp', 'deletionGracePeriodSeconds']

function apiVersionOf(type: ResourceType): string {
  return type.group ? `${type.group}/${type.version}` : type.version
}

/**
 * The object as YAML, kubectl-style key order (apiVersion, kind, metadata,
 * then the rest). List items carry no apiVersion/kind, so they are put back.
 */
export function toYaml(type: ResourceType, obj: KubeObject, opts: { managedFields?: boolean } = {}): string {
  const { metadata, ...rest } = obj
  const meta = opts.managedFields ? metadata : { ...metadata, managedFields: undefined }
  return stringify({ apiVersion: apiVersionOf(type), kind: type.kind, metadata: meta, ...rest }, { lineWidth: 0 })
}

/**
 * What the editor starts from: no status, no server-owned metadata.
 * resourceVersion stays, so an edit of an outdated copy is rejected
 * instead of silently overwriting someone else's change.
 */
export function toEditableYaml(type: ResourceType, obj: KubeObject): string {
  const { metadata, status: _status, ...rest } = obj
  const meta: Record<string, unknown> = { ...metadata }
  for (const f of SERVER_METADATA) delete meta[f]
  return stringify({ apiVersion: apiVersionOf(type), kind: type.kind, metadata: meta, ...rest }, { lineWidth: 0 })
}

/** An object for editing, whatever its kind (apiVersion and kind kept). */
export function editableObjectYaml(obj: Record<string, unknown>): string {
  const { apiVersion, kind, metadata, status: _status, ...rest } = obj as Record<string, unknown> & { metadata?: Record<string, unknown> }
  const meta: Record<string, unknown> = { ...(metadata ?? {}) }
  for (const f of [...SERVER_METADATA, 'uid', 'resourceVersion']) delete meta[f]
  return stringify({ apiVersion, kind, metadata: meta, ...rest }, { lineWidth: 0 })
}

/** Parses editor text into an object, or throws a readable error. */
export function parseObject(text: string): Record<string, unknown> {
  let value: unknown
  try {
    value = parse(text)
  } catch (e) {
    throw new Error(`YAML is not valid: ${e instanceof Error ? e.message : String(e)}`, { cause: e })
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('YAML must describe one object (a mapping), not a list or a value.')
  }
  return value as Record<string, unknown>
}
