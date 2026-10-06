<script setup lang="ts">
import { NAlert, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { status } from './api'

const props = defineProps<{ cluster: string }>()
const info = ref<{ version: string; targetsUp: number; targetsDown: number } | null>(null)
const error = ref<string | null>(null)
onMounted(async () => {
  try {
    info.value = await status(props.cluster)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
</script>

<template>
  <div>
    <NAlert
      type="info"
      :show-icon="false"
      class="note"
    >
      Install mode, connection settings, upgrades and uninstalling are managed in the Marketplace.
    </NAlert>
    <NAlert
      v-if="error"
      type="warning"
    >
      {{ error }}
    </NAlert>
    <NDescriptions
      v-if="info"
      :column="1"
      label-placement="left"
      bordered
    >
      <NDescriptionsItem label="Prometheus">
        {{ info.version }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Scrape targets">
        {{ info.targetsUp }} up, {{ info.targetsDown }} down
      </NDescriptionsItem>
      <NDescriptionsItem label="Queries">
        Predefined only (CPU, memory, alerts); ranges 1h, 6h, 24h, 7d; cached briefly.
      </NDescriptionsItem>
    </NDescriptions>
  </div>
</template>

<style scoped>
.note {
  margin-bottom: 12px;
}
</style>
