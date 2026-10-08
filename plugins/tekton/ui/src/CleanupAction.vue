<script setup lang="ts">
import { pluginObjects, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NInputNumber, NModal, NSpace, useMessage } from 'naive-ui'
import { onMounted, ref, watch } from 'vue'
import { PLUGIN } from './tekton'

// "Clean up runs": delete this Pipeline's finished runs, keeping the newest
// N (a preview first). Running ones always stay.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const keep = ref(10)
const preview = ref<string[] | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)
const ns = props.object.metadata.namespace ?? ''

async function load() {
  error.value = null
  try {
    preview.value = (await pluginObjects.cleanup(props.cluster, PLUGIN, 'pipelineruns', ns, { keep: keep.value, group: props.object.metadata.name, dryRun: true })).deleted
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
onMounted(load)
watch(keep, load)

async function run() {
  busy.value = true
  try {
    const { deleted } = await pluginObjects.cleanup(props.cluster, PLUGIN, 'pipelineruns', ns, { keep: keep.value, group: props.object.metadata.name })
    message.success(`Deleted ${deleted.length} finished run(s)`)
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NModal
    :show="true"
    preset="card"
    :title="`Clean up runs of ${object.metadata.name}`"
    style="max-width: 560px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NSpace align="center">
      Keep the newest
      <NInputNumber
        v-model:value="keep"
        :min="0"
        :max="1000"
        size="small"
        style="width: 110px"
        data-test="cleanup-keep"
      />
      finished runs. Running runs always stay.
    </NSpace>
    <p
      v-if="preview"
      data-test="cleanup-preview"
    >
      <template v-if="preview.length">
        {{ preview.length }} run(s) will be deleted: {{ preview.join(', ') }}
      </template>
      <template v-else>
        Nothing to delete.
      </template>
    </p>
    <NAlert
      v-if="error"
      type="error"
    >
      {{ error }}
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">
          Cancel
        </NButton>
        <NButton
          type="error"
          :disabled="!preview?.length"
          :loading="busy"
          data-test="cleanup-confirm"
          @click="run"
        >
          Delete {{ preview?.length ?? 0 }} run(s)
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
