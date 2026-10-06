<script setup lang="ts">
import { NInput, NModal, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { deleteProject, type Project } from '@/api/projects'

const props = defineProps<{ project: Project }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()

const name = props.project.metadata.name
const typed = ref('')
const busy = ref(false)
const ready = computed(() => typed.value === name)

async function submit() {
  if (!ready.value) return false
  busy.value = true
  try {
    await deleteProject(name, props.project.metadata.uid)
    message.success(`Project ${name} is being deleted`)
    emit('close')
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
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
    :title="`Delete Project ${name}?`"
    positive-text="Delete"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ type: 'error', disabled: !ready, 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <p>
      This deletes namespace <strong>{{ project.spec.namespace }}</strong> and everything in it from cluster
      <strong>{{ project.spec.cluster }}</strong>. It cannot be undone.
    </p>
    <p>Type <strong>{{ name }}</strong> to confirm.</p>
    <NInput
      v-model:value="typed"
      :placeholder="name"
      data-test="confirm-name"
      @keyup.enter="submit"
    />
  </NModal>
</template>
