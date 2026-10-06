<script setup lang="ts">
import { NCard, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { computed } from 'vue'
import { age } from '@/components/resource/format'
import { labelTags } from '@/components/resource/render'
import type { DetailTabProps } from '@/components/resource/types'
import { useNow } from '@/composables/useNow'

const props = defineProps<DetailTabProps>()
const now = useNow()
const meta = computed(() => props.object.metadata)
const annotations = computed(() =>
  Object.entries(meta.value.annotations ?? {}).filter(([k]) => k !== 'kubectl.kubernetes.io/last-applied-configuration'),
)
const owners = computed(() => (meta.value.ownerReferences ?? []).map((o) => `${o.kind} ${o.name}`).join(', '))
</script>

<template>
  <div class="overview">
    <NCard
      title="Details"
      size="small"
      embedded
    >
      <NDescriptions
        :column="1"
        label-placement="left"
        label-align="right"
        size="small"
      >
        <NDescriptionsItem label="Name">
          {{ meta.name }}
        </NDescriptionsItem>
        <NDescriptionsItem
          v-if="meta.namespace"
          label="Namespace"
        >
          {{ meta.namespace }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Created">
          {{ meta.creationTimestamp }} ({{ age(meta.creationTimestamp, now) }} ago)
        </NDescriptionsItem>
        <NDescriptionsItem
          v-if="owners"
          label="Owner"
        >
          {{ owners }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Labels">
          <component :is="labelTags(meta.labels)" />
        </NDescriptionsItem>
        <NDescriptionsItem label="Annotations">
          <span v-if="annotations.length === 0">—</span>
          <ul
            v-else
            class="capy-plain-list"
          >
            <li
              v-for="[k, v] in annotations"
              :key="k"
            >
              <strong>{{ k }}</strong>: <span class="value">{{ v }}</span>
            </li>
          </ul>
        </NDescriptionsItem>
        <NDescriptionsItem label="UID">
          <code>{{ meta.uid }}</code>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>

    <NCard
      v-if="resource.overview?.length"
      :title="resource.singular"
      size="small"
      embedded
    >
      <NDescriptions
        :column="1"
        label-placement="left"
        label-align="right"
        size="small"
      >
        <NDescriptionsItem
          v-for="f in resource.overview"
          :key="f.label"
          :label="f.label"
        >
          <component :is="() => f.render(object)" />
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </div>
</template>

<style scoped>
.overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 16px;
}
.value {
  word-break: break-all;
}
</style>
