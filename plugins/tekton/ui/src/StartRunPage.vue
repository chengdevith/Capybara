<script setup lang="ts">
import { pluginObjects, PluginRequestError, useCluster, useNavigate, useParams, useQuery, type ObjectProblem } from '@capybara/sdk'
import { NAlert, NButton, NCard, NDynamicTags, NForm, NFormItem, NH2, NInput, NInputNumber, NRadioButton, NRadioGroup, NSelect, NSpace, NSpin } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { api, isProjectNamespace, loadProjects, PLUGIN } from './tekton'

// Start a run of a Pipeline from a form generated from its params.
// Workspaces: emptyDir, a volume claim sized within what is left of the
// Project's storage quota, or a ConfigMap. Runs always use the Project's
// "pipeline" ServiceAccount (Capybara's server enforces it).
interface ParamSpec {
  name: string
  type?: 'string' | 'array' | 'object'
  description?: string
  default?: unknown
}
interface WorkspaceSpec {
  name: string
  description?: string
  optional?: boolean
}
interface WorkspaceChoice {
  kind: 'emptyDir' | 'volumeClaimTemplate' | 'configMap' | 'none'
  sizeGi: number
  configMap: string
}

const { ResourceLink } = api().components
const cluster = useCluster()
const params = useParams()
const query = useQuery()
const navigate = useNavigate()
const ns = computed(() => params.value.namespace ?? '')
const pipeline = computed(() => params.value.name ?? '')

const loading = ref(true)
const loadError = ref<string | null>(null)
const specParams = ref<ParamSpec[]>([])
const specWorkspaces = ref<WorkspaceSpec[]>([])
const values = reactive<Record<string, string | string[]>>({})
const workspaces = reactive<Record<string, WorkspaceChoice>>({})
const configMaps = ref<string[]>([])
const storageLeft = ref<string | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)
const problems = ref<ObjectProblem[]>([])
const warnings = ref<string[]>([])

const k8s = (path: string) => `/api/clusters/${encodeURIComponent(cluster.value ?? '')}/k8s/${path}`
async function getJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  return res.ok ? ((await res.json()) as T) : null
}

onMounted(async () => {
  void loadProjects(true)
  try {
    const p = await getJSON<{ spec?: { params?: ParamSpec[]; workspaces?: WorkspaceSpec[] } }>(
      k8s(`apis/tekton.dev/v1/namespaces/${encodeURIComponent(ns.value)}/pipelines/${encodeURIComponent(pipeline.value)}`))
    if (!p) throw new Error(`Pipeline ${pipeline.value} could not be loaded`)
    specParams.value = p.spec?.params ?? []
    specWorkspaces.value = p.spec?.workspaces ?? []
    // Prefill from an earlier run (?from=<run>), else the defaults.
    let earlier: Record<string, unknown> = {}
    if (query.value.from) {
      const run = await getJSON<{ spec?: { params?: { name: string; value: unknown }[] } }>(
        k8s(`apis/tekton.dev/v1/namespaces/${encodeURIComponent(ns.value)}/pipelineruns/${encodeURIComponent(query.value.from)}`))
      earlier = Object.fromEntries((run?.spec?.params ?? []).map((x) => [x.name, x.value]))
    }
    for (const sp of specParams.value) {
      const v = earlier[sp.name] ?? sp.default
      values[sp.name] = sp.type === 'array' ? ((v as string[] | undefined) ?? []) : v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v)
    }
    for (const w of specWorkspaces.value) workspaces[w.name] = { kind: w.optional ? 'none' : 'emptyDir', sizeGi: 1, configMap: '' }
    const cms = await getJSON<{ items: { metadata: { name: string } }[] }>(k8s(`api/v1/namespaces/${encodeURIComponent(ns.value)}/configmaps`))
    configMaps.value = (cms?.items ?? []).map((c) => c.metadata.name).filter((n) => n !== 'kube-root-ca.crt').sort()
    const quotas = await getJSON<{ items: { status?: { hard?: Record<string, string>; used?: Record<string, string> } }[] }>(
      k8s(`api/v1/namespaces/${encodeURIComponent(ns.value)}/resourcequotas`))
    const q = quotas?.items.find((x) => x.status?.hard?.['requests.storage'])
    if (q) storageLeft.value = `${q.status!.used?.['requests.storage'] ?? '0'} of ${q.status!.hard!['requests.storage']} used`
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

const inProject = computed(() => isProjectNamespace(ns.value, cluster.value))
const missing = computed(() => specParams.value.filter((p) => p.default === undefined && (values[p.name] === '' || (Array.isArray(values[p.name]) && !(values[p.name] as string[]).length))).map((p) => p.name))

function run(): Record<string, unknown> {
  const runParams = specParams.value.map((p) => {
    const v = values[p.name]
    if (p.type === 'object' && typeof v === 'string') {
      try {
        return { name: p.name, value: JSON.parse(v) as unknown }
      } catch {
        return { name: p.name, value: v }
      }
    }
    return { name: p.name, value: v }
  })
  const ws = Object.entries(workspaces).filter(([, c]) => c.kind !== 'none').map(([name, c]) => {
    if (c.kind === 'emptyDir') return { name, emptyDir: {} }
    if (c.kind === 'configMap') return { name, configMap: { name: c.configMap } }
    return { name, volumeClaimTemplate: { spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: `${c.sizeGi}Gi` } } } } }
  })
  return {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: { generateName: `${pipeline.value.slice(0, 50)}-` },
    spec: { pipelineRef: { name: pipeline.value }, params: runParams, workspaces: ws },
  }
}

