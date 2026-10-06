<script setup lang="ts">
import { NBreadcrumb, NBreadcrumbItem, NCard, NH2, NResult, NSpin, NTabPane, NTabs, NTag } from 'naive-ui'
import { computed, defineAsyncComponent, ref, watch, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import { listRouteOf, type ResourceDef } from '@/components/resource/types'
import { statusTag } from '@/components/resource/render'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { detailTabs, useRegistry, type LazyComponent } from '@/extensions'

// The one detail page. Tabs come from resource-detail-tab extensions.
const props = defineProps<{ resource: ResourceDef }>()

const route = useRoute()
const router = useRouter()
const registry = useRegistry()
const ctx = useExtensionContext()

const name = computed(() => String(route.params.name ?? ''))
const namespace = computed(() => (props.resource.type.namespaced ? String(route.params.namespace ?? '') : null))

// Watch exactly this object, so edits and deletion show up live.
const source = computed(() =>
  ctx.value.cluster
    ? {
        cluster: ctx.value.cluster,
        type: props.resource.type,
        namespace: namespace.value,
        fieldSelector: `metadata.name=${name.value}`,
      }
    : null,
)
const { items, loading, error, live } = useLiveList(source, { flushMs: 0 })
// Match by name/namespace rather than trusting the selector to return one item.
const object = computed(
  () =>
    items.value.find(
      (o) => o.metadata.name === name.value && (namespace.value === null || o.metadata.namespace === namespace.value),
    ) ?? null,
)

const seen = ref(false)
watch(object, (o) => {
  if (o) seen.value = true
})

const tabs = computed(() => detailTabs(registry, props.resource.type.kind, ctx.value))
const components = new Map<string, Component>()
function tabComponent(id: string, load: LazyComponent): Component {
  let c = components.get(id)
  if (!c) {
    c = defineAsyncComponent(load)
    components.set(id, c)
  }
  return c
}

const activeTab = computed({
  get: () => {
    const t = route.query.tab
    return typeof t === 'string' && tabs.value.some((x) => x.id === t) ? t : (tabs.value[0]?.id ?? '')
  },
  set: (tab: string) => void router.replace({ query: { ...route.query, tab } }),
})

const listLink = computed(() => ({
  name: listRouteOf(props.resource),
  params: { cluster: ctx.value.cluster },
  query: route.query.ns ? { ns: route.query.ns } : {},
}))
const status = computed(() => (object.value && props.resource.status ? props.resource.status(object.value) : null))
</script>

<template>
  <div>
    <NBreadcrumb class="crumbs">
      <NBreadcrumbItem>
        <RouterLink :to="listLink">
          {{ resource.label }}
        </RouterLink>
      </NBreadcrumbItem>
      <NBreadcrumbItem>{{ name }}</NBreadcrumbItem>
    </NBreadcrumb>

    <div class="page-header">
      <NTag
        size="small"
        type="info"
        :bordered="false"
      >
        {{ resource.singular }}
      </NTag>
      <NH2 class="title">
        {{ name }}
      </NH2>
      <component
        :is="statusTag(status.text, status.tone)"
        v-if="status"
      />
      <LiveIndicator
        :live="live"
        :loading="loading"
      />
    </div>
    <div
      v-if="namespace"
      class="subtitle"
    >
      Namespace: {{ namespace }}
    </div>

    <NSpin v-if="loading && !object" />
    <NResult
      v-else-if="!object && error"
      status="warning"
      title="Could not load this resource"
      :description="error"
    />
    <NResult
      v-else-if="!object"
      status="404"
      :title="seen ? `This ${resource.singular} was deleted` : `${resource.singular} not found`"
      :description="seen ? 'It no longer exists in the cluster.' : `No ${resource.singular} named “${name}” here.`"
    />
    <NCard v-else>
      <NTabs
        v-model:value="activeTab"
        type="line"
      >
        <NTabPane
          v-for="tab in tabs"
          :key="tab.id"
          :name="tab.id"
          :tab="tab.label"
          display-directive="show:lazy"
        >
          <component
            :is="tabComponent(tab.id, tab.component)"
            :cluster="ctx.cluster"
            :resource="resource"
            :object="object"
          />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped>
.crumbs {
  margin-bottom: 8px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  margin: 0;
}
.subtitle {
  color: var(--capy-text-muted);
  margin: 4px 0 16px;
}
</style>
