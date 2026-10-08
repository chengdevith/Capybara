<script setup lang="ts">
import { NButton, NPopselect, type SelectOption } from 'naive-ui'
import { computed, h, type Component, type VNodeChild } from 'vue'
import LightModeIcon from '@/components/icons/LightModeIcon.vue'
import { useThemeStore, type ThemePreference } from '@/stores/theme'
import { mastheadButtonTheme } from './masthead'

const theme = useThemeStore()

interface ThemeOption {
  label: string
  value: ThemePreference
  /** SVG icon component, or a text glyph until one is provided. */
  icon: Component | string
}

const options: ThemeOption[] = [
  { label: 'Light', value: 'light', icon: LightModeIcon },
  { label: 'Dark', value: 'dark', icon: '☾' },
  { label: 'System', value: 'system', icon: '◐' },
]

const selectOptions: SelectOption[] = options.map(({ label, value }) => ({ label, value }))

function iconOf(o: ThemeOption): VNodeChild {
  return h('span', { class: 'theme-icon' }, typeof o.icon === 'string' ? o.icon : [h(o.icon)])
}

const current = computed(() => options.find((o) => o.value === theme.preference) ?? options[2]!)

const renderLabel = (option: SelectOption) => {
  const o = options.find((x) => x.value === option.value)!
  return h('span', { class: 'theme-option' }, [iconOf(o), o.label])
}
</script>

<template>
  <NPopselect
    :value="theme.preference"
    :options="selectOptions"
    :render-label="renderLabel"
    trigger="click"
    @update:value="theme.setPreference"
  >
    <NButton
      size="small"
      quaternary
      :theme-overrides="mastheadButtonTheme"
      class="theme-button masthead-button"
      native-focus-behavior
      data-test="theme-switcher"
      :title="`Theme: ${current.label}`"
    >
      <span class="theme-option">
        <component :is="() => iconOf(current)" />
        {{ current.label }}
      </span>
    </NButton>
  </NPopselect>
</template>

<style scoped>
.theme-button {
  color: #fff;
}
</style>

<style>
/* Unscoped: also used inside the popselect menu, which renders in a portal. */
.theme-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.theme-icon {
  display: inline-flex;
  width: 18px;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}
</style>
