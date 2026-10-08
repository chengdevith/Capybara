<script setup lang="ts">
import { pluginAction, PluginRequestError, useNavigate, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NModal, NSpace, NSpin } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { PLUGIN } from './tekton'

// "Start last run": the Pipeline's newest run again (same params,
// workspaces and timeouts, as Rerun does), checked like any run.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
const ns = props.object.metadata.namespace ?? ''
const busy = ref(true)
const error = ref<string | null>(null)
const lastRun = ref<string | null>(null)

onMounted(async () => {
  try {
    const sel = encodeURIComponent(`tekton.dev/pipeline=${props.object.metadata.name}`)
    const res = await fetch(`/api/clusters/${encodeURIComponent(props.cluster)}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(ns)}/pipelineruns?labelSelector=${sel}`, { headers: { Accept: 'application/json' } })
    const list = res.ok ? ((await res.json()) as { items: KubeObject[] }) : { items: [] }
    const newest = [...list.items].sort((a, b) => Date.parse(b.metadata.creationTimestamp) - Date.parse(a.metadata.creationTimestamp))[0]
    if (!newest) {
      error.value = `${props.object.metadata.name} has no runs yet: create one first.`
      return
    }
    lastRun.value = newest.metadata.name
    const created = await pluginAction(props.cluster, PLUGIN, 'rerun', { namespace: ns, name: newest.metadata.name, uid: newest.metadata.uid })
    emit('close')
    await navigate({ name: 'tekton.pipelineruns.detail', params: { cluster: props.cluster, namespace: ns, name: created } })
  } catch (e) {
    error.value = e instanceof PluginRequestError && e.problems.length ? e.problems.map((p) => p.message).join('; ') : e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
})

async function createRun() {
  emit('close')
  await navigate({ name: 'tekton.pipelineruns.new', params: { cluster: props.cluster }, query: { ns, pipeline: props.object.metadata.name, ...(lastRun.value ? { from: lastRun.value } : {}) } })
}
</script>

<template>
  <NModal
    :show="true"
    preset="card"
    :title="`Start the last run of ${object.metadata.name}`"
    style="max-width: 520px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NSpin v-if="busy" />
    <NAlert
      v-else-if="error"
      type="error"
      data-test="start-last-error"
    >
      {{ error }}
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">
          Close
        </NButton>
        <NButton
          v-if="error"
          type="primary"
          data-test="start-last-create"
          @click="createRun"
        >
          Create PipelineRun
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
