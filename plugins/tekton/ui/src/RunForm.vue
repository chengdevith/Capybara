<script setup lang="ts">
import { pluginObjects, PluginRequestError, useCluster, useNavigate, useQuery, type ObjectProblem } from '@capybara/sdk'
import {
  NAlert, NButton, NCard, NDynamicTags, NForm, NFormItem, NH2, NInput, NInputNumber, NRadioButton, NRadioGroup,
  NSelect, NSpace, NSpin, NSwitch,
} from 'naive-ui'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api, isProjectNamespace, loadProjects, PLUGIN, projectNamespaces } from './tekton'

// Create PipelineRun / Create TaskRun: pick a Pipeline (or Task) in a
// Project namespace, then its params, workspaces and timeout, or switch to
// YAML. One form and one server endpoint for every way of starting a run
// ("Start" on a Pipeline opens it with the Pipeline chosen). Capybara's
// server checks it (policy, the Project's pipeline ServiceAccount,
// workspaces within quota, a dry run); Tekton starts it immediately.
const props = defineProps<{ kind: 'pipelineruns' | 'taskruns' }>()

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
type WorkspaceKind = 'none' | 'emptyDir' | 'volumeClaimTemplate' | 'configMap' | 'secret'
interface WorkspaceChoice {
  kind: WorkspaceKind
  sizeGi: number
  configMap: string
}

const { YamlEditor } = api().components
const yaml = api().yaml
const cluster = useCluster()
const query = useQuery()
const navigate = useNavigate()

const forPipeline = computed(() => props.kind === 'pipelineruns')
const sourceKind = computed(() => (forPipeline.value ? 'Pipeline' : 'Task'))
const sourcePlural = computed(() => (forPipeline.value ? 'pipelines' : 'tasks'))
const runKind = computed(() => (forPipeline.value ? 'PipelineRun' : 'TaskRun'))

const namespace = ref(query.value.ns ?? '')
const namespaces = computed(() => (cluster.value ? projectNamespaces(cluster.value) : []))
const inProject = computed(() => isProjectNamespace(namespace.value, cluster.value))
const sources = ref<string[]>([])
const source = ref<string | null>(query.value.pipeline ?? query.value.task ?? null)
const loadingSpec = ref(false)
const specParams = ref<ParamSpec[]>([])
const specWorkspaces = ref<WorkspaceSpec[]>([])
const values = reactive<Record<string, string | string[]>>({})
const workspaces = reactive<Record<string, WorkspaceChoice>>({})
const configMaps = ref<string[]>([])
const storageUse = ref<string | null>(null)
const timeoutMinutes = ref<number | null>(null)

const yamlView = ref(false)
const yamlText = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const problems = ref<ObjectProblem[]>([])
const warnings = ref<string[]>([])

const k8s = (path: string) => `/api/clusters/${encodeURIComponent(cluster.value ?? '')}/k8s/${path}`
async function getJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  return res.ok ? ((await res.json()) as T) : null
}
const nsPath = (ns: string) => `namespaces/${encodeURIComponent(ns)}`

onMounted(() => {
  void loadProjects(true)
  if (!namespace.value && namespaces.value.length) namespace.value = namespaces.value[0]!
})
watch(namespaces, (list) => {
  if (!namespace.value && list.length) namespace.value = list[0]!
})

// The namespace's Pipelines (or Tasks), ConfigMaps and storage quota.
watch(namespace, async (ns) => {
  sources.value = []
  configMaps.value = []
  storageUse.value = null
  if (!ns || !cluster.value) return
  const list = await getJSON<{ items: { metadata: { name: string } }[] }>(k8s(`apis/tekton.dev/v1/${nsPath(ns)}/${sourcePlural.value}`))
  sources.value = (list?.items ?? []).map((i) => i.metadata.name).sort()
  if (source.value && !sources.value.includes(source.value)) source.value = null
  const cms = await getJSON<{ items: { metadata: { name: string } }[] }>(k8s(`api/v1/${nsPath(ns)}/configmaps`))
  configMaps.value = (cms?.items ?? []).map((c) => c.metadata.name).filter((n) => n !== 'kube-root-ca.crt').sort()
  const quotas = await getJSON<{ items: { status?: { hard?: Record<string, string>; used?: Record<string, string> } }[] }>(k8s(`api/v1/${nsPath(ns)}/resourcequotas`))
  const q = quotas?.items.find((x) => x.status?.hard?.['requests.storage'])
  if (q) storageUse.value = `${q.status!.used?.['requests.storage'] ?? '0'} of ${q.status!.hard!['requests.storage']} used`
}, { immediate: true })

