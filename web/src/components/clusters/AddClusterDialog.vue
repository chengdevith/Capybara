<script setup lang="ts">
import { NAlert, NButton, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup, NSpace, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { registerCluster, type Environment, type KubeconfigSummary, type TestResult } from '@/api/clusters'
import { useClustersStore } from '@/stores/clusters'
import KubeconfigInput from './KubeconfigInput.vue'

// Add a cluster: kubeconfig → Parse → Test connection → name it → Save.
const emit = defineEmits<{ close: []; created: [id: string] }>()
const message = useMessage()
const clusters = useClustersStore()

const kubeconfig = ref('')
const summary = ref<KubeconfigSummary | null>(null)
const test = ref<TestResult | null>(null)
const id = ref('')
const displayName = ref('')
const environment = ref<Environment>('dev')
const busy = ref(false)
const error = ref<string | null>(null)
let idTouched = false
const touchId = () => (idTouched = true)

function changed(s: { kubeconfig: string; summary: KubeconfigSummary | null; test: TestResult | null }) {
  kubeconfig.value = s.kubeconfig
  summary.value = s.summary
  test.value = s.test
  // Suggest an id from the context name (k3d-capybara-dev-2 → dev-2-ish).
  if (s.summary && !idTouched) id.value = suggestId(s.summary.context)
}

function suggestId(context: string): string {
  return context
    .toLowerCase()
    .replace(/^k3d-/, '')
    .replace(/^capybara-/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
}

const idValid = computed(() => /^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/.test(id.value))
const taken = computed(() => clusters.byId(id.value) !== undefined)
const canSave = computed(() => !!summary.value && !!test.value && idValid.value && !taken.value)

async function save() {
  if (!canSave.value) return
  busy.value = true
  error.value = null
  try {
    await registerCluster({ id: id.value, displayName: displayName.value || undefined, environment: environment.value, kubeconfig: kubeconfig.value })
    await clusters.load()
    message.success(`Cluster ${id.value} added`)
    emit('created', id.value)
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
    title="Add cluster"
    class="add-cluster"
    :style="{ width: '760px' }"
    :mask-closable="false"
    @close="emit('close')"
  >
    <KubeconfigInput @change="changed" />

    <NForm
      v-if="summary"
      label-placement="left"
      label-width="120"
      class="details"
    >
      <NFormItem
        label="ID"
        :validation-status="idValid && !taken ? undefined : 'error'"
        :feedback="taken ? 'a cluster with this id exists' : idValid ? 'used in URLs: /c/' + id : 'lowercase letters, digits and -, max 63'"
      >
        <NInput
          v-model:value="id"
          data-test="cluster-id"
          @update:value="touchId"
        />
      </NFormItem>
      <NFormItem label="Display name">
        <NInput
          v-model:value="displayName"
          :placeholder="id"
          data-test="cluster-display-name"
        />
      </NFormItem>
      <NFormItem label="Environment">
        <NRadioGroup
          v-model:value="environment"
          data-test="cluster-environment"
        >
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

    <template #footer>
      <NSpace justify="end">
        <span
          v-if="summary && !test"
          class="hint"
        >Test the connection before saving.</span>
        <NButton @click="emit('close')">
          Cancel
        </NButton>
        <NButton
          type="primary"
          :disabled="!canSave"
          :loading="busy"
          data-test="save-cluster"
          @click="save"
        >
          {{ test && !test.ok ? 'Save anyway' : 'Save' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.details {
  margin-top: 16px;
}
.hint {
  opacity: 0.7;
  align-self: center;
}
</style>
