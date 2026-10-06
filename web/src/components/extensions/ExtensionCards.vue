<script setup lang="ts">
import { NCard } from 'naive-ui'
import { computed, defineAsyncComponent, type Component } from 'vue'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { byOrder, useRegistry, type LazyComponent } from '@/extensions'

// Renders the cards an extension point contributes (core or plugins),
// passing `data` as props to each.
const props = defineProps<{ type: 'cluster-overview-card' | 'project-overview-card'; data: Record<string, unknown> }>()

const registry = useRegistry()
const ctx = useExtensionContext()
const cards = computed(() => registry.active(props.type, ctx.value).sort(byOrder))
const components = new Map<string, Component>()
function cardComponent(id: string, load: LazyComponent): Component {
  let c = components.get(id)
  if (!c) {
    c = defineAsyncComponent(load)
    components.set(id, c)
  }
  return c
}
</script>

<template>
  <NCard
    v-for="card in cards"
    :key="card.id"
    :title="card.title"
    size="small"
    :data-test="`card-${card.id}`"
  >
    <component
      :is="cardComponent(card.id, card.component)"
      v-bind="data"
    />
  </NCard>
</template>
