<script setup lang="ts">
import { NButton } from 'naive-ui'
import logo from '@/assets/logo.png'
import { useUiStore } from '@/stores/ui'
import ClusterSwitcher from './ClusterSwitcher.vue'
import { mastheadButtonTheme } from './masthead'
import NamespaceSelector from './NamespaceSelector.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const ui = useUiStore()
</script>

<template>
  <div class="topbar">
    <NButton
      quaternary
      circle
      text-color="#ffffff"
      :theme-overrides="mastheadButtonTheme"
      class="menu-toggle masthead-button"
      native-focus-behavior
      :aria-label="ui.sidebarCollapsed ? 'Show the sidebar' : 'Hide the sidebar'"
      :aria-expanded="!ui.sidebarCollapsed"
      :title="ui.sidebarCollapsed ? 'Show the sidebar' : 'Hide the sidebar'"
      data-test="sidebar-toggle"
      @click="ui.toggleSidebar()"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </NButton>
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
      <span class="brand-name">Capybara</span>
    </RouterLink>
    <div class="selectors">
      <ClusterSwitcher />
      <NamespaceSelector />
    </div>
    <span class="spacer" />
    <ThemeSwitcher />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 12px;
  min-width: 0;
}
.menu-toggle {
  color: #fff;
  flex: none;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  margin-right: 4px;
  flex: none;
}
.logo {
  display: block;
}
.selectors {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
}
.spacer {
  flex: 1;
}
/* Narrow windows: drop the brand name, let the selectors shrink. */
@media (max-width: 900px) {
  .brand-name {
    display: none;
  }
  .selectors {
    gap: 6px;
  }
}
</style>

<style>
/* Masthead buttons (see masthead.ts). Naive keeps the hover colour while a
   button has focus, and by default focuses it from script on mouse down,
   which the browser counts as keyboard-like (:focus-visible): a click left
   it highlighted until the next click elsewhere. With
   native-focus-behavior the browser tells mouse from keyboard focus, and
   only keyboard focus is shown, as a ring. */
.masthead-button:focus:not(:focus-visible):not(:hover) {
  background-color: transparent !important;
}
.masthead-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.7);
  outline-offset: 1px;
}
</style>
