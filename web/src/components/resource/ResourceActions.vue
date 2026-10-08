<script setup lang="ts">
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { computed, h, shallowRef } from 'vue'
import type { KubeObject } from '@/api/k8s'
import ExtensionHost from '@/components/extensions/ExtensionHost.vue'
import { resourceActions, useRegistry, type Registered, type ResourceActionExtension } from '@/extensions'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { usePluginsStore } from '@/stores/plugins'
import type { ResourceDef } from './types'

// Menu of resource-action extensions for one object; the chosen action's
// dialog is mounted until it emits `close`.
const props = defineProps<{ cluster: string; resource: ResourceDef; object: KubeObject; compact?: boolean }>()

const registry = useRegistry()
const ctx = useExtensionContext()
// Kinds a plugin manages: core's generic Edit YAML and Delete would be
// refused anyway; the plugin's own actions do those writes.
const plugins = usePluginsStore()
const coreWrites = ['core.action.edit-yaml', 'core.action.delete']
const actions = computed(() => {
  const all = resourceActions(registry, props.resource.type.kind, ctx.value)
  const t = props.resource.type
  return plugins.governing(t.group, t.plural) ? all.filter((a) => !coreWrites.includes(a.id)) : all
})

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
