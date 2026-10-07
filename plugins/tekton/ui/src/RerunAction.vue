<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NModal, NSpace } from 'naive-ui'
import { ref } from 'vue'
import { api } from './tekton'

// Rerun: Capybara creates a new PipelineRun from this one's declared fields
// (pipeline, params, workspaces, service account, timeouts).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const { ResourceLink } = api().components

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
      >
        {{ error }}
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
