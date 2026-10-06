<script setup lang="ts">
import { NAlert, NButton, NModal, NSpace, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { setInstaller, type Cluster, type KubeconfigSummary, type TestResult } from '@/api/clusters'
import { useClustersStore } from '@/stores/clusters'
import KubeconfigInput from './KubeconfigInput.vue'

// The installer credential: used only by the plugin controller to install
// plugins (never by the console's proxy). Stored write-only.
const props = defineProps<{ cluster: Cluster }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()
const clusters = useClustersStore()
const state = ref<{ kubeconfig: string; summary: KubeconfigSummary | null; test: TestResult | null }>({ kubeconfig: '', summary: null, test: null })
const busy = ref(false)
const error = ref<string | null>(null)
const canSave = computed(() => !!state.value.summary && !!state.value.test?.ok)

async function save() {
  busy.value = true
  error.value = null
  try {
    await setInstaller(props.cluster.id, state.value.kubeconfig)
    await clusters.load()
    message.success('Installer credential stored')
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
    :title="`Installer credential for ${cluster.id}`"
    :style="{ width: '760px' }"
    :mask-closable="false"
    @close="emit('close')"
  >
    <NAlert
      type="info"
      :show-icon="false"
      class="note"
    >
      Plugins that deploy charts (CRDs, ClusterRoles, webhooks) need more than Capybara's least-privilege account. This
      separate credential is used only by the plugin controller, never by the console. Create one from a plugin's
      declared permissions with <code>hack/capybara-sa.sh {{ cluster.id }} --installer &lt;plugin&gt;</code> (add
      <code>--connect --set …</code> for a connect-only role).
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
          data-test="save-installer"
          @click="save"
        >
          Save
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