async function start() {
  if (!cluster.value) return
  busy.value = true
  error.value = null
  problems.value = []
  try {
    const res = await pluginObjects.create(cluster.value, PLUGIN, 'pipelineruns', ns.value, run())
    const name = (res.object.metadata as { name: string }).name
    await navigate({ name: 'tekton.pipelineruns.detail', params: { cluster: cluster.value, namespace: ns.value, name } })
  } catch (e) {
    if (e instanceof PluginRequestError) {
      error.value = e.message
      problems.value = e.problems
      warnings.value = e.warnings
    } else {
      error.value = e instanceof Error ? e.message : String(e)
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div data-test="tekton-start">
    <NH2 class="title">
      Start a run of
      <component
        :is="ResourceLink"
        resource="tekton.pipelines"
        :namespace="ns"
        :name="pipeline"
      />
    </NH2>
    <NSpin v-if="loading" />
    <NAlert
      v-else-if="loadError"
      type="error"
    >
      {{ loadError }}
    </NAlert>
    <NAlert
      v-else-if="!inProject"
      type="warning"
    >
      {{ ns }} is not a Project namespace: runs can be started only in Projects.
    </NAlert>
    <NCard
      v-else
      size="small"
    >
      <NForm label-placement="top">
        <h4 v-if="specParams.length">
          Parameters
        </h4>
        <NFormItem
          v-for="p in specParams"
          :key="p.name"
          :label="p.name + (p.default === undefined ? ' (required)' : '')"
          :feedback="p.description"
        >
          <NDynamicTags
            v-if="p.type === 'array'"
            v-model:value="values[p.name] as string[]"
            :data-test="`param-${p.name}`"
          />
          <NInput
            v-else
            v-model:value="values[p.name] as string"
            :type="p.type === 'object' ? 'textarea' : 'text'"
            :placeholder="p.type === 'object' ? '{&quot;key&quot;: &quot;value&quot;}' : ''"
            :data-test="`param-${p.name}`"
          />
        </NFormItem>

        <h4 v-if="specWorkspaces.length">
          Workspaces
        </h4>
        <NFormItem
          v-for="w in specWorkspaces"
          :key="w.name"
          :label="w.name + (w.optional ? ' (optional)' : '')"
          :feedback="w.description"
        >
          <NSpace
            vertical
            :data-test="`workspace-${w.name}`"
          >
            <NRadioGroup
              v-model:value="workspaces[w.name]!.kind"
              size="small"
            >
              <NRadioButton
                v-if="w.optional"
                value="none"
              >
                None
              </NRadioButton>
              <NRadioButton value="emptyDir">
                Empty directory
              </NRadioButton>
              <NRadioButton value="volumeClaimTemplate">
                New volume
              </NRadioButton>
              <NRadioButton
                value="configMap"
                :disabled="!configMaps.length"
              >
                ConfigMap
              </NRadioButton>
            </NRadioGroup>
            <NSpace
              v-if="workspaces[w.name]!.kind === 'volumeClaimTemplate'"
              align="center"
            >
              <NInputNumber
                v-model:value="workspaces[w.name]!.sizeGi"
                :min="1"
                :max="100"
                size="small"
              >
                <template #suffix>
                  Gi
                </template>
              </NInputNumber>
              <span
                v-if="storageLeft"
                class="muted"
              >Project storage: {{ storageLeft }}</span>
            </NSpace>
            <NSelect
              v-if="workspaces[w.name]!.kind === 'configMap'"
              v-model:value="workspaces[w.name]!.configMap"
              :options="configMaps.map((c) => ({ label: c, value: c }))"
              size="small"
              class="select"
            />
          </NSpace>
        </NFormItem>
      </NForm>
      <NAlert
        type="info"
        :bordered="false"
        class="gap"
      >
        The run uses the Project's <code>pipeline</code> ServiceAccount, which has no permissions and no API token.
      </NAlert>
      <NAlert
        v-if="error"
        type="error"
        class="gap"
        data-test="start-error"
      >
        {{ error }}
        <ul v-if="problems.length">
          <li
            v-for="p in problems"
            :key="p.path + p.message"
          >
            <code v-if="p.path">{{ p.path }}</code> {{ p.message }}
          </li>
        </ul>
      </NAlert>
      <NAlert
        v-if="warnings.length"
        type="warning"
        class="gap"
      >
        <div
          v-for="w in warnings"
          :key="w"
        >
          {{ w }}
        </div>
      </NAlert>
      <NSpace
        justify="end"
        class="gap"
      >
        <NButton
          type="primary"
          :loading="busy"
          :disabled="missing.length > 0"
          data-test="start-submit"
          @click="start"
        >
          Start run
        </NButton>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 16px;
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.gap {
  margin-top: 12px;
}
.select {
  width: 260px;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
}
h4 {
  margin: 4px 0 8px;
}
</style>
