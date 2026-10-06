<script setup lang="ts">
import ClusterSwitcher from './ClusterSwitcher.vue'
import NamespaceSelector from './NamespaceSelector.vue'
</script>

<template>
  <div class="topbar">
    <RouterLink
      to="/"
      class="brand"
    >
      Capybara
    </RouterLink>
    <ClusterSwitcher />
    <NamespaceSelector />
    <span class="spacer" />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  padding: 0 16px;
}
.brand {
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  margin-right: 8px;
}
.spacer {
  flex: 1;
}
</style>
