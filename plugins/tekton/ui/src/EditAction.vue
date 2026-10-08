<script setup lang="ts">
import { useNavigate, type KubeObject } from '@capybara/sdk'
import { onMounted } from 'vue'
import { objectOf } from './tekton'

// "Edit": opens the editor page for this Task or Pipeline.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
onMounted(async () => {
  const object = objectOf[props.object.kind ?? '']
  await navigate({ name: `tekton.${object}.edit`, params: { cluster: props.cluster, namespace: props.object.metadata.namespace ?? '', name: props.object.metadata.name } })
  emit('close')
})
</script>

<template>
  <span />
</template>
