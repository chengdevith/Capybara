<script setup lang="ts">
import { onErrorCaptured, ref, shallowRef, watch } from 'vue'
import { extensionComponent } from '@/extensions/host'
import type { LazyComponent } from '@/extensions'
import ExtensionError from './ExtensionError.vue'

// Renders one extension's component. Failing to load it, or an error while
// rendering it, shows an error in its place instead of a blank area.
// Attributes are passed through to the component.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ id: string; source: string; label: string; component: LazyComponent }>()

const error = shallowRef<unknown>(null)
const key = ref(0)
watch(
  () => props.id,
  () => {
    error.value = null
    key.value++
  },
)
onErrorCaptured((err) => {
  error.value = err
  return false // handled: do not take the page down
})
</script>

<template>
  <ExtensionError
    v-if="error"
    :label="label"
    :source="source"
    :error="error"
  />
  <component
    :is="extensionComponent(id, component)"
    v-else
    :key="key"
    v-bind="$attrs"
  />
</template>