// The chosen Pipeline (or Task): its params and workspaces; prefilled from
// an earlier run (?from=<run>), else the defaults.
watch([source, namespace], async ([name, ns]) => {
  specParams.value = []
  specWorkspaces.value = []
  if (!name || !ns) return
  loadingSpec.value = true
  try {
    const obj = await getJSON<{ spec?: { params?: ParamSpec[]; workspaces?: WorkspaceSpec[] } }>(k8s(`apis/tekton.dev/v1/${nsPath(ns)}/${sourcePlural.value}/${encodeURIComponent(name)}`))
    let earlier: { params?: { name: string; value: unknown }[]; timeouts?: { pipeline?: string }; timeout?: string } = {}
    if (query.value.from) {
      const run = await getJSON<{ spec?: typeof earlier }>(k8s(`apis/tekton.dev/v1/${nsPath(ns)}/${props.kind}/${encodeURIComponent(query.value.from)}`))
      earlier = run?.spec ?? {}
    }
    const prior = Object.fromEntries((earlier.params ?? []).map((x) => [x.name, x.value]))
    specParams.value = obj?.spec?.params ?? []
    specWorkspaces.value = obj?.spec?.workspaces ?? []
    for (const k of Object.keys(values)) delete values[k]
    for (const p of specParams.value) {
      const v = prior[p.name] ?? p.default
      values[p.name] = p.type === 'array' ? ((v as string[] | undefined) ?? []) : v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v)
    }
    for (const k of Object.keys(workspaces)) delete workspaces[k]
    for (const w of specWorkspaces.value) workspaces[w.name] = { kind: w.optional ? 'none' : 'emptyDir', sizeGi: 1, configMap: '' }
  } finally {
    loadingSpec.value = false
  }
}, { immediate: true })

const missing = computed(() =>
  specParams.value
    .filter((p) => p.default === undefined)
    .filter((p) => { const v = values[p.name]; return v === '' || v === undefined || (Array.isArray(v) && !v.length) })
    .map((p) => p.name),
)

function runObject(): Record<string, unknown> {
  const params = specParams.value.map((p) => {
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
  const ws = Object.entries(workspaces).filter(([, c]) => c.kind !== 'none' && c.kind !== 'secret').map(([name, c]) => {
    if (c.kind === 'emptyDir') return { name, emptyDir: {} }
    if (c.kind === 'configMap') return { name, configMap: { name: c.configMap } }
    return { name, volumeClaimTemplate: { spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: `${c.sizeGi}Gi` } } } } }
  })
  const name = source.value ?? (forPipeline.value ? 'my-pipeline' : 'my-task')
  const spec: Record<string, unknown> = forPipeline.value ? { pipelineRef: { name } } : { taskRef: { name } }
  if (params.length) spec.params = params
  if (ws.length) spec.workspaces = ws
  if (timeoutMinutes.value) {
    const t = `${timeoutMinutes.value}m`
    if (forPipeline.value) spec.timeouts = { pipeline: t }
    else spec.timeout = t
  }
  return {
    apiVersion: 'tekton.dev/v1',
    kind: runKind.value,
    metadata: { generateName: `${name.slice(0, 50)}-` },
    spec,
  }
}

// The YAML view starts from the form (a sample when nothing is chosen yet).
watch(yamlView, (on) => {
  if (on) yamlText.value = yaml.stringify(runObject())
})

