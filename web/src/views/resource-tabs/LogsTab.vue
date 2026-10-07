<script setup lang="ts">
import { computed } from 'vue'
import LogViewer from '@/components/logs/LogViewer.vue'
import type { DetailTabProps } from '@/components/resource/types'

const props = defineProps<DetailTabProps>()

interface ContainerSpec {
  name: string
}
const containers = computed(() => [
  ...((props.object.spec?.containers as ContainerSpec[]) ?? []).map((c) => ({ label: c.name, value: c.name })),
  ...((props.object.spec?.initContainers as ContainerSpec[]) ?? []).map((c) => ({
    label: `${c.name} (init)`,
    value: c.name,
  })),
])
</script>

<template>
  <LogViewer
    :cluster="cluster"
    :namespace="object.metadata.namespace ?? ''"
    :pod="object.metadata.name"
    :containers="containers"
  />
</template>
