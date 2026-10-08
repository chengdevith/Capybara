<script setup lang="ts">
import { useNavigate, type KubeObject } from '@capybara/sdk'
import { onMounted } from 'vue'

// "Start": the Create PipelineRun form with this Pipeline chosen.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()
onMounted(async () => {
  await navigate({
    name: 'tekton.pipelineruns.new',
    params: { cluster: props.cluster },
    query: { ns: props.object.metadata.namespace ?? '', pipeline: props.object.metadata.name },
  })
  emit('close')
})
</script>

<template>
  <span />
</template>
