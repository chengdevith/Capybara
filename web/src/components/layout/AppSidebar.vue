<script setup lang="ts">
import { NMenu, type MenuOption } from 'naive-ui'
import { computed, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { navTree, useRegistry, type NavItemExtension, type Registered } from '@/extensions'

// Everything in the sidebar comes from nav-section / nav-item extensions.
const registry = useRegistry()
const route = useRoute()
const ctx = useExtensionContext()

const tree = computed(() => navTree(registry, ctx.value))

function link(item: Registered<NavItemExtension>): MenuOption {
  const to = ctx.value.cluster ? { name: item.route, params: { cluster: ctx.value.cluster } } : { name: item.route }
  return {
    key: item.id,
    label: () => h(RouterLink, { to }, { default: () => item.label }),
    routeName: item.route,
  }
}

const options = computed<MenuOption[]>(() =>
  tree.value.map((entry) =>
    entry.kind === 'item'
      ? link(entry.item)
      : { key: entry.section.id, label: entry.section.label, children: entry.items.map(link) },
  ),
)

/** The item whose route is the current route (or an ancestor of it). */
const selected = computed(() => {
  const names = new Set(route.matched.map((m) => m.name))
  for (const entry of tree.value) {
    const items = entry.kind === 'item' ? [entry.item] : entry.items
    const hit = items.find((i) => names.has(i.route))
    if (hit) return hit.id
  }
  return null
})

const expanded = computed(() => tree.value.filter((e) => e.kind === 'section').map((e) => e.section.id))
</script>

<template>
  <NMenu
    inverted
    :options="options"
    :value="selected"
    :default-expanded-keys="expanded"
    :indent="16"
  />
</template>
