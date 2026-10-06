<script setup lang="ts">
import { NButton, NResult } from 'naive-ui'
</script>

<template>
  <NResult
    status="404"
    title="Page not found"
    description="This page does not exist, or is not available on this cluster."
  >
    <template #footer>
      <NButton @click="$router.push('/')">
        Go home
      </NButton>
    </template>
  </NResult>
</template>
