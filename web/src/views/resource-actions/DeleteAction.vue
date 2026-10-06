<script setup lang="ts">
import { NAlert, NInput, NModal, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { deleteObject, targetOf } from '@/api/actions'
import type { DetailTabProps } from '@/components/resource/types'

// Simple confirmation, or type-the-name for kinds that set deleteConfirm.
const props = defineProps<DetailTabProps>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()

const name = props.object.metadata.name
const typeName = computed(() => props.resource.deleteConfirm === 'type-name')
const typed = ref('')
const busy = ref(false)
const ready = computed(() => !typeName.value || typed.value === name)

async function submit() {
  if (!ready.value) return false
  busy.value = true
  try {
    await deleteObject(props.cluster, targetOf(props.resource.type, props.object), props.object.metadata.uid)
    message.success(`${props.resource.singular} ${name} is being deleted`)
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
    :title="`Delete ${resource.singular} ${name}?`"
    positive-text="Delete"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ type: 'error', disabled: !ready, 'data-test': 'confirm' } as never"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <NAlert
      v-if="resource.type.kind === 'Namespace'"
      type="error"
      class="warn"
    >
      Everything in this namespace is deleted with it.
    </NAlert>
    <template v-if="typeName">
      <p>
        This cannot be undone. Type <strong>{{ name }}</strong> to confirm.
      </p>
      <NInput
        v-model:value="typed"
        :placeholder="name"
        data-test="confirm-name"
        @keyup.enter="submit"
      />
    </template>
    <p v-else>
      This cannot be undone.
    </p>
  </NModal>
</template>

<style scoped>
.warn {
  margin-bottom: 8px;
}
</style>
