import type { SecretSummary } from '@/api/secrets'
import { secretSummaries } from '@/api/secrets'
import { labelChips } from '@/components/resource/render'
import type { ResourceDef, RowExtra } from '@/components/resource/types'

// Lists, watches and the detail page get Secret metadata only. Type and key
// names come from a server-side summary; values only from Reveal/Edit.
const summary = (extra?: RowExtra) => extra as SecretSummary | undefined

export const secrets: ResourceDef = {
  id: 'core.secrets',
  type: { group: '', version: 'v1', plural: 'secrets', kind: 'Secret', namespaced: true },
  label: 'Secrets',
  singular: 'Secret',
  path: 'config/secrets',
  sensitive: true,
  // Secret access is opt-in for Capybara's ServiceAccount (RBAC cannot grant
  // metadata-only listing).
  forbiddenHint: 'Secret access is opt-in: regenerate the kubeconfig with make sa-kubeconfig CLUSTER=… WITH_SECRETS=1 and replace it on the Clusters page.',
  deleteConfirm: 'type-name',
  rowExtras: secretSummaries,
  columns: [
    { key: 'type', title: 'Type', render: (_o, _now, x) => summary(x)?.type ?? '…', width: 170 },
    {
      key: 'keys',
      title: 'Keys',
      render: (_o, _now, x) => {
        const s = summary(x)
        return s ? s.keys.join(', ') || '—' : '…'
      },
    },
    { key: 'labels', title: 'Labels', render: (o) => labelChips(o.metadata.labels), width: 320, ellipsis: false },
  ],
  overview: [{ label: 'Values', render: () => 'Hidden. Use Reveal values on the YAML tab (recorded in the audit log).' }],
}
