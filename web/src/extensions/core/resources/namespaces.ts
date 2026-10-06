import type { KubeObject } from '@/api/k8s'
import { statusTag } from '@/components/resource/render'
import type { ResourceDef, Tone } from '@/components/resource/types'

export function namespaceStatus(ns: KubeObject): { text: string; tone: Tone } {
  const phase: string = ns.status?.phase ?? 'Unknown'
  return { text: phase, tone: phase === 'Active' ? 'success' : 'warning' }
}

export const namespaces: ResourceDef = {
  id: 'core.namespaces',
  type: { group: '', version: 'v1', plural: 'namespaces', kind: 'Namespace', namespaced: false },
  label: 'Namespaces',
  singular: 'Namespace',
  path: 'namespaces',
  status: namespaceStatus,
  columns: [
    {
      key: 'status',
      title: 'Status',
      render: (o) => {
        const s = namespaceStatus(o)
        return statusTag(s.text, s.tone)
      },
      width: 120,
    },
  ],
}
