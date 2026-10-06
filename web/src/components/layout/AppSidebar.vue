<script setup lang="ts">
import { NMenu, type MenuOption } from 'naive-ui'
import { computed, h, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { navTree, useRegistry, type NavItemExtension, type Registered } from '@/extensions'

// Everything in the sidebar comes from nav-section / nav-item extensions.
const registry = useRegistry()
const route = useRoute()
const ctx = useExtensionContext()

const tree = computed(() => navTree(registry, ctx.value))

function link(item: Registered<NavItemExtension>): MenuOption {
  // Keep the selected namespace when moving between pages.
  const query = route.query.ns ? { ns: route.query.ns } : {}
  const to = ctx.value.cluster
    ? { name: item.route, params: { cluster: ctx.value.cluster }, query }
    : { name: item.route, query }
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

/** The item whose route is the current route, an ancestor of it, or the
 * page it belongs under (route `parent`, e.g. list page of a detail page). */
const selected = computed(() => {
  const names = new Set<unknown>(route.matched.map((m) => m.name))
  if (typeof route.meta.parent === 'string') names.add(route.meta.parent)
  for (const entry of tree.value) {
    const items = entry.kind === 'item' ? [entry.item] : entry.items
    const hit = items.find((i) => names.has(i.route))
    if (hit) return hit.id
  }
  return null
})

// Sections start expanded, including ones that appear later (e.g. after
// the redirect from "/" picks a cluster, or a plugin registers one); a
// section the user collapses stays collapsed.
const expanded = ref<string[]>([])
const seen = new Set<string>()
watch(
  () => tree.value.filter((e) => e.kind === 'section').map((e) => e.section.id),
  (ids) => {
    const fresh = ids.filter((id) => !seen.has(id))
    fresh.forEach((id) => seen.add(id))
    if (fresh.length) expanded.value = [...expanded.value, ...fresh]
  },
  { immediate: true },
)
</script>

<template>
  <NMenu
    inverted
    :options="options"
    :value="selected"
    :expanded-keys="expanded"
    :indent="16"
    @update:expanded-keys="(keys: string[]) => (expanded = keys)"
  />
</template>
