<script setup lang="ts">
import { NAlert, NCard, NH2 } from 'naive-ui'
import { computed } from 'vue'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import ResourceTable from '@/components/resource/ResourceTable.vue'
import type { ResourceDef } from '@/components/resource/types'
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
