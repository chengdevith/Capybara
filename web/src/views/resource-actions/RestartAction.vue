<script setup lang="ts">
import { NModal, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { restartObject, targetOf } from '@/api/actions'
import type { DetailTabProps } from '@/components/resource/types'

const props = defineProps<DetailTabProps>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const busy = ref(false)

async function submit() {
  busy.value = true
  try {
    await restartObject(props.cluster, targetOf(props.resource.type, props.object))
    message.success(`Restarting ${props.object.metadata.name}`)
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
    type="warning"
    :title="`Restart ${object.metadata.name}?`"
    positive-text="Restart"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    All pods are replaced with a rolling update, the same as <code>kubectl rollout restart</code>.
  </NModal>
</template>
