<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import Refresh from './Refresh.vue'

defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Refresh
    :cluster="cluster"
    :object="object"
    hard
    @close="emit('close')"
  />
</template>
