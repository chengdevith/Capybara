import { h } from 'vue'
import type { KubeObject } from '@/api/k8s'
import type { ResourceDef } from '@/components/resource/types'

const keys = (cm: KubeObject): string[] => [
  ...Object.keys((cm.data as Record<string, string> | undefined) ?? {}),
  ...Object.keys((cm.binaryData as Record<string, string> | undefined) ?? {}),
]

export const configmaps: ResourceDef = {
  id: 'core.configmaps',
  type: { group: '', version: 'v1', plural: 'configmaps', kind: 'ConfigMap', namespaced: true },
  label: 'ConfigMaps',
  singular: 'ConfigMap',
  path: 'config/configmaps',
  columns: [{ key: 'data', title: 'Data', render: (o) => keys(o).length, sortValue: (o) => keys(o).length, width: 80 }],
  overview: [
    {
      label: 'Keys',
      render: (o) => (keys(o).length ? h('code', keys(o).join(', ')) : '—'),
    },
  ],
}
