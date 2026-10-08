<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert, NDescriptions, NDescriptionsItem, NEmpty, NSpin } from 'naive-ui'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { api, getApplication, tag } from './argocd'
import { healthOf, managedBy, shortRevision, syncOf } from './status'

// On a Deployment, Service, ConfigMap or Secret: the Application that
// manages it (from Argo CD's tracking annotation), confirmed by the
// Application's own resource list, with this object's sync and health.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const { ResourceLink } = api().components
const claim = computed(() => managedBy(props.object))
const app = shallowRef<KubeObject | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!claim.value) return
  loading.value = true
  try {
    app.value = await getApplication(props.cluster, claim.value.namespace, claim.value.name)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

interface Res {
  kind: string
  namespace?: string
  name: string
  status?: string
  health?: { status?: string }
}
const entry = computed(() =>
  ((app.value?.status?.resources as Res[] | undefined) ?? []).find(
    (r) => r.kind === (props.object.kind ?? claim.value?.kind) && r.name === props.object.metadata.name && (r.namespace ?? '') === (props.object.metadata.namespace ?? ''),
  ),
)
const selfHeal = computed(() => !!app.value?.spec?.syncPolicy?.automated?.selfHeal)
</script>

<template>
  <div data-test="argocd-gitops-tab">
    <NEmpty
      v-if="!claim"
      description="Not managed by GitOps."
    />
    <NSpin v-else-if="loading" />
    <NAlert
      v-else-if="error || !entry"
      type="warning"
    >
      It is marked as managed by Application {{ claim.namespace }}/{{ claim.name }}, which {{ error ? 'could not be read' : 'does not list it' }}.
    </NAlert>
    <template v-else>
      <NDescriptions
        :column="1"
        label-placement="left"
        bordered
        size="small"
      >
        <NDescriptionsItem label="Application">
          <component
            :is="ResourceLink"
            resource="argocd.applications"
            :namespace="claim.namespace"
            :name="claim.name"
            data-test="gitops-app-link"
          />
        </NDescriptionsItem>
        <NDescriptionsItem label="This object">
          <component :is="tag(entry.status ?? 'Unknown', entry.status === 'Synced' ? 'success' : 'warning', 'gitops-object-sync')" />
          <component
            :is="tag(healthOf(entry).text, healthOf(entry).tone)"
            v-if="entry.health"
            class="space"
          />
        </NDescriptionsItem>
        <NDescriptionsItem label="Application state">
          <component :is="tag(syncOf(app!).text, syncOf(app!).tone)" />
          <component
            :is="tag(healthOf(app!).text, healthOf(app!).tone)"
            class="space"
          />
        </NDescriptionsItem>
        <NDescriptionsItem label="Source">
          {{ app!.spec?.source?.repoURL }} {{ app!.spec?.source?.path ? `· ${app!.spec.source.path}` : '' }} @ {{ shortRevision(app!.status?.sync?.revision) }}
        </NDescriptionsItem>
      </NDescriptions>
      <NAlert
        type="info"
        class="gap"
      >
        Change it in Git. {{ selfHeal ? 'Self-heal is on: changes made here are undone on the next sync.' : 'Changes made here show as OutOfSync and are overwritten by the next sync.' }}
      </NAlert>
    </template>
  </div>
</template>

<style scoped>
.space {
  margin-left: 6px;
}
.gap {
  margin-top: 12px;
}
</style>
