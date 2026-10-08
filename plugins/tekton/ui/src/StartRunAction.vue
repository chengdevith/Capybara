<script setup lang="ts">
import { useNavigate, type KubeObject } from '@capybara/sdk'
import { onMounted } from 'vue'

// "Start run": opens the run form for this Pipeline.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
onMounted(async () => {
  await navigate({ name: 'tekton.pipelines.start', params: { cluster: props.cluster, namespace: props.object.metadata.namespace ?? '', name: props.object.metadata.name } })
  emit('close')
})
</script>

<template>
  <span />
</template>
