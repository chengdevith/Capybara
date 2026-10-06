<script setup lang="ts">
import { NTooltip } from 'naive-ui'

defineProps<{ live: boolean; loading?: boolean }>()
</script>

<template>
  <NTooltip>
    <template #trigger>
      <span
        class="live"
        :class="{ on: live }"
        data-test="live-indicator"
      >
        <span class="dot" />{{ live ? 'Live' : loading ? 'Loading' : 'Reconnecting…' }}
      </span>
    </template>
    {{ live ? 'Updates stream in as they happen.' : 'Waiting for the live connection; the data shown may be stale.' }}
  </NTooltip>
</template>

<style scoped>
.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6a6e73;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0ab00;
}
.live.on .dot {
  background: #3e8635;
}
</style>
