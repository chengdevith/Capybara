<script setup lang="ts">
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { computed, h, shallowRef } from 'vue'
import type { KubeObject } from '@/api/k8s'
import ExtensionHost from '@/components/extensions/ExtensionHost.vue'
import { resourceActions, useRegistry, type Registered, type ResourceActionExtension } from '@/extensions'
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

const open = shallowRef<Registered<ResourceActionExtension> | null>(null)
function choose(key: string) {
  open.value = actions.value.find((x) => x.id === key) ?? null
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
  <ExtensionHost
    v-if="open"
    :id="open.id"
    :source="open.source"
    :label="open.label"
    :component="open.component"
    :cluster="cluster"
    :resource="resource"
    :object="object"
    @close="close"
  />
</template>
