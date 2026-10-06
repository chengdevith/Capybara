<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { computed } from 'vue'
import { namespaces } from '@/extensions/core/resources/namespaces'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNamespace } from '@/composables/useNamespace'

// Live namespace list for the current cluster; the choice lives in ?ns=.
// Phase 3 adds a project view next to it.
const ctx = useExtensionContext()
const { namespace, setNamespace } = useNamespace()

const ALL = '__all__'
const source = computed(() => (ctx.value.cluster ? { cluster: ctx.value.cluster, type: namespaces.type } : null))
const { items, loading } = useLiveList(source)

const options = computed(() => [
  { label: 'All namespaces', value: ALL },
  ...items.value.map((n) => ({ label: n.metadata.name, value: n.metadata.name })),
])
const value = computed(() => namespace.value ?? ALL)
</script>

<template>
  <NSelect
    v-if="ctx.cluster"
    class="ns-selector"
    size="small"
    filterable
    :value="value"
    :options="options"
    :loading="loading"
    :consistent-menu-width="false"
    data-test="namespace-selector"
    @update:value="(v: string) => setNamespace(v === ALL ? null : v)"
  />
</template>

<style scoped>
.ns-selector {
  width: 220px;
}
</style>
