<script setup lang="ts">
import { NCard, NH2, NTabPane, NTabs } from 'naive-ui'
import { computed, defineAsyncComponent, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { byOrder, useRegistry, type LazyComponent } from '@/extensions'

const registry = useRegistry()
const ctx = useExtensionContext()
const route = useRoute()
const router = useRouter()
const pages = computed(() => registry.active('settings-page', ctx.value).sort(byOrder))
const components = new Map<string, Component>()
function pageComponent(id: string, load: LazyComponent): Component {
  let c = components.get(id)
  if (!c) {
    c = defineAsyncComponent(load)
    components.set(id, c)
  }
  return c
}
const active = computed({
  get: () => {
    const t = route.query.tab
    return typeof t === 'string' && pages.value.some((p) => p.id === t) ? t : (pages.value[0]?.id ?? '')
  },
  set: (tab: string) => void router.replace({ query: { ...route.query, tab } }),
})
</script>

<template>
  <div>
    <NH2>Settings</NH2>
    <NCard>
      <NTabs
        v-model:value="active"
        type="line"
      >
        <NTabPane
          v-for="p in pages"
          :key="p.id"
          :name="p.id"
          :tab="p.label"
        >
          <component
            :is="pageComponent(p.id, p.component)"
            :cluster="ctx.cluster"
          />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>
