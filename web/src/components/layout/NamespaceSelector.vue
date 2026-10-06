<script setup lang="ts">
import { NSelect, NTooltip } from 'naive-ui'
</script>

<template>
  <!-- Placeholder: namespaces arrive in Phase 1, projects in Phase 3. -->
  <NTooltip>
    <template #trigger>
      <NSelect
        class="ns-selector"
        size="small"
        disabled
        placeholder="All namespaces"
        :options="[]"
      />
    </template>
    Namespace selection arrives with Phase 1.
  </NTooltip>
</template>

<style scoped>
.ns-selector {
  width: 200px;
}
</style>
