<script setup lang="ts">
import { NCard, NDescriptions, NDescriptionsItem, NH1, NTag } from 'naive-ui'
import { computed } from 'vue'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useClustersStore } from '@/stores/clusters'

const ctx = useExtensionContext()
const clusters = useClustersStore()
const cluster = computed(() => clusters.byId(ctx.value.cluster))
</script>

<template>
  <div v-if="cluster">
    <NH1>{{ cluster.displayName }}</NH1>
    <NCard title="Cluster">
      <NDescriptions
        :column="2"
        label-placement="left"
        bordered
      >
        <NDescriptionsItem label="ID">
          {{ cluster.id }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Environment">
          <NTag size="small">
            {{ cluster.environment || '—' }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="Status">
          <NTag
            size="small"
            :type="cluster.status.phase === 'Connected' ? 'success' : 'error'"
          >
            {{ cluster.status.phase }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="Kubernetes">
          {{ cluster.status.version ?? '—' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Nodes">
          {{ cluster.status.nodeCount }}
        </NDescriptionsItem>
        <NDescriptionsItem
          v-if="cluster.status.message"
          label="Message"
        >
          {{ cluster.status.message }}
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </div>
</template>
