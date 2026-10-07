<script setup lang="ts">
import ExtensionHost from '@/components/extensions/ExtensionHost.vue'
import { NCard, NH2, NTabPane, NTabs } from 'naive-ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { byOrder, useRegistry } from '@/extensions'

const registry = useRegistry()
const ctx = useExtensionContext()
const route = useRoute()
const router = useRouter()
const pages = computed(() => registry.active('settings-page', ctx.value).sort(byOrder))
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
          <ExtensionHost
            :id="p.id"
            :source="p.source"
            :label="`${p.label} settings`"
            :component="p.component"
            :cluster="ctx.cluster"
          />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>
