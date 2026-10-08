<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NCheckbox, NInput, NModal, NSpace } from 'naive-ui'
import { computed, ref } from 'vue'
import { PLUGIN } from './argocd'

// Sync now: to the target revision, or another one. Prune also deletes
// resources no longer in Git, so it asks for the Application's name.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const revision = ref('')
const prune = ref(false)
const typed = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const running = computed(() => !!(props.object as { operation?: unknown }).operation || props.object.status?.operationState?.phase === 'Running')
const ready = computed(() => !running.value && (!prune.value || typed.value === props.object.metadata.name))

async function sync() {
  busy.value = true
  error.value = null
  const m = props.object.metadata
  try {
    await pluginAction(props.cluster, PLUGIN, 'sync', {
      namespace: m.namespace, name: m.name, uid: m.uid,
      inputs: { prune: prune.value, ...(revision.value.trim() ? { revision: revision.value.trim() } : {}) },
      ...(prune.value ? { confirmName: typed.value } : {}),
    })
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
    :title="`Sync ${object.metadata.name}`"
    style="max-width: 520px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NAlert
      v-if="running"
      type="info"
      class="gap"
    >
      A sync is already in progress.
    </NAlert>
    <p>Revision (empty: the target revision, {{ object.spec?.source?.targetRevision || 'HEAD' }})</p>
    <NInput
      v-model:value="revision"
      placeholder="branch, tag or commit"
      class="gap"
      data-test="sync-revision"
    />
    <NCheckbox
      v-model:checked="prune"
      data-test="sync-prune"
    >
      Prune: delete resources that are no longer in Git
    </NCheckbox>
    <template v-if="prune">
      <p>Type <strong>{{ object.metadata.name }}</strong> to prune.</p>
      <NInput
        v-model:value="typed"
        data-test="sync-confirm-name"
      />
    </template>
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
          type="primary"
          :disabled="!ready"
          :loading="busy"
          data-test="sync-confirm"
          @click="sync"
        >
          Sync
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
