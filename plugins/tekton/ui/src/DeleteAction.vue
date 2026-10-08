<script setup lang="ts">
import { pluginObjects, useNavigate, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NInput, NModal, NSpace } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { objectOf, PLUGIN } from './tekton'

// Delete a Task or Pipeline (type the name; a Task lists the Pipelines that
// use it) or a PipelineRun (a simple confirm). Capybara audits it as
// tekton.delete.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
const kind = computed(() => props.object.kind ?? '')
const isRun = computed(() => kind.value === 'PipelineRun')
const typed = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const usedBy = ref<string[]>([])

onMounted(async () => {
  if (kind.value !== 'Task') return
  const ns = props.object.metadata.namespace ?? ''
  const res = await fetch(`/api/clusters/${encodeURIComponent(props.cluster)}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(ns)}/pipelines`, { headers: { Accept: 'application/json' } })
  if (!res.ok) return
  const list = (await res.json()) as { items: { metadata: { name: string }; spec?: { tasks?: { taskRef?: { name?: string } }[]; finally?: { taskRef?: { name?: string } }[] } }[] }
  usedBy.value = list.items
    .filter((p) => [...(p.spec?.tasks ?? []), ...(p.spec?.finally ?? [])].some((t) => t.taskRef?.name === props.object.metadata.name))
    .map((p) => p.metadata.name)
})

const ready = computed(() => isRun.value || typed.value === props.object.metadata.name)

async function remove() {
  busy.value = true
  error.value = null
  const m = props.object.metadata
  try {
    await pluginObjects.remove(props.cluster, PLUGIN, objectOf[kind.value]!, m.namespace ?? '', m.name, m.uid)
    emit('close')
    await navigate({ name: `tekton.${objectOf[kind.value]}.list`, params: { cluster: props.cluster }, query: { ns: m.namespace ?? '' } })
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
    :title="`Delete ${kind} ${object.metadata.name}?`"
    style="max-width: 520px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <p v-if="isRun">
      The run, its TaskRuns and their pods are removed (with their logs).
    </p>
    <template v-else>
      <NAlert
        v-if="usedBy.length"
        type="warning"
        class="gap"
        data-test="delete-used-by"
      >
        Used by {{ usedBy.join(', ') }}: their next runs will fail until it exists again.
      </NAlert>
      <p>Type <strong>{{ object.metadata.name }}</strong> to delete it.</p>
      <NInput
        v-model:value="typed"
        data-test="delete-confirm-name"
      />
    </template>
    <NAlert
      v-if="error"
      type="error"
      class="gap"
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
          :disabled="!ready"
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
</style>
