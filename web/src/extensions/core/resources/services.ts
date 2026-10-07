import type { KubeObject } from '@/api/k8s'
import { formatLabels } from '@/components/resource/format'
import { dash, labelChips } from '@/components/resource/render'
import type { ResourceDef } from '@/components/resource/types'

interface ServicePort {
  name?: string
  port: number
  targetPort?: number | string
  nodePort?: number
  protocol?: string
}

export function servicePorts(s: KubeObject): string {
  return (
    ((s.spec?.ports as ServicePort[]) ?? [])
      .map((p) => `${p.port}${p.nodePort ? `:${p.nodePort}` : ''}/${p.protocol ?? 'TCP'}`)
      .join(', ') || '—'
  )
}

export function externalIPs(s: KubeObject): string {
  const ingress: { ip?: string; hostname?: string }[] = s.status?.loadBalancer?.ingress ?? []
  const ips = [...ingress.map((i) => i.ip ?? i.hostname ?? ''), ...((s.spec?.externalIPs as string[]) ?? [])]
  return ips.filter(Boolean).join(', ') || (s.spec?.type === 'LoadBalancer' ? '<pending>' : '—')
}

export const services: ResourceDef = {
  id: 'core.services',
  type: { group: '', version: 'v1', plural: 'services', kind: 'Service', namespaced: true },
  label: 'Services',
  singular: 'Service',
  path: 'networking/services',
  deleteConfirm: 'type-name',
  columns: [
    { key: 'type', title: 'Type', render: (o) => dash(o.spec?.type), sortValue: (o) => o.spec?.type ?? '', width: 110 },
    { key: 'clusterIP', title: 'Cluster IP', render: (o) => dash(o.spec?.clusterIP), width: 130 },
    { key: 'externalIP', title: 'External IP', render: externalIPs },
    { key: 'ports', title: 'Ports', render: servicePorts },
    { key: 'selector', title: 'Selector', render: (o) => labelChips(o.spec?.selector), width: 300, ellipsis: false },
  ],
  overview: [
    { label: 'Type', render: (o) => dash(o.spec?.type) },
    { label: 'Cluster IPs', render: (o) => dash(((o.spec?.clusterIPs as string[]) ?? []).join(', ')) },
    { label: 'External IP', render: externalIPs },
    {
      label: 'Ports',
      render: (o) =>
        ((o.spec?.ports as ServicePort[]) ?? [])
          .map((p) => `${p.name ? `${p.name}: ` : ''}${p.port} → ${p.targetPort ?? p.port}/${p.protocol ?? 'TCP'}`)
          .join(', ') || '—',
    },
    { label: 'Selector', render: (o) => formatLabels(o.spec?.selector) || '—' },
    { label: 'Session affinity', render: (o) => dash(o.spec?.sessionAffinity) },
  ],
}
