<script setup lang="ts">
import { NDescriptions, NDescriptionsItem, NSpin, NTag } from 'naive-ui'
import { computed } from 'vue'
import type { ClusterOverview } from '@/api/clusters'

const props = defineProps<{ cluster: string; overview: ClusterOverview | null }>()
const count = (n: number | null | undefined) => (n === null || n === undefined ? 'not permitted' : String(n))
const pods = computed(() => Object.entries(props.overview?.pods ?? {}).sort(([a], [b]) => a.localeCompare(b)))
</script>

<template>
  <NSpin
    v-if="!overview"
    size="small"
  />
  <NDescriptions
    v-else
    :column="1"
    label-placement="left"
    size="small"
  >
    <NDescriptionsItem label="Nodes">
      {{ count(overview.nodes) }}
    </NDescriptionsItem>
    <NDescriptionsItem label="Namespaces">
      {{ count(overview.namespaces) }}
    </NDescriptionsItem>
    <NDescriptionsItem label="Pods">
      <span v-if="!overview.pods">not permitted</span>
      <span v-else-if="pods.length === 0">0</span>
      <span
        v-else
        class="pods"
      >
        <NTag
          v-for="[phase, n] in pods"
          :key="phase"
          size="small"
          :bordered="false"
          :type="phase === 'Running' || phase === 'Succeeded' ? 'success' : phase === 'Pending' ? 'warning' : 'error'"
        >
          {{ n }} {{ phase }}
        </NTag>
      </span>
    </NDescriptionsItem>
    <NDescriptionsItem label="Deployments">
      {{ count(overview.deployments) }}
    </NDescriptionsItem>
    <NDescriptionsItem label="Services">
      {{ count(overview.services) }}
    </NDescriptionsItem>
  </NDescriptions>
</template>

<style scoped>
.pods {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
