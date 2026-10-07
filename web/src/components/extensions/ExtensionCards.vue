<script setup lang="ts">
import ExtensionHost from './ExtensionHost.vue'
import { NCard } from 'naive-ui'
import { computed } from 'vue'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { byOrder, useRegistry } from '@/extensions'

// Renders the cards an extension point contributes (core or plugins),
// passing `data` as props to each.
const props = defineProps<{ type: 'cluster-overview-card' | 'project-overview-card'; data: Record<string, unknown> }>()

const registry = useRegistry()
const ctx = useExtensionContext()
const cards = computed(() => registry.active(props.type, ctx.value).sort(byOrder))
</script>

<template>
  <NCard
    v-for="card in cards"
    :key="card.id"
    :title="card.title"
    size="small"
    :data-test="`card-${card.id}`"
  >
    <ExtensionHost
      :id="card.id"
      :source="card.source"
      :label="`${card.title} card`"
      :component="card.component"
      v-bind="data"
    />
  </NCard>
</template>
