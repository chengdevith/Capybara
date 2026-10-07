<script setup lang="ts">
import { NEmpty, NSpin } from 'naive-ui'
import { onScopeDispose, ref } from 'vue'
import { api, byNewest, duration, pipelineOf, PIPELINE_RUNS, statusTag } from './tekton'

// The latest PipelineRuns in a Project's namespace, live.
const props = defineProps<{ cluster: string; project: { spec: { namespace: string } } }>()
const { ResourceLink } = api().components
const { items, loading, error } = api().composables.useLiveList(
  () => ({ cluster: props.cluster, type: PIPELINE_RUNS, namespace: props.project.spec.namespace }),
  { sort: byNewest, max: 5 },
)
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <div data-test="tekton-project-card">
    <span v-if="error">{{ error }}</span>
    <NSpin
      v-else-if="loading"
      size="small"
    />
    <NEmpty
      v-else-if="!items.length"
      size="small"
      description="No pipeline runs in this Project yet."
    />
    <table v-else>
      <tr
        v-for="run in items"
        :key="run.metadata.uid"
      >
        <td>
          <component
            :is="ResourceLink"
            :cluster="cluster"
            resource="tekton.pipelineruns"
            :namespace="run.metadata.namespace"
            :name="run.metadata.name"
          />
        </td>
        <td class="muted">
          {{ pipelineOf(run) }}
        </td>
        <td><component :is="statusTag(run)" /></td>
        <td class="muted">
          {{ duration(run, now) }}
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
td {
  padding: 4px 8px 4px 0;
  white-space: nowrap;
}
td:first-child {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
}
</style>
