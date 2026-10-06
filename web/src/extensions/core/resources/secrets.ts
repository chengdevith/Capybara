import { formatLabels } from '@/components/resource/format'
import type { ResourceDef } from '@/components/resource/types'

// The server only ever sends Secret metadata for lists, watches and the
// detail page (no type, no keys, no values). Values come from Reveal/Edit.
export const secrets: ResourceDef = {
  id: 'core.secrets',
  type: { group: '', version: 'v1', plural: 'secrets', kind: 'Secret', namespaced: true },
  label: 'Secrets',
  singular: 'Secret',
  path: 'config/secrets',
  sensitive: true,
  deleteConfirm: 'type-name',
  columns: [{ key: 'labels', title: 'Labels', render: (o) => formatLabels(o.metadata.labels) || '—' }],
  overview: [{ label: 'Values', render: () => 'Hidden. Use Reveal values on the YAML tab (recorded in the audit log).' }],
}
