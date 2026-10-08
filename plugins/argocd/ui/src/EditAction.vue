<script setup lang="ts">
import { useNavigate, type KubeObject } from '@capybara/sdk'
import { onMounted } from 'vue'

// Opens the Application in the form (and YAML) editor.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const navigate = useNavigate()

onMounted(async () => {
  emit('close')
  const m = props.object.metadata
  await navigate({ name: 'argocd.applications.edit', params: { cluster: props.cluster, namespace: m.namespace ?? '', name: m.name } })
})
</script>

<template>
  <span />
</template>
