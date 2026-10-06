<script setup lang="ts">
import { NTag } from 'naive-ui'

// prod is always red so nobody mistakes it for a dev cluster.
defineProps<{ environment: string; size?: 'small' | 'medium' }>()
</script>

<template>
  <NTag
    :size="size ?? 'small'"
    :type="environment === 'prod' ? 'error' : environment === 'uat' ? 'warning' : 'info'"
    :bordered="environment === 'prod'"
    :strong="environment === 'prod'"
    :data-test="`env-${environment}`"
  >
    {{ environment || '—' }}
  </NTag>
</template>
