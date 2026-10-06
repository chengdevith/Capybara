<script setup lang="ts">
import { NAlert, NCheckbox, NInput, NModal, NSpin, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/api/client'
import { removeCluster, type Cluster } from '@/api/clusters'
import { listProjects } from '@/api/projects'
import { useClustersStore } from '@/stores/clusters'

// Type-the-name removal. While Projects use the cluster it is refused,
// unless their remote resources are abandoned (left in place).
const props = defineProps<{ cluster: Cluster }>()
const emit = defineEmits<{ close: []; removed: [] }>()
const message = useMessage()
const clusters = useClustersStore()

const id = props.cluster.id
const typed = ref('')
const abandon = ref(false)
const projects = ref<string[] | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const list = await listProjects()
    projects.value = list.items
      // Same rule as the server: Projects already abandoned by an earlier removal don't count.
      .filter((p) => (p as { spec?: { cluster?: string } }).spec?.cluster === id && !abandoned(p.metadata))
      .map((p) => p.metadata.name)
      .sort()
  } catch {
    projects.value = [] // the server checks again and lists them if refused
  }
})

const abandoned = (m: { deletionTimestamp?: string; annotations?: Record<string, string> }) =>
  !!m.deletionTimestamp && m.annotations?.['platform.capybara.io/abandon-remote'] === 'true'

const ready = computed(() => typed.value === id && projects.value !== null && (projects.value.length === 0 || abandon.value))

async function submit() {
  if (!ready.value) return false
  busy.value = true
  error.value = null
  try {
    await removeCluster(id, abandon.value)
    await clusters.load()
    message.success(`Cluster ${id} removed`)
    emit('removed')
  } catch (e) {
    if (e instanceof ApiError && e.status === 409 && Array.isArray(e.body.projects)) {
      projects.value = e.body.projects as string[]
      abandon.value = false
    }
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
  return false
}
</script>

<template>
  <NModal
    :show="true"
    preset="dialog"
    type="error"
    :title="`Remove cluster ${id}?`"
    positive-text="Remove"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ type: 'error', disabled: !ready, 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <p>
      Capybara forgets this cluster and deletes its stored kubeconfig. Nothing on the cluster itself is changed.
      Open views, logs and terminals on it close.
    </p>
    <NSpin
      v-if="projects === null"
      size="small"
    />
    <template v-else-if="projects.length">
      <NAlert
        type="warning"
        :title="`${projects.length} Project(s) use this cluster`"
        data-test="remove-projects"
      >
        <ul class="projects">
          <li
            v-for="p in projects"
            :key="p"
          >
            {{ p }}
          </li>
        </ul>
        Delete them first, or abandon their remote resources: the Projects are removed from Capybara but their
        namespaces, quotas and bindings stay on the cluster.
      </NAlert>
      <NCheckbox
        v-model:checked="abandon"
        class="abandon"
        data-test="abandon"
      >
        Abandon remote resources and remove these Projects
      </NCheckbox>
    </template>
    <p>Type <strong>{{ id }}</strong> to confirm.</p>
    <NInput
      v-model:value="typed"
      :placeholder="id"
      data-test="confirm-name"
      @keyup.enter="submit"
    />
    <NAlert
      v-if="error"
      type="error"
      class="err"
    >
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped>
.projects {
  margin: 4px 0 8px;
  padding-left: 18px;
}
.abandon {
  margin: 12px 0 4px;
}
.err {
  margin-top: 12px;
}
</style>
