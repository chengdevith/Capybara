<script setup lang="ts">
import { NEmpty, NTag } from 'naive-ui'
import type { PolicyRule } from '@/api/plugins'

defineProps<{ rules?: PolicyRule[]; scope: string }>()
const res = (r: PolicyRule) => (r.resources ?? []).map((x) => (r.apiGroups?.[0] ? `${x}.${r.apiGroups[0]}` : x)).join(', ')
</script>

<template>
  <NEmpty
    v-if="!rules?.length"
    size="small"
    description="none"
  />
  <ul
    v-else
    class="rules"
  >
    <li
      v-for="(r, i) in rules"
      :key="i"
    >
      <NTag
        v-for="v in r.verbs"
        :key="v"
        size="tiny"
        :bordered="false"
        :type="['escalate', 'bind', 'delete', '*'].includes(v) ? 'warning' : 'default'"
      >
        {{ v }}
      </NTag>
      {{ res(r) }}
      <span
        v-if="r.resourceNames?.length"
        class="names"
      >only {{ r.resourceNames.join(', ') }}</span>
      <span class="scope">({{ scope }})</span>
    </li>
  </ul>
</template>

<style scoped>
.rules {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
}
.rules li {
  margin: 2px 0;
}
.names,
.scope {
  opacity: 0.7;
  margin-left: 4px;
}
</style>
