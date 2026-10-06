<script setup lang="ts">
import { NTag, NTooltip } from 'naive-ui'
import { statusLabel, statusTone, type Cluster } from '@/api/clusters'

defineProps<{ cluster: Cluster }>()
</script>

<template>
  <NTooltip :disabled="!cluster.status.message">
    <template #trigger>
      <NTag
        size="small"
        :bordered="false"
        :type="statusTone(cluster)"
        data-test="cluster-status"
      >
        {{ statusLabel(cluster) }}
      </NTag>
    </template>
    {{ cluster.status.message }}
  </NTooltip>
</template>
