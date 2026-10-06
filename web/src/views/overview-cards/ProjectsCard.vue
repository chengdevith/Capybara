<script setup lang="ts">
import { NButton, NSpin } from 'naive-ui'
import type { ClusterOverview } from '@/api/clusters'

defineProps<{ cluster: string; overview: ClusterOverview | null }>()
</script>

<template>
  <NSpin
    v-if="!overview"
    size="small"
  />
  <div v-else>
    <p class="count">
      <strong data-test="project-count">{{ overview.projects ?? '—' }}</strong>
      Project(s) on this cluster
    </p>
    <NButton
      size="small"
      @click="$router.push({ name: 'core.projects', params: { cluster } })"
    >
      View Projects
    </NButton>
  </div>
</template>

<style scoped>
.count {
  margin: 0 0 12px;
}
</style>
