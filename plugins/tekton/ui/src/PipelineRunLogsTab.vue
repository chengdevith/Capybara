<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert, NEmpty } from 'naive-ui'
import { computed, onScopeDispose, ref, watch } from 'vue'
import ImagePullBanner from './ImagePullBanner.vue'
import TaskRunLogs from './TaskRunLogs.vue'
import { api, duration, runStatus, startedAt, TASK_RUNS } from './tekton'

// A PipelineRun's logs, OpenShift style: its tasks on the left (in the
// order they started, with their status), the chosen task's step logs on
// the right. Follows the running (or last) task until one is chosen.
const props = defineProps<{ cluster: string; object: KubeObject }>()

const { items, loading, error } = api().composables.useLiveList(
  () => ({
    cluster: props.cluster, type: TASK_RUNS, namespace: props.object.metadata.namespace,
    labelSelector: `tekton.dev/pipelineRun=${props.object.metadata.name}`,
  }),
  { sort: (a, b) => startedAt(a) - startedAt(b) },
)
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onScopeDispose(() => clearInterval(timer))

const selected = ref<string | null>(null)
const picked = ref(false)
watch(items, (list) => {
  if (picked.value && list.some((t) => t.metadata.uid === selected.value)) return
  const running = list.find((t) => runStatus(t).running)
  selected.value = (running ?? list.at(-1))?.metadata.uid ?? null
})
const selectedRun = computed(() => items.value.find((t) => t.metadata.uid === selected.value) ?? null)
const task = (t: KubeObject) => t.metadata.labels?.['tekton.dev/pipelineTask'] ?? t.metadata.name
const colors: Record<string, string> = { success: '#18a058', error: '#d03050', warning: '#f0a020', info: '#2080f0', default: '#888' }
function choose(t: KubeObject) {
  selected.value = t.metadata.uid
  picked.value = true
}
</script>

<template>
  <div data-test="tekton-run-logs">
    <ImagePullBanner
      :cluster="cluster"
      :task-runs="items"
      :pipeline-run="object"
    />
    <NAlert
      v-if="error"
      type="warning"
      class="gap"
    >
      {{ error }}
    </NAlert>
    <NEmpty
      v-if="!loading && !items.length"
      description="No tasks have started yet."
    />
    <div
      v-else
      class="split"
    >
      <ul
        class="tasks"
        role="listbox"
      >
        <li
          v-for="t in items"
          :key="t.metadata.uid"
          :class="{ chosen: t.metadata.uid === selected }"
          role="option"
          :aria-selected="t.metadata.uid === selected"
          :data-test="`task-${task(t)}`"
          @click="choose(t)"
        >
          <span
            class="dot"
            :style="{ background: colors[runStatus(t).tone] }"
          />
          <span class="name">{{ task(t) }}</span>
          <span
            class="state"
            data-test="run-status"
          >{{ runStatus(t).text }}</span>
          <span class="time">{{ duration(t, now) }}</span>
        </li>
      </ul>
      <div class="logs">
        <TaskRunLogs
          v-if="selectedRun"
          :cluster="cluster"
          :task-run="selectedRun"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
.split {
  display: grid;
  grid-template-columns: minmax(180px, 260px) 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }
}
.tasks {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--capy-border);
  border-radius: 6px;
}
.tasks li {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--capy-border);
}
.tasks li:last-child {
  border-bottom: none;
}
.tasks li.chosen {
  background: rgba(195, 155, 110, 0.15);
}
.dot {
  grid-column: 1;
  grid-row: 1 / 3;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
}
.name {
  grid-column: 2;
  grid-row: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  grid-column: 3;
  grid-row: 1;
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
}
.state {
  grid-column: 2 / 4;
  grid-row: 2;
  font-size: 12px;
  opacity: 0.75;
}
.logs {
  min-width: 0;
}
</style>
