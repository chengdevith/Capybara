<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NDataTable, type DataTableColumns } from 'naive-ui'
import { computed, h, onScopeDispose, ref } from 'vue'
import { api, duration, startedAt, statusTag, TASK_RUNS } from './tekton'

// A PipelineRun's TaskRuns, live (OpenShift's TaskRuns tab).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const { ResourceLink } = api().components
const { items, loading } = api().composables.useLiveList(
  () => ({
    cluster: props.cluster, type: TASK_RUNS, namespace: props.object.metadata.namespace,
    labelSelector: `tekton.dev/pipelineRun=${props.object.metadata.name}`,
  }),
  { sort: (a, b) => startedAt(a) - startedAt(b) },
)
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onScopeDispose(() => clearInterval(timer))

const columns = computed<DataTableColumns<KubeObject>>(() => [
  {
    key: 'name', title: 'TaskRun', ellipsis: { tooltip: true },
    render: (t) => h(ResourceLink, { resource: 'tekton.taskruns', namespace: t.metadata.namespace, name: t.metadata.name }),
  },
  { key: 'task', title: 'Task', render: (t) => t.metadata.labels?.['tekton.dev/pipelineTask'] ?? '—' },
  { key: 'status', title: 'Status', width: 160, render: statusTag },
  { key: 'started', title: 'Started', width: 190, render: (t) => (t.status?.startTime ? new Date(t.status.startTime).toLocaleString() : '—') },
  { key: 'duration', title: 'Duration', width: 100, render: (t) => duration(t, now.value) },
])
</script>

<template>
  <NDataTable
    size="small"
    :columns="columns"
    :data="items"
    :loading="loading"
    :row-key="(t: KubeObject) => t.metadata.uid"
    data-test="tekton-taskruns"
  />
</template>
