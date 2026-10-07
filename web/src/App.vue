<script setup lang="ts">
import { NConfigProvider, NDialogProvider, NGlobalStyle, NMessageProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

// Capybara palette, taken from the logo: caramel (body #c39b6e) as the
// brand color, the logo's charcoal (eyes #464655) for the masthead and
// sidebar, warm neutrals for the content. Light mode uses a deeper caramel
// so white text on buttons stays readable (WCAG AA); dark mode uses the
// lighter caramel on charcoal.
const brand = {
  caramel: '#c39b6e', // logo body
  caramelDeep: '#8a5f36', // light-mode primary (5.6:1 with white)
  caramelLight: '#d4ad80', // dark-mode primary (8:1 on the dark background)
  charcoal: '#2e2d38', // masthead
  charcoalSider: '#33323d', // sidebar
  charcoalActive: '#4a4858', // selected sidebar item
}
const shared: GlobalThemeOverrides = {
  Layout: { siderColorInverted: brand.charcoalSider },
  Menu: {
    itemColorActiveInverted: brand.charcoalActive,
    itemColorActiveHoverInverted: brand.charcoalActive,
    itemTextColorActiveInverted: '#e0bd92',
    itemTextColorActiveHoverInverted: '#e0bd92',
    itemIconColorActiveInverted: '#e0bd92',
    itemTextColorChildActiveInverted: '#e0bd92',
    arrowColorChildActiveInverted: '#e0bd92',
  },
}
const light: GlobalThemeOverrides = {
  ...shared,
  common: {
    primaryColor: brand.caramelDeep,
    primaryColorHover: '#9a6b3f',
    primaryColorPressed: '#6f4b29',
    primaryColorSuppl: '#9a6b3f',
    bodyColor: '#f7f3ee',
    borderRadius: '4px',
  },
}
const dark: GlobalThemeOverrides = {
  ...shared,
  common: {
    primaryColor: brand.caramelLight,
    primaryColorHover: '#e0bd92',
    primaryColorPressed: brand.caramel,
    primaryColorSuppl: '#e0bd92',
    bodyColor: '#1d1c23',
    cardColor: '#26252e',
    modalColor: '#26252e',
    popoverColor: '#2c2b35',
    borderRadius: '4px',
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
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
/* Colors that are ours rather than Naive UI's. The theme store sets
   data-theme on <html>. */
:root {
  --capy-masthead-bg: #2e2d38;
  --capy-sider-bg: #33323d;
  --capy-content-bg: #f7f3ee;
  --capy-text-muted: #6b6875;
  --capy-border: #e2d9cd;
  --capy-link: #8a5f36;
  --capy-console-bg: #1d1c23;
  --capy-console-fg: #e6e1da;
  color-scheme: light;
}
:root[data-theme='dark'] {
  --capy-content-bg: #1d1c23;
  --capy-text-muted: #a8a5b0;
  --capy-border: #3d3b47;
  --capy-link: #d4ad80;
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
