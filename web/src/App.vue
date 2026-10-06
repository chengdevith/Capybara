<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

// OCP-style palette: near-black masthead and dark sidebar in both modes,
// blue accents (lighter in dark mode so links stay readable).
const shared: GlobalThemeOverrides = {
  Layout: { siderColorInverted: '#212427' },
  Menu: {
    itemColorActiveInverted: '#4f5255',
    itemColorActiveHoverInverted: '#4f5255',
    itemTextColorActiveInverted: '#fff',
    itemTextColorActiveHoverInverted: '#fff',
  },
}
const light: GlobalThemeOverrides = {
  ...shared,
  common: {
    primaryColor: '#0066cc',
    primaryColorHover: '#004080',
    primaryColorPressed: '#003366',
    primaryColorSuppl: '#0066cc',
    borderRadius: '3px',
  },
}
const dark: GlobalThemeOverrides = {
  ...shared,
  common: {
    primaryColor: '#73bcf7',
    primaryColorHover: '#9fd3ff',
    primaryColorPressed: '#4d9fe0',
    primaryColorSuppl: '#73bcf7',
    borderRadius: '3px',
  },
}

const naiveTheme = computed(() => (theme.isDark ? darkTheme : null))
const overrides = computed(() => (theme.isDark ? dark : light))
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="overrides"
  >
    <NGlobalStyle />
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
/* Colors that are ours rather than Naive UI's. The theme store sets
   data-theme on <html>. */
:root {
  --capy-masthead-bg: #151515;
  --capy-sider-bg: #212427;
  --capy-content-bg: #f0f0f0;
  --capy-text-muted: #6a6e73;
  --capy-border: #d2d2d2;
  --capy-link: #0066cc;
  color-scheme: light;
}
:root[data-theme='dark'] {
  --capy-content-bg: #1b1d21;
  --capy-text-muted: #a3a6aa;
  --capy-border: #3c3f42;
  --capy-link: #73bcf7;
  color-scheme: dark;
}
a {
  color: var(--capy-link);
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
