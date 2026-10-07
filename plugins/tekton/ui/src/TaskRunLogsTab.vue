<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import TaskRunLogs from './TaskRunLogs.vue'

// Logs tab on a TaskRun's detail page.
defineProps<{ cluster: string; object: KubeObject }>()
</script>

<template>
  <div data-test="tekton-taskrun-logs">
    <TaskRunLogs
      :cluster="cluster"
      :task-run="object"
    />
  </div>
</template>
