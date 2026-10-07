<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NModal, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { runStatus } from './tekton'

// Cancel a running PipelineRun (spec.status: Cancelled); Tekton stops its
// TaskRuns. Capybara refuses it once the run has finished.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const busy = ref(false)
const running = computed(() => runStatus(props.object).running)

async function cancel() {
  if (!running.value) {
    emit('close')
    return true
  }
  busy.value = true
  try {
    const m = props.object.metadata
    await pluginAction(props.cluster, 'tekton', 'cancel', { namespace: m.namespace, name: m.name, uid: m.uid })
    message.success(`Cancelling ${m.name}`)
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
    :title="running ? `Cancel ${object.metadata.name}?` : `${object.metadata.name} has finished`"
    :positive-text="running ? 'Cancel run' : 'Close'"
    :negative-text="running ? 'Keep running' : undefined"
    :loading="busy"
    :positive-button-props="{ 'data-test': 'confirm' } as never"
    @positive-click="cancel"
    @negative-click="emit('close')"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <template v-if="running">
      Running tasks are stopped and the run ends as Cancelled.
    </template>
    <template v-else>
      It is {{ runStatus(object).text }}; there is nothing to cancel.
    </template>
  </NModal>
</template>
