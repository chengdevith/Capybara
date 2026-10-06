<script setup lang="ts">
import { NButton, NCard, NDescriptions, NDescriptionsItem, NH2, NResult, NSpace } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { expiresInDays } from '@/api/clusters'
import ClusterStatusTag from '@/components/clusters/ClusterStatusTag.vue'
import EditClusterDialog from '@/components/clusters/EditClusterDialog.vue'
import EnvironmentTag from '@/components/clusters/EnvironmentTag.vue'
import RemoveClusterDialog from '@/components/clusters/RemoveClusterDialog.vue'
import ReplaceKubeconfigDialog from '@/components/clusters/ReplaceKubeconfigDialog.vue'
import { age } from '@/components/resource/format'
import { useNow } from '@/composables/useNow'
import { useClustersStore } from '@/stores/clusters'

const route = useRoute()
const router = useRouter()
const clusters = useClustersStore()
const now = useNow()

const id = computed(() => String(route.params.id ?? ''))
const cluster = computed(() => clusters.byId(id.value))
const dialog = ref<'edit' | 'kubeconfig' | 'remove' | null>(null)
const days = computed(() => (cluster.value ? expiresInDays(cluster.value, now.value) : null))
const date = (s?: string) => (s ? new Date(s).toLocaleString() : '—')

function removed() {
  dialog.value = null
  void router.push({ name: 'core.clusters' })
}
</script>

<template>
  <div v-if="cluster">
    <div class="page-header">
      <NH2 class="title">
        {{ cluster.displayName || cluster.id }}
      </NH2>
      <EnvironmentTag :environment="cluster.environment" />
      <ClusterStatusTag :cluster="cluster" />
      <span class="spacer" />
      <NSpace>
        <NButton
          type="primary"
          @click="router.push(`/c/${encodeURIComponent(cluster.id)}`)"
        >
          Open console
        </NButton>
        <NButton
          data-test="edit-cluster"
          @click="dialog = 'edit'"
        >
          Edit
        </NButton>
        <NButton
          data-test="replace-kubeconfig"
          @click="dialog = 'kubeconfig'"
        >
          Replace kubeconfig
        </NButton>
        <NButton
          type="error"
          ghost
          data-test="remove-cluster"
          @click="dialog = 'remove'"
        >
          Remove
        </NButton>
      </NSpace>
    </div>
    <NCard>
      <NDescriptions
        :column="2"
        label-placement="left"
        bordered
      >
        <NDescriptionsItem label="ID">
          {{ cluster.id }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Environment">
          <EnvironmentTag :environment="cluster.environment" />
        </NDescriptionsItem>
        <NDescriptionsItem label="Status">
          <ClusterStatusTag :cluster="cluster" />
        </NDescriptionsItem>
        <NDescriptionsItem label="Reason">
          {{ cluster.status.reason ?? '—' }}
        </NDescriptionsItem>
        <NDescriptionsItem
          label="Message"
          :span="2"
        >
          <span data-test="status-message">{{ cluster.status.message ?? '—' }}</span>
        </NDescriptionsItem>
        <NDescriptionsItem label="Kubernetes">
          {{ cluster.status.version ?? '—' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Nodes">
          {{ cluster.status.nodeCount ?? '—' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Connected as">
          {{ cluster.status.identity ?? '—' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="Credentials expire">
          <span :class="{ warn: days !== null && days < 7 }">
            {{ date(cluster.status.credentialsExpireAt) }}<template v-if="days !== null"> ({{ days < 0 ? 'expired' : `in ${days} day(s)` }})</template>
          </span>
        </NDescriptionsItem>
        <NDescriptionsItem label="Last checked">
          {{ cluster.status.lastChecked ? `${age(cluster.status.lastChecked, now)} ago` : '—' }}
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
    <EditClusterDialog
      v-if="dialog === 'edit'"
      :cluster="cluster"
      @close="dialog = null"
    />
    <ReplaceKubeconfigDialog
      v-if="dialog === 'kubeconfig'"
      :cluster="cluster"
      @close="dialog = null"
    />
    <RemoveClusterDialog
      v-if="dialog === 'remove'"
      :cluster="cluster"
      @close="dialog = null"
      @removed="removed"
    />
  </div>
  <NResult
    v-else-if="clusters.loaded"
    status="404"
    title="Cluster not found"
    :description="`No cluster with id “${id}” is registered.`"
  >
    <template #footer>
      <NButton @click="router.push({ name: 'core.clusters' })">
        All clusters
      </NButton>
    </template>
  </NResult>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.title {
  margin: 0;
}
.spacer {
  flex: 1;
}
.warn {
  color: #d03050;
  font-weight: 600;
}
</style>
