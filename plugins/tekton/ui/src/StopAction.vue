<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NModal, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { runStatus } from './tekton'

// Stop a running PipelineRun gracefully (spec.status: StoppedRunFinally): no
// new tasks start; running tasks and finally tasks finish. Cancel stops
// everything at once. Capybara refuses it once the run has finished.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const busy = ref(false)
const running = computed(() => runStatus(props.object).running)

async function stop() {
  if (!running.value) {
    emit('close')
    return true
  }
  busy.value = true
  try {
    const m = props.object.metadata
    await pluginAction(props.cluster, 'tekton', 'stop', { namespace: m.namespace, name: m.name, uid: m.uid })
    message.success(`Stopping ${m.name}`)
    emit('close')
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
  return false
}
</script>

<template>
  <NModal
    :show="true"
    preset="dialog"
    :type="running ? 'warning' : 'info'"
    :title="running ? `Stop ${object.metadata.name}?` : `${object.metadata.name} has finished`"
    :positive-text="running ? 'Stop run' : 'Close'"
    :negative-text="running ? 'Keep running' : undefined"
    :loading="busy"
    :positive-button-props="{ 'data-test': 'confirm' } as never"
    @positive-click="stop"
    @negative-click="emit('close')"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <template v-if="running">
      No new tasks start; tasks already running and the finally tasks finish. To stop everything at once, use Cancel run.
    </template>
    <template v-else>
      It is {{ runStatus(object).text }}; there is nothing to stop.
    </template>
  </NModal>
</template>
