<script setup lang="ts">
import { NAlert, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { updateCluster, type Cluster, type Environment } from '@/api/clusters'
import { useClustersStore } from '@/stores/clusters'

const props = defineProps<{ cluster: Cluster }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const clusters = useClustersStore()

const displayName = ref(props.cluster.displayName)
const environment = ref(props.cluster.environment as Environment)
const busy = ref(false)
const error = ref<string | null>(null)

async function submit() {
  busy.value = true
  try {
    await updateCluster(props.cluster.id, { displayName: displayName.value, environment: environment.value })
    await clusters.load()
    message.success('Cluster updated')
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
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
    :title="`Edit ${cluster.id}`"
    positive-text="Save"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <NForm label-placement="left">
      <NFormItem label="Display name">
        <NInput v-model:value="displayName" />
      </NFormItem>
      <NFormItem label="Environment">
        <NRadioGroup v-model:value="environment">
          <NRadioButton value="dev">
            dev
          </NRadioButton>
          <NRadioButton value="uat">
            uat
          </NRadioButton>
          <NRadioButton value="prod">
            prod
          </NRadioButton>
        </NRadioGroup>
      </NFormItem>
    </NForm>
    <NAlert
      v-if="error"
      type="error"
    >
      {{ error }}
    </NAlert>
  </NModal>
</template>
