<script setup lang="ts">
import { useNavigate, type KubeObject } from '@capybara/sdk'
import { NButton, NDataTable, NSpace, type DataTableColumns } from 'naive-ui'
import { computed, h, onScopeDispose, ref } from 'vue'
import { api, byNewest, duration, isProjectNamespace, PIPELINE_RUNS, statusTag } from './tekton'

// A Pipeline's runs, newest first (OpenShift's PipelineRuns tab).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const { ResourceLink } = api().components
const navigate = useNavigate()
const { items, loading } = api().composables.useLiveList(
  () => ({
    cluster: props.cluster, type: PIPELINE_RUNS, namespace: props.object.metadata.namespace,
    labelSelector: `tekton.dev/pipeline=${props.object.metadata.name}`,
  }),
  { sort: byNewest },
)
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onScopeDispose(() => clearInterval(timer))
const canStart = computed(() => isProjectNamespace(props.object.metadata.namespace, props.cluster))

const columns = computed<DataTableColumns<KubeObject>>(() => [
  { key: 'name', title: 'PipelineRun', render: (r) => h(ResourceLink, { resource: 'tekton.pipelineruns', namespace: r.metadata.namespace, name: r.metadata.name }) },
  { key: 'status', title: 'Status', width: 160, render: statusTag },
  { key: 'started', title: 'Started', width: 190, render: (r) => (r.status?.startTime ? new Date(r.status.startTime).toLocaleString() : '—') },
  { key: 'duration', title: 'Duration', width: 100, render: (r) => duration(r, now.value) },
])
const create = () => navigate({
  name: 'tekton.pipelineruns.new', params: { cluster: props.cluster },
  query: { ns: props.object.metadata.namespace ?? '', pipeline: props.object.metadata.name },
})
</script>

<template>
  <div data-test="tekton-pipeline-runs">
    <NSpace
      v-if="canStart"
      justify="end"
      class="gap"
    >
      <NButton
        size="small"
        type="primary"
        data-test="pipeline-create-run"
        @click="create"
      >
        Create PipelineRun
      </NButton>
    </NSpace>
    <NDataTable
      size="small"
      :columns="columns"
      :data="items"
      :loading="loading"
      :row-key="(r: KubeObject) => r.metadata.uid"
    />
  </div>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
</style>
