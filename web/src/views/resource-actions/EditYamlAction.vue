<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DetailTabProps } from '@/components/resource/types'
import { detailRouteOf } from '@/components/resource/types'

// Opens the YAML tab of the object's detail page in edit mode.
const props = defineProps<DetailTabProps>()
const emit = defineEmits<{ close: [] }>()
const router = useRouter()

onMounted(async () => {
  const { namespace, name } = props.object.metadata
  await router.push({
    name: detailRouteOf(props.resource),
    params: { cluster: props.cluster, name, ...(props.resource.type.namespaced ? { namespace } : {}) },
    query: { tab: 'core.tab.yaml', edit: '1' },
  })
  emit('close')
})
</script>

<template>
  <span />
</template>
