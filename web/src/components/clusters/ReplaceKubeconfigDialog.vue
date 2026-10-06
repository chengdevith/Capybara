<script setup lang="ts">
import { NAlert, NButton, NModal, NSpace, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { replaceKubeconfig, type Cluster, type KubeconfigSummary, type TestResult } from '@/api/clusters'
import { useClustersStore } from '@/stores/clusters'
import KubeconfigInput from './KubeconfigInput.vue'

// Credential rotation. Open watches, logs and terminals for this cluster
// close and restart with the new credentials.
const props = defineProps<{ cluster: Cluster }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const clusters = useClustersStore()

const state = ref<{ kubeconfig: string; summary: KubeconfigSummary | null; test: TestResult | null }>({
  kubeconfig: '',
  summary: null,
  test: null,
})
const busy = ref(false)
const error = ref<string | null>(null)
const canSave = computed(() => !!state.value.summary && !!state.value.test?.ok)

async function save() {
  busy.value = true
  error.value = null
  try {
    await replaceKubeconfig(props.cluster.id, state.value.kubeconfig)
    await clusters.load()
    message.success('Credentials replaced')
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
    :title="`Replace kubeconfig for ${cluster.id}`"
    :style="{ width: '760px' }"
    :mask-closable="false"
    @close="emit('close')"
  >
    <NAlert
      type="info"
      :show-icon="false"
      class="note"
    >
      Open live views, logs and terminals on this cluster restart with the new credentials. A terminal session ends.
    </NAlert>
    <KubeconfigInput @change="(s) => (state = s)" />
    <NAlert
      v-if="error"
      type="error"
      class="note"
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
          :disabled="!canSave"
          :loading="busy"
          data-test="save-kubeconfig"
          @click="save"
        >
          Replace
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.note {
  margin-bottom: 12px;
}
</style>
