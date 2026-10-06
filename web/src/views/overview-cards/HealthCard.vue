<script setup lang="ts">
import { NAlert, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { computed } from 'vue'
import { expiresInDays, type ClusterOverview } from '@/api/clusters'
import ClusterStatusTag from '@/components/clusters/ClusterStatusTag.vue'
import { age } from '@/components/resource/format'
import { useNow } from '@/composables/useNow'
import { useClustersStore } from '@/stores/clusters'

const props = defineProps<{ cluster: string; overview: ClusterOverview | null }>()
const clusters = useClustersStore()
const now = useNow()
const c = computed(() => clusters.byId(props.cluster))
const days = computed(() => (c.value ? expiresInDays(c.value, now.value) : null))
</script>

<template>
  <div v-if="c">
    <NDescriptions
      :column="1"
      label-placement="left"
      size="small"
    >
      <NDescriptionsItem label="Status">
        <ClusterStatusTag :cluster="c" />
      </NDescriptionsItem>
      <NDescriptionsItem label="Kubernetes">
        {{ c.status.version ?? '—' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Connected as">
        {{ c.status.identity ?? '—' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Credentials expire">
        <span :class="{ warn: days !== null && days < 7 }">
          {{ days === null ? 'never' : days < 0 ? 'expired' : `in ${days} day(s)` }}
        </span>
      </NDescriptionsItem>
      <NDescriptionsItem label="Last checked">
        {{ c.status.lastChecked ? `${age(c.status.lastChecked, now)} ago` : '—' }}
      </NDescriptionsItem>
    </NDescriptions>
    <NAlert
      v-if="c.status.phase === 'Error' && c.status.message"
      type="error"
      :show-icon="false"
      class="msg"
    >
      {{ c.status.message }}
    </NAlert>
  </div>
</template>

<style scoped>
.warn {
  font-weight: 600;
  color: #d03050;
}
.msg {
  margin-top: 8px;
}
</style>
