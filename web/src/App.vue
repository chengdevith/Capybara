<script setup lang="ts">
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui'

// OCP-style palette: near-black masthead, dark sidebar, blue accents.
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0066cc',
    primaryColorHover: '#004080',
    primaryColorPressed: '#003366',
    primaryColorSuppl: '#0066cc',
    borderRadius: '3px',
  },
  Layout: { siderColorInverted: '#212427' },
  Menu: {
    itemColorActiveInverted: '#4f5255',
    itemColorActiveHoverInverted: '#4f5255',
    itemTextColorActiveInverted: '#fff',
    itemTextColorActiveHoverInverted: '#fff',
  },
}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
:root {
  --capy-masthead-bg: #151515;
  --capy-sider-bg: #212427;
  --capy-content-bg: #f0f0f0;
}
.capy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.capy-plain-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
html,
body {
  margin: 0;
  font-family: 'Red Hat Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
