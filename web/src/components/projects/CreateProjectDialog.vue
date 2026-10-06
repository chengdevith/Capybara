<script setup lang="ts">
import { NAlert, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup, NSelect, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { createProject, getProjectConfig, type ProjectConfig, type ProjectSize } from '@/api/projects'
import { matchesGlob } from './phase'

const props = defineProps<{ cluster: string }>()
const emit = defineEmits<{ close: []; created: [name: string] }>()
const message = useMessage()

const config = ref<ProjectConfig | null>(null)
const loadError = ref<string | null>(null)
onMounted(async () => {
  try {
    config.value = await getProjectConfig()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  }
})

const name = ref('')
const displayName = ref('')
const description = ref('')
const cluster = ref(props.cluster)
const namespace = ref('')
const owner = ref('')
const size = ref<ProjectSize>('S')
const busy = ref(false)
const error = ref<string | null>(null)

const dns = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const effectiveNamespace = computed(() => namespace.value || name.value)
const problems = computed(() => {
  const p: string[] = []
  if (name.value && (!dns.test(name.value) || name.value.length > 63)) p.push('Name: lowercase letters, digits and "-", up to 63 characters.')
  if (namespace.value && (!dns.test(namespace.value) || namespace.value.length > 63)) p.push('Namespace: lowercase letters, digits and "-".')
  if (config.value?.protected.some((pat) => matchesGlob(pat, effectiveNamespace.value)))
    p.push(`Namespace "${effectiveNamespace.value}" is protected and cannot be used by a Project.`)
  if (owner.value && !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(owner.value)) p.push('Owner: a group name (letters, digits, . _ : @ / -).')
  return p
})
const ready = computed(() => !!name.value && !!owner.value && !!cluster.value && problems.value.length === 0)

const clusterOptions = computed(() => (config.value?.clusters ?? [props.cluster]).map((c) => ({ label: c, value: c })))
const sizeSummary = (s: ProjectSize) => {
  const q = config.value?.sizes[s]?.quota
  return q ? `${q['limits.cpu'] ?? '?'} CPU · ${q['limits.memory'] ?? '?'} memory · ${q.pods ?? '?'} pods` : ''
}

async function submit() {
  if (!ready.value) return false
  busy.value = true
  error.value = null
  try {
    await createProject({
      name: name.value,
      displayName: displayName.value || undefined,
      description: description.value || undefined,
      cluster: cluster.value,
      namespace: namespace.value || undefined,
      owner: owner.value,
      size: size.value,
    })
    message.success(`Project ${name.value} created`)
    emit('created', name.value)
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
    title="Create Project"
    positive-text="Create"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ disabled: !ready, 'data-test': 'create-submit' } as never"
    style="width: 560px"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <NAlert
      v-if="loadError"
      type="error"
    >
      {{ loadError }}
    </NAlert>
    <NForm
      label-placement="top"
      :show-feedback="false"
      class="form"
    >
      <NFormItem
        label="Name"
        required
      >
        <NInput
          v-model:value="name"
          placeholder="e.g. shop"
          data-test="project-name"
        />
      </NFormItem>
      <NFormItem label="Display name">
        <NInput
          v-model:value="displayName"
          placeholder="Optional"
        />
      </NFormItem>
      <NFormItem label="Description">
        <NInput
          v-model:value="description"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 3 }"
          placeholder="Optional"
        />
      </NFormItem>
      <NFormItem
        label="Cluster"
        required
      >
        <NSelect
          v-model:value="cluster"
          :options="clusterOptions"
        />
      </NFormItem>
      <NFormItem label="Namespace">
        <NInput
          v-model:value="namespace"
          :placeholder="name ? `${name} (same as the name)` : 'Same as the name'"
          data-test="project-namespace"
        />
      </NFormItem>
      <NFormItem
        label="Owner group"
        required
      >
        <NInput
          v-model:value="owner"
          placeholder="Group that gets the admin role in the namespace"
          data-test="project-owner"
        />
      </NFormItem>
      <NFormItem
        label="Size"
        required
      >
        <NRadioGroup
          v-model:value="size"
          data-test="project-size"
        >
          <NRadioButton
            v-for="s in ['S', 'M', 'L'] as const"
            :key="s"
            :value="s"
          >
            {{ s }}
          </NRadioButton>
        </NRadioGroup>
        <span class="hint">{{ sizeSummary(size) }}</span>
      </NFormItem>
    </NForm>
    <NAlert
      v-for="p in problems"
      :key="p"
      type="warning"
      class="note"
    >
      {{ p }}
    </NAlert>
    <NAlert
      v-if="error"
      type="error"
      class="note"
      data-test="create-error"
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
.hint {
  margin-left: 12px;
  color: var(--capy-text-muted);
  font-size: 12px;
}
.note {
  margin-top: 8px;
}
</style>
