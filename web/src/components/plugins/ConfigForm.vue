<script setup lang="ts">
import { NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch } from 'naive-ui'
import { computed } from 'vue'
import type { ConfigProperty, ConfigSchema } from '@/api/plugins'

// A form for the config schema subset (string/number/integer/boolean,
// enum, default, pattern). The server validates again.
const props = defineProps<{ schema?: ConfigSchema; only?: string[] }>()
const model = defineModel<Record<string, unknown>>({ required: true })

const fields = computed(() =>
  Object.entries(props.schema?.properties ?? {}).filter(([k]) => !props.only || props.only.includes(k)),
)
function invalid(key: string, p: ConfigProperty): string | undefined {
  const v = model.value[key]
  if (p.type === 'string' && typeof v === 'string' && v && p.pattern && !new RegExp(p.pattern).test(v)) return `must match ${p.pattern}`
  if (props.schema?.required?.includes(key) && (v === undefined || v === '')) return 'required'
  return undefined
}
function set(key: string, v: unknown) {
  model.value = { ...model.value, [key]: v }
}
</script>

<template>
  <NForm
    label-placement="left"
    label-width="160"
  >
    <NFormItem
      v-for="[key, p] in fields"
      :key="key"
      :label="p.title ?? key"
      :feedback="invalid(key, p) ?? p.description"
      :validation-status="invalid(key, p) ? 'error' : undefined"
    >
      <NSelect
        v-if="p.enum"
        :value="(model[key] ?? p.default) as string"
        :options="p.enum.map((e) => ({ label: String(e), value: e as string }))"
        :data-test="`config-${key}`"
        @update:value="(v) => set(key, v)"
      />
      <NSwitch
        v-else-if="p.type === 'boolean'"
        :value="(model[key] ?? p.default ?? false) as boolean"
        @update:value="(v) => set(key, v)"
      />
      <NInputNumber
        v-else-if="p.type === 'number' || p.type === 'integer'"
        :value="(model[key] ?? p.default) as number"
        :min="p.minimum"
        :max="p.maximum"
        @update:value="(v) => set(key, v)"
      />
      <NInput
        v-else
        :value="(model[key] ?? '') as string"
        :placeholder="p.default !== undefined ? String(p.default) : ''"
        :data-test="`config-${key}`"
        @update:value="(v) => set(key, v)"
      />
    </NFormItem>
  </NForm>
</template>
