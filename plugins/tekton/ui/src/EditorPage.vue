<script setup lang="ts">
import { pluginObjects, PluginRequestError, useCluster, useNavigate, useParams, useQuery, type ObjectProblem } from '@capybara/sdk'
import { NAlert, NButton, NCard, NH2, NSelect, NSpace, NSpin } from 'naive-ui'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { pipelineTemplates, taskTemplates } from './templates'
import { api, isProjectNamespace, loadProjects, PLUGIN, projectNamespaces } from './tekton'

// Create or edit a Task or Pipeline as YAML, in a Project namespace.
// Capybara's server validates it (policy, references, images, dry run);
// problems show on their lines; an edit is reviewed as a diff first.
const props = defineProps<{ object: 'tasks' | 'pipelines' }>()
const { YamlEditor, YamlDiff, ResourceLink } = api().components
const yaml = api().yaml
const cluster = useCluster()
const params = useParams()
const query = useQuery()
const navigate = useNavigate()

const kind = computed(() => (props.object === 'tasks' ? 'Task' : 'Pipeline'))
const editing = computed(() => !!params.value.name)
const namespace = ref(params.value.namespace ?? query.value.ns ?? '')
const namespaces = computed(() => (cluster.value ? projectNamespaces(cluster.value) : []))
const inProject = computed(() => isProjectNamespace(namespace.value, cluster.value))
const templates = computed(() => (props.object === 'tasks' ? taskTemplates : pipelineTemplates))
const template = ref(templates.value[0]!.id)

const text = ref('')
const original = ref('')
const loaded = shallowRef<{ uid: string; resourceVersion: string } | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const problems = ref<ObjectProblem[]>([])
const warnings = ref<string[]>([])
const error = ref<string | null>(null)
const busy = ref(false)
const checked = ref(false)
const reviewing = ref(false)

function useTemplate() {
  const t = templates.value.find((x) => x.id === template.value)
  if (t) text.value = t.yaml(props.object === 'tasks' ? 'say' : 'my-pipeline')
}

