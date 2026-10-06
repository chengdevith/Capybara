import type { KubeObject } from '@/api/k8s'
import { statusTag } from '@/components/resource/render'
import type { ResourceDef, Tone } from '@/components/resource/types'

export function nodeStatus(n: KubeObject): { text: string; tone: Tone } {
  const ready = (n.status?.conditions as { type: string; status: string }[] | undefined)?.find((c) => c.type === 'Ready')
  if (!ready) return { text: 'Unknown', tone: 'warning' }
  return ready.status === 'True' ? { text: 'Ready', tone: 'success' } : { text: 'NotReady', tone: 'error' }
}

const roles = (n: KubeObject) =>
  Object.keys(n.metadata.labels ?? {})
    .filter((k) => k.startsWith('node-role.kubernetes.io/'))
    .map((k) => k.slice('node-role.kubernetes.io/'.length))
    .join(', ') || '—'

// Read-only for Capybara's account (no write access to nodes).
export const nodes: ResourceDef = {
  id: 'core.nodes',
  type: { group: '', version: 'v1', plural: 'nodes', kind: 'Node', namespaced: false },
  label: 'Nodes',
  singular: 'Node',
  path: 'nodes',
  deleteConfirm: 'type-name',
  status: nodeStatus,
  columns: [
    {
      key: 'status',
      title: 'Status',
      width: 110,
      render: (o) => {
        const s = nodeStatus(o)
        return statusTag(s.text, s.tone)
      },
    },
    { key: 'roles', title: 'Roles', render: roles },
    { key: 'version', title: 'Kubelet', render: (o) => (o.status?.nodeInfo as { kubeletVersion?: string } | undefined)?.kubeletVersion ?? '—' },
  ],
}