async function create() {
  if (!cluster.value) return
  busy.value = true
  error.value = null
  problems.value = []
  warnings.value = []
  try {
    const obj = yamlView.value ? yaml.parse(yamlText.value) : runObject()
    const res = await pluginObjects.create(cluster.value, PLUGIN, props.kind, namespace.value, obj)
    const name = (res.object.metadata as { name: string }).name
    await navigate({ name: `tekton.${props.kind}.detail`, params: { cluster: cluster.value, namespace: namespace.value, name } })
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
  <div data-test="tekton-run-form">
    <NH2 class="title">
      Create {{ runKind }}
    </NH2>
    <NCard size="small">
      <NAlert
        v-if="!namespaces.length"
        type="info"
        data-test="run-form-no-projects"
      >
        Runs can be created only in Project namespaces, and this cluster has no Projects yet.
      </NAlert>
      <template v-else>
        <NSpace
          align="center"
          class="toolbar"
        >
          <span>Namespace</span>
          <NSelect
            v-model:value="namespace"
            :options="namespaces.map((n) => ({ label: n, value: n }))"
            size="small"
            class="select"
            data-test="run-form-namespace"
          />
          <span>{{ sourceKind }}</span>
          <NSelect
            v-model:value="source"
            :options="sources.map((n) => ({ label: n, value: n }))"
            :placeholder="`Choose a ${sourceKind}`"
            size="small"
            class="select"
            filterable
            data-test="run-form-source"
          />
          <span class="spacer" />
          <span>YAML view</span>
          <NSwitch
            v-model:value="yamlView"
            data-test="run-form-yaml"
          />
        </NSpace>
        <NAlert
          v-if="namespace && !inProject"
          type="warning"
          class="gap"
        >
          {{ namespace }} is not a Project namespace: runs can be created only in Projects.
        </NAlert>

        <template v-if="yamlView">
          <component
            :is="YamlEditor"
            v-model:value="yamlText"
            :problems="problems"
            height="50vh"
          />
          <div class="muted gap">
            The run uses the Project's <code>pipeline</code> ServiceAccount (filled in by Capybara if left out).
          </div>
        </template>
        <NSpin v-else-if="loadingSpec" />
        <NForm
          v-else-if="source"
          label-placement="top"
        >
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
                <NRadioButton
                  value="secret"
                  disabled
                  title="Secrets come with sign-in (Phase 5)"
                  data-test="workspace-secret"
                >
                  Secret
                </NRadioButton>
              </NRadioGroup>
              <span class="muted">Secret workspaces become available with sign-in (Phase 5).</span>
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
                  v-if="storageUse"
                  class="muted"
                >Project storage: {{ storageUse }}</span>
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

          <NFormItem label="Timeout">
            <NSpace align="center">
              <NInputNumber
                v-model:value="timeoutMinutes"
                :min="1"
                :max="1440"
                placeholder="Default (1 hour)"
                size="small"
                data-test="run-form-timeout"
              >
                <template #suffix>
                  min
                </template>
              </NInputNumber>
            </NSpace>
          </NFormItem>
          <NAlert
            type="info"
            :bordered="false"
          >
            The run uses the Project's <code>pipeline</code> ServiceAccount, which has no permissions and no API token.
          </NAlert>
        </NForm>
        <NAlert
          v-else
          type="info"
          :bordered="false"
          class="gap"
        >
          Choose a {{ sourceKind }} {{ sources.length ? '' : `(there are none in ${namespace} yet)` }}.
        </NAlert>

        <NAlert
          v-if="error"
          type="error"
          class="gap"
          data-test="run-form-error"
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
            :disabled="!inProject || (!yamlView && (!source || missing.length > 0))"
            data-test="run-form-create"
            @click="create"
          >
            Create
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 16px;
}
.toolbar {
  margin-bottom: 12px;
}
.select {
  width: 240px;
}
.spacer {
  flex: 1;
}
.gap {
  margin-top: 12px;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
}
h4 {
  margin: 4px 0 8px;
}
</style>
