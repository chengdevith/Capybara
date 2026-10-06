<script setup lang="ts">
import { NAlert, NFormItem, NInputNumber, NModal, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { scaleObject, targetOf } from '@/api/actions'
import type { DetailTabProps } from '@/components/resource/types'

const props = defineProps<DetailTabProps>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()

const current: number = props.object.spec?.replicas ?? 1
const replicas = ref<number | null>(current)
const busy = ref(false)

async function submit() {
  if (replicas.value === null) return false
  busy.value = true
  try {
    await scaleObject(props.cluster, targetOf(props.resource.type, props.object), replicas.value)
    message.success(`${props.object.metadata.name} scaled to ${replicas.value}`)
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
    :title="`Scale ${object.metadata.name}`"
    positive-text="Scale"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ disabled: replicas === null || replicas === current, 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NFormItem
      label="Replicas"
      :show-feedback="false"
    >
      <NInputNumber
        v-model:value="replicas"
        :min="0"
        :max="10000"
        data-test="replicas"
      />
    </NFormItem>
    <p class="hint">
      Currently {{ current }}.
    </p>
    <NAlert
      v-if="replicas === 0"
      type="warning"
    >
      Scaling to 0 stops every pod of this {{ resource.singular }}.
    </NAlert>
  </NModal>
</template>

<style scoped>
.hint {
  color: var(--capy-text-muted);
  margin: 4px 0 8px;
}
</style>
