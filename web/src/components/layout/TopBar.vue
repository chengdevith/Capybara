<script setup lang="ts">
import logo from '@/assets/logo.png'
import ClusterSwitcher from './ClusterSwitcher.vue'
import NamespaceSelector from './NamespaceSelector.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
</script>

<template>
  <div class="topbar">
    <RouterLink
      to="/"
      class="brand"
    >
      <img
        :src="logo"
        alt=""
        class="logo"
        width="32"
        height="32"
      >
      <span>Capybara</span>
    </RouterLink>
    <ClusterSwitcher />
    <NamespaceSelector />
    <span class="spacer" />
    <ThemeSwitcher />
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  margin-right: 8px;
}
.logo {
  display: block;
}
.spacer {
  flex: 1;
}
</style>
