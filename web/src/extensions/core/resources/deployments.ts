import type { KubeObject } from '@/api/k8s'
import { dash, statusTag } from '@/components/resource/render'
import type { ResourceDef, Tone } from '@/components/resource/types'

interface Condition {
  type: string
  status: string
  reason?: string
}

export function deploymentStatus(d: KubeObject): { text: string; tone: Tone } {
  const conds: Condition[] = d.status?.conditions ?? []
  const progressing = conds.find((c) => c.type === 'Progressing')
  if (progressing?.reason === 'ProgressDeadlineExceeded') return { text: 'Failed', tone: 'error' }
  const desired = d.spec?.replicas ?? 1
  const updated = d.status?.updatedReplicas ?? 0
  const available = d.status?.availableReplicas ?? 0
  if (desired === 0) return { text: 'Scaled to 0', tone: 'default' }
  if (updated < desired || available < desired) return { text: 'Progressing', tone: 'warning' }
  return { text: 'Available', tone: 'success' }
}

const images = (d: KubeObject): string =>
  (d.spec?.template?.spec?.containers ?? []).map((c: { image: string }) => c.image).join(', ')

export const deployments: ResourceDef = {
  id: 'core.deployments',
  type: { group: 'apps', version: 'v1', plural: 'deployments', kind: 'Deployment', namespaced: true },
  label: 'Deployments',
  singular: 'Deployment',
  path: 'workloads/deployments',
  status: deploymentStatus,
  columns: [
    {
      key: 'status',
      title: 'Status',
      render: (o) => {
        const s = deploymentStatus(o)
        return statusTag(s.text, s.tone)
      },
    },
    { key: 'ready', title: 'Ready', render: (o) => `${o.status?.readyReplicas ?? 0}/${o.spec?.replicas ?? 1}`, width: 80 },
    { key: 'updated', title: 'Up-to-date', render: (o) => o.status?.updatedReplicas ?? 0, width: 100 },
    { key: 'available', title: 'Available', render: (o) => o.status?.availableReplicas ?? 0, width: 100 },
    { key: 'images', title: 'Images', render: images },
  ],
  overview: [
    {
      label: 'Replicas',
      render: (o) =>
        `${o.spec?.replicas ?? 1} desired · ${o.status?.updatedReplicas ?? 0} updated · ` +
        `${o.status?.readyReplicas ?? 0} ready · ${o.status?.availableReplicas ?? 0} available`,
    },
    { label: 'Strategy', render: (o) => dash(o.spec?.strategy?.type) },
    {
      label: 'Selector',
      render: (o) =>
        dash(
          Object.entries((o.spec?.selector?.matchLabels as Record<string, string>) ?? {})
            .map(([k, v]) => `${k}=${v}`)
            .join(', '),
        ),
    },
    { label: 'Images', render: images },
  ],
}
