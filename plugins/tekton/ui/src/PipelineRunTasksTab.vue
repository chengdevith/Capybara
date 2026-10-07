<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert, NDataTable, NEmpty, type DataTableColumns } from 'naive-ui'
import { computed, h, onScopeDispose, ref, watch } from 'vue'
import TaskRunLogs from './TaskRunLogs.vue'
import { api, duration, runStatus, startedAt, statusTag, TASK_RUNS } from './tekton'

// A PipelineRun's TaskRuns, live; choosing one shows its step logs.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const { ResourceLink } = api().components

const { items, loading, error } = api().composables.useLiveList(
  () => ({
    cluster: props.cluster,
    type: TASK_RUNS,
    namespace: props.object.metadata.namespace,
    labelSelector: `tekton.dev/pipelineRun=${props.object.metadata.name}`,
  }),
  { sort: (a, b) => startedAt(a) - startedAt(b) },
)

const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onScopeDispose(() => clearInterval(timer))

const selected = ref<string | null>(null)
// Follow the running (or else the last) task until the user picks one.
const picked = ref(false)
watch(items, (list) => {
  if (picked.value && list.some((t) => t.metadata.uid === selected.value)) return
  const running = list.find((t) => runStatus(t).running)
  selected.value = (running ?? list.at(-1))?.metadata.uid ?? null
})
const selectedRun = computed(() => items.value.find((t) => t.metadata.uid === selected.value) ?? null)

const task = (t: KubeObject) => t.metadata.labels?.['tekton.dev/pipelineTask'] ?? t.metadata.name
const columns = computed<DataTableColumns<KubeObject>>(() => [
  { key: 'task', title: 'Task', render: (t) => task(t) },
  { key: 'status', title: 'Status', width: 140, render: statusTag },
  { key: 'duration', title: 'Duration', width: 100, render: (t) => duration(t, now.value) },
  {
    key: 'name',
    title: 'TaskRun',
    ellipsis: { tooltip: true },
    render: (t) => h(ResourceLink, { resource: 'tekton.taskruns', namespace: t.metadata.namespace, name: t.metadata.name }),
  },
])
const rowProps = (t: KubeObject) => ({
  style: 'cursor: pointer',
  'data-test': `task-${task(t)}`,
  onClick: () => {
    selected.value = t.metadata.uid
    picked.value = true
  },
})
const rowClass = (t: KubeObject) => (t.metadata.uid === selected.value ? 'selected' : '')
</script>

<template>
  <div data-test="tekton-tasks">
    <NAlert
      v-if="error"
      type="warning"
      class="gap"
    >
      {{ error }}
    </NAlert>
    <NDataTable
      size="small"
      :columns="columns"
      :data="items"
      :loading="loading"
      :row-key="(t: KubeObject) => t.metadata.uid"
      :row-props="rowProps"
      :row-class-name="rowClass"
      class="gap"
    />
    <template v-if="selectedRun">
      <h4>Logs: {{ task(selectedRun) }}</h4>
      <TaskRunLogs
        :cluster="cluster"
        :task-run="selectedRun"
      />
    </template>
    <NEmpty
      v-else-if="!loading"
      description="No TaskRuns yet."
    />
  </div>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
h4 {
  margin: 8px 0;
}
:deep(.selected td) {
  background: var(--n-td-color-hover);
}
</style>
