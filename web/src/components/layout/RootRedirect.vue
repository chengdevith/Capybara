<script setup lang="ts">
import { NAlert, NEmpty, NSpin } from 'naive-ui'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClustersStore } from '@/stores/clusters'

// "/" goes to the first registered cluster (no cluster is special), or to
// the Clusters page to add one.
const router = useRouter()
const clusters = useClustersStore()

onMounted(async () => {
  await clusters.ensureLoaded()
  const first = clusters.items[0]
  if (first) await router.replace(`/c/${encodeURIComponent(first.id)}`)
  else if (!clusters.error) await router.replace({ name: 'core.clusters' })
})
</script>

<template>
  <NSpin v-if="!clusters.loaded" />
  <NAlert
    v-else-if="clusters.error"
    type="error"
    title="Could not load clusters"
  >
    {{ clusters.error }}
  </NAlert>
  <NEmpty
    v-else-if="clusters.items.length === 0"
    description="No clusters are registered yet."
  />
</template>
