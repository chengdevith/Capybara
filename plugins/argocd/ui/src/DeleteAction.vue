<script setup lang="ts">
import { pluginObjects, useNavigate, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NInput, NModal, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { computed, ref } from 'vue'
import { CASCADE_FINALIZER, PLUGIN } from './argocd'

// Delete an Application, choosing what happens to what it deployed:
// removed with it (Argo CD's cascade finalizer), or left running. Type the
// name to confirm. Capybara audits it as argocd.delete.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
const hasCascade = (props.object.metadata.finalizers ?? []).some((f: string) => f.startsWith(CASCADE_FINALIZER))
const mode = ref<'cascade' | 'app-only'>(hasCascade ? 'cascade' : 'app-only')
const typed = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const count = computed(() => ((props.object.status?.resources as unknown[] | undefined) ?? []).length)

async function remove() {
  busy.value = true
  error.value = null
  const m = props.object.metadata
  try {
    await pluginObjects.remove(props.cluster, PLUGIN, 'applications', m.namespace ?? '', m.name, m.uid, mode.value)
    emit('close')
    await navigate({ name: 'argocd.applications.list', params: { cluster: props.cluster }, query: { ns: m.namespace ?? '' } })
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
    :title="`Delete Application ${object.metadata.name}?`"
    style="max-width: 560px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NRadioGroup
      v-model:value="mode"
      class="gap"
    >
      <NSpace vertical>
        <NRadio
          value="cascade"
          data-test="delete-mode-cascade"
        >
          Delete the Application and the {{ count || '' }} resource{{ count === 1 ? '' : 's' }} it deployed
        </NRadio>
        <NRadio
          value="app-only"
          data-test="delete-mode-app-only"
        >
          Delete the Application only: what it deployed keeps running, no longer managed
        </NRadio>
      </NSpace>
    </NRadioGroup>
    <p>Type <strong>{{ object.metadata.name }}</strong> to delete it.</p>
    <NInput
      v-model:value="typed"
      data-test="delete-confirm-name"
    />
    <NAlert
      v-if="error"
      type="error"
      class="gap-top"
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
          :disabled="typed !== object.metadata.name"
          :loading="busy"
          data-test="delete-confirm"
          @click="remove"
        >
          Delete
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
.gap-top {
  margin-top: 12px;
}
</style>
