<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert, NEmpty } from 'naive-ui'
import { computed, ref } from 'vue'
import { layout, type PipelineTaskSpec } from './graph'
import TaskRunLogs from './TaskRunLogs.vue'
import { api, runStatus, TASK_RUNS } from './tekton'

// The order a Pipeline's tasks run in (runAfter and result references;
// finally tasks last). On a PipelineRun each task shows its TaskRun's
// status, and choosing one shows its step logs.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const isRun = computed(() => props.object.kind === 'PipelineRun')

const spec = computed<{ tasks?: PipelineTaskSpec[]; finally?: PipelineTaskSpec[] }>(() =>
  isRun.value ? (props.object.status?.pipelineSpec ?? props.object.spec?.pipelineSpec ?? {}) : (props.object.spec ?? {}),
)
const graph = computed(() => layout(spec.value.tasks ?? [], spec.value.finally ?? []))

// A run's TaskRuns by pipeline task name.
const taskRuns = isRun.value
  ? api().composables.useLiveList(() => ({
      cluster: props.cluster, type: TASK_RUNS, namespace: props.object.metadata.namespace,
      labelSelector: `tekton.dev/pipelineRun=${props.object.metadata.name}`,
    })).items
  : ref<KubeObject[]>([])
const byTask = computed(() => new Map(taskRuns.value.map((t) => [t.metadata.labels?.['tekton.dev/pipelineTask'] ?? '', t])))
const selected = ref<string | null>(null)
const selectedRun = computed(() => (selected.value ? (byTask.value.get(selected.value) ?? null) : null))

const W = 170
const H = 44
const GX = 60
const GY = 20
const x = (c: number) => 10 + c * (W + GX)
const y = (r: number) => 10 + r * (H + GY)
const pos = computed(() => new Map(graph.value.nodes.map((n) => [n.name, n])))
const width = computed(() => x(graph.value.columns) + 10)
const height = computed(() => y(graph.value.rows) + 10)

const colors: Record<string, string> = { success: '#18a058', error: '#d03050', warning: '#f0a020', info: '#2080f0', default: '#888' }
function nodeState(name: string): { label: string; color: string } {
  if (!isRun.value) return { label: '', color: '#c39b6e' }
  const tr = byTask.value.get(name)
  if (!tr) return { label: 'Not started', color: colors.default! }
  const s = runStatus(tr)
  return { label: s.text, color: colors[s.tone] ?? colors.default! }
}
function edgePath(from: string, to: string): string {
  const a = pos.value.get(from)
  const b = pos.value.get(to)
  if (!a || !b) return ''
  const x1 = x(a.column) + W
  const y1 = y(a.row) + H / 2
  const x2 = x(b.column)
  const y2 = y(b.row) + H / 2
  const mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}
</script>

<template>
  <div data-test="tekton-graph">
    <NEmpty
      v-if="!graph.nodes.length"
      description="No tasks."
    />
    <div
      v-else
      class="scroll"
    >
      <svg
        :width="width"
        :height="height"
        role="img"
        :aria-label="`Task graph of ${object.metadata.name}`"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              class="arrow"
            />
          </marker>
        </defs>
        <path
          v-for="e in graph.edges"
          :key="e.from + '>' + e.to"
          :d="edgePath(e.from, e.to)"
          class="edge"
          marker-end="url(#arrow)"
        />
        <g
          v-for="n in graph.nodes"
          :key="n.name"
          :transform="`translate(${x(n.column)},${y(n.row)})`"
          :class="['node', { clickable: isRun, chosen: selected === n.name }]"
          :data-test="`graph-node-${n.name}`"
          :data-state="nodeState(n.name).label"
          @click="isRun && (selected = n.name)"
        >
          <rect
            :width="W"
            :height="H"
            rx="8"
            :stroke="nodeState(n.name).color"
            :stroke-dasharray="n.finally ? '4 3' : undefined"
          />
          <circle
            cx="14"
            :cy="H / 2"
            r="5"
            :fill="nodeState(n.name).color"
          />
          <text
            x="26"
            :y="isRun ? 18 : H / 2 + 4"
            class="name"
          >{{ n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name }}</text>
          <text
            v-if="isRun"
            x="26"
            y="34"
            class="state"
          >{{ nodeState(n.name).label }}</text>
        </g>
      </svg>
    </div>
    <template v-if="isRun && selected">
      <h4>Logs: {{ selected }}</h4>
      <TaskRunLogs
        v-if="selectedRun"
        :cluster="cluster"
        :task-run="selectedRun"
      />
      <NAlert
        v-else
        type="info"
        :bordered="false"
      >
        This task has not started.
      </NAlert>
    </template>
  </div>
</template>

<style scoped>
.scroll {
  overflow-x: auto;
  padding: 4px 0 12px;
}
.node rect {
  fill: var(--n-color, transparent);
  stroke-width: 2;
}
.node.clickable {
  cursor: pointer;
}
.node.chosen rect {
  stroke-width: 3;
}
.name {
  font-size: 13px;
  font-weight: 600;
  fill: currentColor;
}
.state {
  font-size: 11px;
  fill: currentColor;
  opacity: 0.7;
}
.edge {
  fill: none;
  stroke: currentColor;
  opacity: 0.45;
  stroke-width: 1.5;
}
.arrow {
  fill: currentColor;
  opacity: 0.6;
}
h4 {
  margin: 8px 0;
}
</style>
