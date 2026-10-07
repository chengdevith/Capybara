<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRegistry } from '@/extensions'

// Link to an object's detail page by resource id ('core.pods',
// 'tekton.pipelineruns'); plain text while that page is not registered.
// Lent to plugins as api.components.ResourceLink.
const props = defineProps<{ cluster: string; resource: string; namespace?: string; name: string }>()

const registry = useRegistry()
const to = computed(() => {
  const id = `${props.resource}.detail`
  if (!registry.get(id)) return null
  return {
    name: id,
    params: { cluster: props.cluster, name: props.name, ...(props.namespace ? { namespace: props.namespace } : {}) },
  }
})
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
  >
    <slot>{{ name }}</slot>
  </RouterLink>
  <span v-else><slot>{{ name }}</slot></span>
</template>