onMounted(async () => {
  void loadProjects(true)
  if (!editing.value) {
    if (!namespace.value && namespaces.value.length) namespace.value = namespaces.value[0]!
    useTemplate()
    return
  }
  loading.value = true
  try {
    const url = `/api/clusters/${encodeURIComponent(cluster.value ?? '')}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(namespace.value)}/${props.object}/${encodeURIComponent(params.value.name!)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`${kind.value} ${params.value.name} could not be loaded (${res.status})`)
    const obj = (await res.json()) as { metadata: { uid: string; resourceVersion: string } } & Record<string, unknown>
    loaded.value = { uid: obj.metadata.uid, resourceVersion: obj.metadata.resourceVersion }
    original.value = text.value = yaml.editable(obj)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})
watch(namespaces, (list) => {
  if (!editing.value && !namespace.value && list.length) namespace.value = list[0]!
})
watch(text, () => {
  checked.value = false
  reviewing.value = false
})

function parsed(): Record<string, unknown> | null {
  try {
    error.value = null
    return yaml.parse(text.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    problems.value = []
    return null
  }
}

function fail(e: unknown) {
  if (e instanceof PluginRequestError) {
    error.value = e.message
    problems.value = e.problems
    warnings.value = e.warnings
  } else {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function validate(): Promise<boolean> {
  const obj = parsed()
  if (!obj || !cluster.value) return false
  busy.value = true
  try {
    const res = await pluginObjects.validate(cluster.value, PLUGIN, props.object, namespace.value, obj, params.value.name)
    problems.value = res.problems
    warnings.value = res.warnings
    checked.value = res.problems.length === 0
    return checked.value
  } catch (e) {
    fail(e)
    return false
  } finally {
    busy.value = false
  }
}

async function save() {
  const obj = parsed()
  if (!obj || !cluster.value) return
  busy.value = true
  try {
    const res = editing.value
      ? await pluginObjects.update(cluster.value, PLUGIN, props.object, namespace.value, params.value.name!, obj, loaded.value!)
      : await pluginObjects.create(cluster.value, PLUGIN, props.object, namespace.value, obj)
    const name = (res.object.metadata as { name: string }).name
    await navigate({ name: `tekton.${props.object}.detail`, params: { cluster: cluster.value, namespace: namespace.value, name } })
  } catch (e) {
    fail(e)
  } finally {
    busy.value = false
  }
}

async function primary() {
  if (editing.value && !reviewing.value) {
    if (await validate()) reviewing.value = true
    return
  }
  if (!checked.value && !(await validate())) return
  await save()
}
</script>

<template>
  <div data-test="tekton-editor">
    <NH2 class="title">
      {{ editing ? `Edit ${kind} ${params.name}` : `Create ${kind}` }}
    </NH2>
    <NSpin v-if="loading" />
    <NAlert
      v-else-if="loadError"
      type="error"
    >
      {{ loadError }}
    </NAlert>
    <template v-else>
      <NCard size="small">
        <NSpace
          align="center"
          class="toolbar"
        >
          <span>Namespace</span>
          <NSelect
            v-if="!editing"
            v-model:value="namespace"
            :options="namespaces.map((n) => ({ label: n, value: n }))"
            placeholder="A Project namespace"
            size="small"
            class="select"
            data-test="editor-namespace"
          />
          <strong v-else>{{ namespace }}</strong>
          <template v-if="!editing">
            <span>Template</span>
            <NSelect
              v-model:value="template"
              :options="templates.map((t) => ({ label: t.label, value: t.id }))"
              size="small"
              class="select"
              data-test="editor-template"
              @update:value="useTemplate"
            />
          </template>
        </NSpace>
        <NAlert
          v-if="!namespaces.length && !editing"
          type="info"
          class="gap"
          data-test="editor-no-projects"
        >
          Tasks and Pipelines can be created only in Project namespaces, and this cluster has no Projects yet.
        </NAlert>
        <NAlert
          v-else-if="namespace && !inProject"
          type="warning"
          class="gap"
        >
          {{ namespace }} is not a Project namespace: Tasks and Pipelines can be written only in Projects.
        </NAlert>

        <component
          :is="YamlDiff"
          v-if="reviewing"
          :original="original"
          :modified="text"
          data-test="editor-diff"
        />
        <component
          :is="YamlEditor"
          v-else
          v-model:value="text"
          :problems="problems"
          height="55vh"
        />

        <NAlert
          v-if="error || problems.length"
          type="error"
          class="gap"
          data-test="editor-error"
        >
          {{ error ?? 'It does not meet the rules for this Project:' }}
          <ul v-if="problems.length">
            <li
              v-for="p in problems"
              :key="p.path + p.message"
              data-test="editor-problem"
            >
              <code v-if="p.path">{{ p.path }}</code> {{ p.message }}
            </li>
          </ul>
        </NAlert>
        <NAlert
          v-else-if="checked && !reviewing"
          type="success"
          class="gap"
          data-test="editor-valid"
        >
          It meets the rules for this Project and the cluster accepts it.
        </NAlert>
        <NAlert
          v-if="warnings.length"
          type="warning"
          class="gap"
          data-test="editor-warnings"
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
          <component
            :is="ResourceLink"
            v-if="editing"
            :resource="`tekton.${object}`"
            :namespace="namespace"
            :name="params.name"
          >
            Cancel
          </component>
          <NButton
            v-if="reviewing"
            @click="reviewing = false"
          >
            Back to the editor
          </NButton>
          <NButton
            v-else
            :loading="busy"
            :disabled="!inProject"
            data-test="editor-validate"
            @click="validate"
          >
            Validate
          </NButton>
          <NButton
            type="primary"
            :loading="busy"
            :disabled="!inProject"
            data-test="editor-save"
            @click="primary"
          >
            {{ editing ? (reviewing ? 'Save' : 'Review changes') : `Create ${kind}` }}
          </NButton>
        </NSpace>
      </NCard>
    </template>
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
.gap {
  margin-top: 12px;
}
</style>
