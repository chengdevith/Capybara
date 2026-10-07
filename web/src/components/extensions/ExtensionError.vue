<script setup lang="ts">
import { NAlert } from 'naive-ui'
import { usePluginsStore } from '@/stores/plugins'

// Shown in place of an extension that could not be loaded or rendered.
defineProps<{ label: string; source: string; error: unknown }>()
const text = (e: unknown) => (e instanceof Error ? e.message : String(e))
const plugins = usePluginsStore()
</script>

<template>
  <NAlert
    type="error"
    :title="`${label} could not be shown`"
    data-test="extension-error"
  >
    {{ text(error) }}
    <div class="source">
      {{ source === 'core' ? 'Part of Capybara.' : `From the ${plugins.displayName(source)} plugin. Its installation can be disabled in the Marketplace.` }}
    </div>
  </NAlert>
</template>

<style scoped>
.source {
  margin-top: 4px;
  opacity: 0.75;
  font-size: 12px;
}
</style>
