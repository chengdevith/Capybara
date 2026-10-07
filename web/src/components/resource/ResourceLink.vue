<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useRegistry } from '@/extensions'

// Link to an object's detail page by resource id ('core.pods',
// 'tekton.pipelineruns'); plain text while that page is not registered.
// Lent to plugins as api.components.ResourceLink. The cluster defaults to
// the one in the URL.
const props = defineProps<{ cluster?: string; resource: string; namespace?: string; name: string }>()

const registry = useRegistry()
const route = useRoute()
const to = computed(() => {
  const id = `${props.resource}.detail`
  const cluster = props.cluster ?? route.params.cluster
  if (!registry.get(id) || typeof cluster !== 'string' || !cluster) return null
  return {
    name: id,
    params: { cluster, name: props.name, ...(props.namespace ? { namespace: props.namespace } : {}) },
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
