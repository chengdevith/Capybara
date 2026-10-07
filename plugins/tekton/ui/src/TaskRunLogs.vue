<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert } from 'naive-ui'
import { computed } from 'vue'
import { api } from './tekton'

// Step logs of one TaskRun: its pod's step containers (step-<name>),
// streamed by the console's log viewer.
const props = defineProps<{ cluster: string; taskRun: KubeObject }>()
const { LogViewer } = api().components

const pod = computed<string>(() => props.taskRun.status?.podName ?? '')
interface StepState {
  name: string
  container: string
  running?: object
  terminated?: object
}
const stepStates = computed(() => (props.taskRun.status?.steps as StepState[] | undefined) ?? [])
const steps = computed(() => stepStates.value.map((s) => ({ label: s.name, value: s.container })))
// A step's logs exist only once it has started: reconnect whenever a step
// starts or ends (the stream of a waiting container ends with an error).
const phase = computed(() => stepStates.value.map((s) => (s.terminated ? 't' : s.running ? 'r' : 'w')).join(''))
</script>

<template>
  <NAlert
    v-if="!pod || !steps.length"
    type="info"
    :bordered="false"
  >
    The TaskRun has no pod yet: logs show once its steps start.
  </NAlert>
  <component
    :is="LogViewer"
    v-else
    :key="`${pod}/${phase}`"
    :cluster="cluster"
    :namespace="taskRun.metadata.namespace ?? ''"
    :pod="pod"
    :containers="steps"
  />
</template>
