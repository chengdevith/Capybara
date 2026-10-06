import { h } from 'vue'
import type { KubeObject } from '@/api/k8s'
import { dash, statusTag } from '@/components/resource/render'
import type { ResourceDef, Tone } from '@/components/resource/types'

interface ContainerStatus {
  name: string
  image: string
  ready: boolean
  restartCount: number
  state?: { waiting?: { reason?: string }; running?: object; terminated?: { reason?: string; exitCode?: number } }
}

const BAD_WAITING = new Set([
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
  'CreateContainerConfigError',
  'InvalidImageName',
  'CreateContainerError',
])

/** Pod status as kubectl shows it. */
export function podStatus(pod: KubeObject): { text: string; tone: Tone } {
  if (pod.metadata.deletionTimestamp) return { text: 'Terminating', tone: 'warning' }
  const init: ContainerStatus[] = pod.status?.initContainerStatuses ?? []
  for (const c of init) {
    if (c.state?.terminated && c.state.terminated.exitCode === 0) continue
    const reason = c.state?.waiting?.reason ?? c.state?.terminated?.reason
    if (reason) return { text: `Init:${reason}`, tone: BAD_WAITING.has(reason) ? 'error' : 'warning' }
  }
  const containers: ContainerStatus[] = pod.status?.containerStatuses ?? []
  for (const c of containers) {
    const waiting = c.state?.waiting?.reason
    if (waiting) return { text: waiting, tone: BAD_WAITING.has(waiting) ? 'error' : 'warning' }
  }
  const phase: string = pod.status?.phase ?? 'Unknown'
  for (const c of containers) {
    const term = c.state?.terminated?.reason
    if (term && phase !== 'Succeeded') return { text: term, tone: 'error' }
  }
  switch (phase) {
    case 'Running':
      return { text: 'Running', tone: containers.every((c) => c.ready) ? 'success' : 'warning' }
    case 'Succeeded':
      return { text: 'Completed', tone: 'default' }
    case 'Pending':
      return { text: 'Pending', tone: 'warning' }
    case 'Failed':
      return { text: 'Failed', tone: 'error' }
    default:
      return { text: phase, tone: 'default' }
  }
}

const statuses = (pod: KubeObject): ContainerStatus[] => pod.status?.containerStatuses ?? []
const ready = (pod: KubeObject) => {
  const total = pod.spec?.containers?.length ?? 0
  return `${statuses(pod).filter((c) => c.ready).length}/${total}`
}
const restarts = (pod: KubeObject) => statuses(pod).reduce((n, c) => n + c.restartCount, 0)

export const pods: ResourceDef = {
  id: 'core.pods',
  type: { group: '', version: 'v1', plural: 'pods', kind: 'Pod', namespaced: true },
  label: 'Pods',
  singular: 'Pod',
  path: 'workloads/pods',
  status: podStatus,
  columns: [
    {
      key: 'status',
      title: 'Status',
      render: (o) => {
        const s = podStatus(o)
        return statusTag(s.text, s.tone)
      },
      sortValue: (o) => podStatus(o).text,
    },
    { key: 'ready', title: 'Ready', render: ready, width: 80 },
    { key: 'restarts', title: 'Restarts', render: restarts, sortValue: restarts, width: 90 },
    { key: 'node', title: 'Node', render: (o) => dash(o.spec?.nodeName) },
    { key: 'ip', title: 'IP', render: (o) => dash(o.status?.podIP), width: 130 },
  ],
  overview: [
    { label: 'Node', render: (o) => dash(o.spec?.nodeName) },
    { label: 'Pod IP', render: (o) => dash(o.status?.podIP) },
    { label: 'QoS class', render: (o) => dash(o.status?.qosClass) },
    { label: 'Service account', render: (o) => dash(o.spec?.serviceAccountName) },
    { label: 'Restarts', render: restarts },
    {
      label: 'Containers',
      render: (o) =>
        h(
          'ul',
          { class: 'capy-plain-list' },
          statuses(o).map((c) =>
            h('li', { key: c.name }, [
              h('strong', c.name),
              ` ${c.image} · ${c.ready ? 'ready' : 'not ready'} · ${c.restartCount} restarts`,
            ]),
          ),
        ),
    },
  ],
}
