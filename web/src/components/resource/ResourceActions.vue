<script setup lang="ts">
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { computed, defineAsyncComponent, h, shallowRef, type Component } from 'vue'
import type { KubeObject } from '@/api/k8s'
import { resourceActions, useRegistry } from '@/extensions'
import { useExtensionContext } from '@/composables/useExtensionContext'
import type { ResourceDef } from './types'

// Menu of resource-action extensions for one object; the chosen action's
// dialog is mounted until it emits `close`.
const props = defineProps<{ cluster: string; resource: ResourceDef; object: KubeObject; compact?: boolean }>()

const registry = useRegistry()
const ctx = useExtensionContext()
const actions = computed(() => resourceActions(registry, props.resource.type.kind, ctx.value))

const options = computed<DropdownOption[]>(() =>
  actions.value.map((a) => ({
    key: a.id,
    label: a.label,
    props: a.danger ? { style: 'color: var(--n-option-text-color-error, #c9190b)', 'data-danger': 'true' } : undefined,
  })),
)

const components = new Map<string, Component>()
const open = shallowRef<Component | null>(null)
function choose(key: string) {
  const a = actions.value.find((x) => x.id === key)
  if (!a) return
  let c = components.get(a.id)
  if (!c) {
    c = defineAsyncComponent(a.component)
    components.set(a.id, c)
  }
  open.value = c
}
function close() {
  open.value = null
}
const trigger = () =>
  props.compact
    ? h(NButton, { size: 'tiny', quaternary: true, 'aria-label': 'Actions', 'data-test': 'row-actions' }, () => '⋮')
    : h(NButton, { size: 'small', 'data-test': 'actions' }, () => 'Actions ▾')
</script>

<template>
  <NDropdown
    v-if="actions.length"
    trigger="click"
    :options="options"
    @select="choose"
  >
    <component :is="trigger" />
  </NDropdown>
  <component
    :is="open"
    v-if="open"
    :cluster="cluster"
    :resource="resource"
    :object="object"
    @close="close"
  />
</template>
