<script setup lang="ts">
import { NAlert, NButton, NCard, NH2, NResult } from 'naive-ui'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import ResourceTable from '@/components/resource/ResourceTable.vue'
import type { ResourceDef, RowExtra } from '@/components/resource/types'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNamespace } from '@/composables/useNamespace'
import { useRegistry } from '@/extensions'

// The one list page. Which kind it shows comes from the route's props.
const props = defineProps<{ resource: ResourceDef }>()

const ctx = useExtensionContext()
const { namespace } = useNamespace()

const scopedNamespace = computed(() => (props.resource.type.namespaced ? namespace.value : null))
const source = computed(() =>
  ctx.value.cluster ? { cluster: ctx.value.cluster, type: props.resource.type, namespace: scopedNamespace.value } : null,
)
const { items, loading, error, forbidden, live } = useLiveList(source)

// A "Create" button when the kind declares a create page that exists.
const registry = useRegistry()
const createTo = computed(() => {
  const c = props.resource.create
  if (!c || !ctx.value.cluster || !registry.get(c.route)) return null
  if (c.when && !c.when(ctx.value.cluster, namespace.value || null)) return null
  return { name: c.route, params: { cluster: ctx.value.cluster }, query: namespace.value ? { ns: namespace.value } : {} }
})

// Optional per-row extras from the server, refreshed (debounced) as the
// live list changes.
const extras = shallowRef<Map<string, RowExtra>>(new Map())
let extrasTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [source.value, items.value.map((o) => o.metadata.resourceVersion).join(',')] as const,
  () => {
    const load = props.resource.rowExtras
    const src = source.value
    if (!load || !src) return
    clearTimeout(extrasTimer)
    extrasTimer = setTimeout(async () => {
      try {
        extras.value = await load(src.cluster, scopedNamespace.value)
      } catch {
        // extras are optional; the list itself still works
      }
    }, 300)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(extrasTimer))
</script>

<template>
  <div>
    <div class="page-header">
      <NH2 class="title">
        {{ resource.label }}
      </NH2>
      <LiveIndicator
        :live="live"
        :loading="loading"
      />
      <RouterLink
        v-if="createTo"
        :to="createTo"
        class="create"
        data-test="resource-create"
      >
        <NButton
          type="primary"
          size="small"
        >
          {{ resource.create!.label }}
        </NButton>
      </RouterLink>
    </div>
    <NCard v-if="forbidden">
      <NResult
        status="403"
        title="Not permitted on this cluster"
        data-test="not-permitted"
        :description="`Capybara's account on this cluster may not list ${resource.label}. ${resource.forbiddenHint ?? ''}`"
      />
    </NCard>
    <NAlert
      v-if="error && !forbidden"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <NCard v-if="!forbidden">
      <ResourceTable
        :resource="resource"
        :items="items"
        :cluster="ctx.cluster ?? ''"
        :loading="loading"
        :show-namespace="resource.type.namespaced && !scopedNamespace"
        :extras="extras"
      />
    </NCard>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.title {
  margin: 0 0 16px;
}
.create {
  margin-left: auto;
}
.error {
  margin-bottom: 12px;
}
</style>
