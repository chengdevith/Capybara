<script setup lang="ts">
import { NButton, NPopselect } from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore, type ThemePreference } from '@/stores/theme'

const theme = useThemeStore()

const options: { label: string; value: ThemePreference }[] = [
  { label: '☀ Light', value: 'light' },
  { label: '☾ Dark', value: 'dark' },
  { label: '◐ System', value: 'system' },
]
const current = computed(() => options.find((o) => o.value === theme.preference)?.label ?? '')
</script>

<template>
  <NPopselect
    :value="theme.preference"
    :options="options"
    trigger="click"
    @update:value="theme.setPreference"
  >
    <NButton
      size="small"
      quaternary
      class="theme-button"
      data-test="theme-switcher"
      :title="`Theme: ${theme.preference}`"
    >
      {{ current }}
    </NButton>
  </NPopselect>
</template>

<style scoped>
.theme-button {
  color: #fff;
}
</style>
