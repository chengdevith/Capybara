<script setup lang="ts">
import { NAlert, NCard, NH2 } from 'naive-ui'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import ResourceTable from '@/components/resource/ResourceTable.vue'
import type { ResourceDef, RowExtra } from '@/components/resource/types'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNamespace } from '@/composables/useNamespace'

// The one list page. Which kind it shows comes from the route's props.
const props = defineProps<{ resource: ResourceDef }>()

const ctx = useExtensionContext()
const { namespace } = useNamespace()

const scopedNamespace = computed(() => (props.resource.type.namespaced ? namespace.value : null))
const source = computed(() =>
  ctx.value.cluster ? { cluster: ctx.value.cluster, type: props.resource.type, namespace: scopedNamespace.value } : null,
)
const { items, loading, error, live } = useLiveList(source)

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
    </div>
    <NAlert
      v-if="error"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <NCard>
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
.error {
  margin-bottom: 12px;
}
</style>
