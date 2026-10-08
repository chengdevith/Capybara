<script setup lang="ts">
import { pluginAction, PluginRequestError, useNavigate, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NModal, NSpace } from 'naive-ui'
import { ref } from 'vue'
import { api } from './tekton'

// Rerun: Capybara creates a new PipelineRun from this one's declared fields
// (pipeline, params, workspaces, service account, timeouts).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const { ResourceLink } = api().components
const navigate = useNavigate()
// Refused because the run used another ServiceAccount: offer a new run of
// its Pipeline (as the Project's pipeline account) instead.
const otherAccount = ref(false)
const pipeline = props.object.spec?.pipelineRef?.name as string | undefined
async function startNew() {
  await navigate({ name: 'tekton.pipelineruns.new', params: { cluster: props.cluster }, query: { ns: props.object.metadata.namespace ?? '', pipeline: pipeline!, from: props.object.metadata.name } })
  emit('close')
}

const busy = ref(false)
const error = ref<string | null>(null)
const created = ref<string | null>(null)

async function rerun() {
  busy.value = true
  error.value = null
  try {
    const m = props.object.metadata
    created.value = await pluginAction(props.cluster, 'tekton', 'rerun', { namespace: m.namespace, name: m.name, uid: m.uid })
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    if (e instanceof PluginRequestError) {
      otherAccount.value = e.problems.some((p) => p.path.endsWith('serviceAccountName'))
      if (e.problems.length) error.value = e.problems.map((p) => p.message).join('; ')
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NModal
    :show="true"
    preset="card"
    :title="`Rerun ${object.metadata.name}`"
    style="max-width: 520px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <div
      v-if="created"
      data-test="rerun-created"
    >
      Started
      <component
        :is="ResourceLink"
        :cluster="cluster"
        resource="tekton.pipelineruns"
        :namespace="object.metadata.namespace"
        :name="created"
      />.
    </div>
    <template v-else>
      <p>
        Starts a new PipelineRun with the same pipeline, parameters, workspaces and service account
        ({{ object.spec?.taskRunTemplate?.serviceAccountName ?? 'default' }}).
      </p>
      <NAlert
        v-if="error"
        type="error"
        data-test="rerun-error"
      >
        {{ error }}
        <div v-if="otherAccount && pipeline">
          <NButton
            size="small"
            class="start-new"
            data-test="rerun-start-new"
            @click="startNew"
          >
            Start a new run as pipeline
          </NButton>
        </div>
      </NAlert>
    </template>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">
          {{ created ? 'Close' : 'Cancel' }}
        </NButton>
        <NButton
          v-if="!created"
          type="primary"
          :loading="busy"
          data-test="confirm"
          @click="rerun"
        >
          Rerun
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.start-new {
  margin-top: 8px;
}
</style>
