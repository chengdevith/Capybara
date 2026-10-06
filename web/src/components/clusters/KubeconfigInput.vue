<script setup lang="ts">
import { NAlert, NButton, NDescriptions, NDescriptionsItem, NInput, NList, NListItem, NSpace, NTag } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { ApiError } from '@/api/client'
import { testKubeconfig, validateKubeconfig, type KubeconfigSummary, type TestResult } from '@/api/clusters'

// Paste or pick a kubeconfig, then Parse (validated on the server) and
// Test connection. The text stays in this component and in the requests;
// it is never logged or stored in the browser.
const emit = defineEmits<{ change: [state: { kubeconfig: string; summary: KubeconfigSummary | null; test: TestResult | null }] }>()

const MAX_BYTES = 256 * 1024
const text = ref('')
const summary = ref<KubeconfigSummary | null>(null)
const problems = ref<string[]>([])
const test = ref<TestResult | null>(null)
const busy = ref<'parse' | 'test' | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Any edit invalidates what was learned about the old text.
watch(text, () => {
  summary.value = null
  test.value = null
  problems.value = []
})
watch([summary, test], () => emit('change', { kubeconfig: text.value, summary: summary.value, test: test.value }))

function fail(e: unknown) {
  if (e instanceof ApiError && Array.isArray(e.body.problems)) problems.value = e.body.problems as string[]
  else problems.value = [e instanceof Error ? e.message : String(e)]
}

async function parse() {
  busy.value = 'parse'
  problems.value = []
  try {
    summary.value = await validateKubeconfig(text.value)
  } catch (e) {
    fail(e)
  } finally {
    busy.value = null
  }
}

async function runTest() {
  busy.value = 'test'
  try {
    test.value = await testKubeconfig(text.value)
  } catch (e) {
    fail(e)
  } finally {
    busy.value = null
  }
}

async function pick(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > MAX_BYTES) {
    problems.value = [`file is larger than ${MAX_BYTES / 1024} KiB`]
    return
  }
  text.value = await file.text()
  ;(ev.target as HTMLInputElement).value = ''
  await parse()
}

const expires = computed(() => (summary.value?.expiresAt ? new Date(summary.value.expiresAt).toLocaleString() : 'never'))
</script>

<template>
  <div class="kubeconfig-input">
    <NInput
      v-model:value="text"
      type="textarea"
      :rows="8"
      placeholder="Paste a kubeconfig (one context, credentials inline)"
      :input-props="{ spellcheck: false, autocomplete: 'off' }"
      class="mono"
      data-test="kubeconfig"
    />
    <NSpace class="buttons">
      <NButton @click="fileInput?.click()">
        Choose file…
      </NButton>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        data-test="kubeconfig-file"
        @change="pick"
      >
      <NButton
        :disabled="!text.trim()"
        :loading="busy === 'parse'"
        data-test="parse"
        @click="parse"
      >
        Parse
      </NButton>
      <NButton
        :disabled="!summary"
        :loading="busy === 'test'"
        type="primary"
        secondary
        data-test="test-connection"
        @click="runTest"
      >
        Test connection
      </NButton>
    </NSpace>

    <NAlert
      v-if="problems.length"
      type="error"
      title="Kubeconfig rejected"
      data-test="kubeconfig-problems"
    >
      <ul class="problems">
        <li
          v-for="p in problems"
          :key="p"
        >
          {{ p }}
        </li>
      </ul>
    </NAlert>

    <NDescriptions
      v-if="summary"
      :column="2"
      label-placement="left"
      size="small"
      bordered
      data-test="kubeconfig-summary"
    >
      <NDescriptionsItem label="Context">
        {{ summary.context }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Server">
        {{ summary.server }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Auth">
        {{ summary.authMethod }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Identity">
        {{ summary.identity || '—' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="CA included">
        {{ summary.caIncluded ? 'yes' : 'no (system roots)' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="Expires">
        {{ expires }}
      </NDescriptionsItem>
    </NDescriptions>
    <NAlert
      v-for="w in summary?.warnings ?? []"
      :key="w"
      type="warning"
      :show-icon="false"
    >
      {{ w }}
    </NAlert>

    <template v-if="test">
      <NAlert
        v-if="!test.ok"
        type="error"
        :title="test.reason"
        data-test="test-failed"
      >
        {{ test.message }}
      </NAlert>
      <template v-else>
        <NAlert
          type="success"
          :title="`Connected as ${test.identity}`"
          data-test="test-ok"
        >
          Kubernetes {{ test.version ?? 'unknown' }}<span v-if="test.nodeCount !== undefined">, {{ test.nodeCount }} node(s)</span>
        </NAlert>
        <NAlert
          v-if="test.clusterAdmin"
          type="warning"
          title="These credentials are cluster-admin"
          data-test="cluster-admin-warning"
        >
          Capybara does not need cluster-admin. Prefer a ServiceAccount kubeconfig from
          <code>make sa-kubeconfig CLUSTER=…</code>.
        </NAlert>
        <NList
          size="small"
          bordered
        >
          <NListItem
            v-for="c in test.checks ?? []"
            :key="c.name"
          >
            <NTag
              size="small"
              :bordered="false"
              :type="c.allowed ? 'success' : 'default'"
            >
              {{ c.allowed ? 'allowed' : 'not allowed' }}
            </NTag>
            {{ c.name }}
          </NListItem>
        </NList>
      </template>
    </template>
  </div>
</template>

<style scoped>
.kubeconfig-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mono :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}
.hidden {
  display: none;
}
.problems {
  margin: 0;
  padding-left: 18px;
}
</style>
