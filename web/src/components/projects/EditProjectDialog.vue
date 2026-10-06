<script setup lang="ts">
import { NAlert, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup, NTable, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { apiGet } from '@/api/client'
import { getProjectConfig, isSmaller, updateProject, type Project, type ProjectConfig, type ProjectSize } from '@/api/projects'
import { exceeds } from './quantity'

// Size, owner and display name. Reducing the size first shows current
// usage against the new limits.
const props = defineProps<{ project: Project }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()

const displayName = ref(props.project.spec.displayName ?? '')
const owner = ref(props.project.spec.owner)
const size = ref<ProjectSize>(props.project.spec.size)
const busy = ref(false)
const error = ref<string | null>(null)

const config = ref<ProjectConfig | null>(null)
const used = ref<Record<string, string> | null>(null)
const usageError = ref<string | null>(null)
const reducing = computed(() => isSmaller(size.value, props.project.spec.size))

watch(
  reducing,
  async (r) => {
    if (!r || used.value) return
    try {
      config.value ??= await getProjectConfig()
      const { cluster, namespace } = props.project.spec
      const quota = await apiGet<{ status?: { used?: Record<string, string> } }>(
        `/api/clusters/${encodeURIComponent(cluster)}/k8s/api/v1/namespaces/${encodeURIComponent(namespace)}/resourcequotas/capybara-project-quota`,
      )
      used.value = quota.status?.used ?? {}
    } catch (e) {
      usageError.value = `Could not read current usage: ${e instanceof Error ? e.message : String(e)}`
    }
  },
  { immediate: true },
)

const rows = computed(() => {
  if (!config.value || !used.value) return []
  const current = config.value.sizes[props.project.spec.size].quota
  const next = config.value.sizes[size.value].quota
  return Object.keys(next).map((r) => ({
    resource: r,
    used: used.value?.[r] ?? '0',
    current: current[r] ?? '—',
    next: next[r]!,
    over: exceeds(used.value?.[r], next[r]),
  }))
})
const overLimit = computed(() => rows.value.some((r) => r.over))

const changed = computed(
  () =>
    displayName.value !== (props.project.spec.displayName ?? '') ||
    owner.value !== props.project.spec.owner ||
    size.value !== props.project.spec.size,
)

async function submit() {
  if (!changed.value) return false
  busy.value = true
  error.value = null
  try {
    await updateProject(props.project.metadata.name, {
      displayName: displayName.value,
      owner: owner.value,
      size: size.value,
    })
    message.success('Project updated')
    emit('close')
  } catch (e) {
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
    :title="`Edit Project ${project.metadata.name}`"
    :positive-text="reducing ? 'Reduce size and save' : 'Save'"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ disabled: !changed, type: reducing ? 'warning' : 'primary', 'data-test': 'edit-submit' } as never"
    style="width: 620px"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <NForm
      label-placement="top"
      :show-feedback="false"
      class="form"
    >
      <NFormItem label="Display name">
        <NInput v-model:value="displayName" />
      </NFormItem>
      <NFormItem label="Owner group">
        <NInput v-model:value="owner" />
      </NFormItem>
      <NFormItem label="Size">
        <NRadioGroup
          v-model:value="size"
          data-test="edit-size"
        >
          <NRadioButton
            v-for="s in ['S', 'M', 'L'] as const"
            :key="s"
            :value="s"
          >
            {{ s }}
          </NRadioButton>
        </NRadioGroup>
      </NFormItem>
    </NForm>

    <template v-if="reducing">
      <NAlert
        :type="overLimit ? 'error' : 'warning'"
        class="note"
        :title="overLimit ? 'Current usage is above the new limits' : 'Reducing the size'"
      >
        Running pods keep running; new pods or volumes that would exceed the new quota are refused.
      </NAlert>
      <NAlert
        v-if="usageError"
        type="error"
        class="note"
      >
        {{ usageError }}
      </NAlert>
      <NTable
        v-else-if="rows.length"
        size="small"
        class="usage"
        data-test="usage-table"
      >
        <thead>
          <tr>
            <th>Resource</th>
            <th>In use</th>
            <th>Now ({{ project.spec.size }})</th>
            <th>New ({{ size }})</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in rows"
            :key="r.resource"
            :class="{ over: r.over }"
          >
            <td>{{ r.resource }}</td>
            <td>{{ r.used }}</td>
            <td>{{ r.current }}</td>
            <td>{{ r.next }}<span v-if="r.over"> (exceeded)</span></td>
          </tr>
        </tbody>
      </NTable>
    </template>
    <NAlert
      v-if="error"
      type="error"
      class="note"
    >
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped>
.form {
  display: grid;
  gap: 10px;
}
.note,
.usage {
  margin-top: 10px;
}
.over td {
  color: #c9190b;
  font-weight: 600;
}
</style>
