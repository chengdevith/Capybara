<script setup lang="ts">
import { pluginObjects, PluginRequestError, useCluster, useNavigate, useParams, useQuery, type ObjectProblem } from '@capybara/sdk'
import { NAlert, NButton, NCard, NCheckbox, NForm, NFormItem, NH2, NInput, NRadio, NRadioGroup, NSelect, NSpace, NSpin } from 'naive-ui'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { applicationOf, emptyForm, formHides, formOf, formProblems, type AppForm } from './appform'
import { api, getApplication, isProjectNamespace, isViewOnly, isWritable, loadProjects, loadWritable, PLUGIN, projectNamespaces, projectOf } from './argocd'

// Create or edit an Application in a Project namespace, as a form or as
// YAML. Capybara's server sets the Project's Argo CD project and
// destination, checks the repository URL and the rest of the policy, and
// dry-runs it; problems show on their fields or YAML lines.
const { YamlEditor, YamlDiff, ResourceLink } = api().components
const yaml = api().yaml
const cluster = useCluster()
const params = useParams()
const query = useQuery()
const navigate = useNavigate()

const editing = computed(() => !!params.value.name)
const namespace = ref(params.value.namespace ?? query.value.ns ?? '')
const namespaces = computed(() => (cluster.value ? projectNamespaces(cluster.value) : []))
const inProject = computed(() => isProjectNamespace(namespace.value, cluster.value))
const project = computed(() => projectOf(namespace.value, cluster.value))
const writable = computed(() => isWritable(cluster.value))
const viewOnly = computed(() => isViewOnly(cluster.value))

const mode = ref<'form' | 'yaml'>('form')
const form = ref<AppForm>(emptyForm())
const text = ref('')
const original = ref('')
const base = shallowRef<Record<string, unknown> | undefined>(undefined)
const loaded = shallowRef<{ uid: string; resourceVersion: string } | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const problems = ref<ObjectProblem[]>([])
const warnings = ref<string[]>([])
const error = ref<string | null>(null)
const busy = ref(false)
const checked = ref(false)
const reviewing = ref(false)

onMounted(async () => {
  void loadProjects(true)
  if (cluster.value) void loadWritable(cluster.value, true)
  if (!editing.value) {
    if (!namespace.value && namespaces.value.length) namespace.value = namespaces.value[0]!
    return
  }
  loading.value = true
  try {
    const obj = (await getApplication(cluster.value ?? '', namespace.value, params.value.name!)) as unknown as Record<string, unknown> & { metadata: { uid: string; resourceVersion: string } }
    loaded.value = { uid: obj.metadata.uid, resourceVersion: obj.metadata.resourceVersion }
    original.value = yaml.editable(obj)
    base.value = yaml.parse(original.value)
    form.value = formOf(base.value)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})
watch(namespaces, (list) => {
  if (!editing.value && !namespace.value && list.length) namespace.value = list[0]!
})
watch([form, text, namespace], () => {
  checked.value = false
  reviewing.value = false
}, { deep: true })

// What the form cannot show stays in the YAML (and is kept on save).
const hidden = computed(() => (base.value ? formHides(base.value) : []))
const quick = computed(() => (mode.value === 'form' ? formProblems(form.value) : []))

function current(): Record<string, unknown> | null {
  error.value = null
  if (mode.value === 'form') return applicationOf(form.value, namespace.value, base.value)
  try {
    return yaml.parse(text.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    problems.value = []
    return null
  }
}

function switchMode(to: 'form' | 'yaml') {
  if (to === mode.value) return
  if (to === 'yaml') {
    text.value = yaml.stringify(applicationOf(form.value, namespace.value, base.value))
  } else {
    const obj = current()
    if (!obj) return
    base.value = obj
    form.value = formOf(obj)
  }
  mode.value = to
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
  if (quick.value.length) return false
  const obj = current()
  if (!obj || !cluster.value) return false
  busy.value = true
  try {
    const res = await pluginObjects.validate(cluster.value, PLUGIN, 'applications', namespace.value, obj, params.value.name)
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
  const obj = current()
  if (!obj || !cluster.value) return
  busy.value = true
  try {
    const res = editing.value
      ? await pluginObjects.update(cluster.value, PLUGIN, 'applications', namespace.value, params.value.name!, obj, loaded.value!)
      : await pluginObjects.create(cluster.value, PLUGIN, 'applications', namespace.value, obj)
    const name = (res.object.metadata as { name: string }).name
    await navigate({ name: 'argocd.applications.detail', params: { cluster: cluster.value, namespace: namespace.value, name } })
  } catch (e) {
    fail(e)
  } finally {
    busy.value = false
  }
}

const modified = computed(() => {
  const obj = mode.value === 'yaml' ? null : applicationOf(form.value, namespace.value, base.value)
  return obj ? yaml.editable(obj) : text.value
})

async function primary() {
  if (editing.value && !reviewing.value) {
    if (await validate()) reviewing.value = true
    return
  }
  if (!checked.value && !(await validate())) return
  await save()
}

// Problems at a form field's path, shown under that field.
const at = (path: string) => problems.value.filter((p) => p.path === path || p.path.startsWith(`${path}.`)).map((p) => p.message).join('; ')
const otherProblems = computed(() =>
  mode.value === 'yaml' ? problems.value : problems.value.filter((p) => !['metadata.name', 'spec.source.repoURL', 'spec.source.path', 'spec.source.targetRevision'].includes(p.path)),
)
</script>

<template>
  <div data-test="argocd-form">
    <NH2 class="title">
      {{ editing ? `Edit Application ${params.name}` : 'Create Application' }}
    </NH2>
    <NSpin v-if="loading" />
    <NAlert
      v-else-if="loadError"
      type="error"
    >
      {{ loadError }}
    </NAlert>
    <template v-else>
      <NAlert
        v-if="viewOnly"
        type="info"
        class="gap-bottom"
        data-test="argocd-view-only"
      >
        GitOps is view-only on this cluster: the connected Argo CD only accepts Applications in its own namespace.
      </NAlert>
      <NCard size="small">
        <NSpace
          align="center"
          justify="space-between"
          class="toolbar"
        >
          <NSpace align="center">
            <span>Namespace</span>
            <NSelect
              v-if="!editing"
              v-model:value="namespace"
              :options="namespaces.map((n) => ({ label: n, value: n }))"
              placeholder="A Project namespace"
              size="small"
              class="select"
              data-test="app-namespace"
            />
            <strong v-else>{{ namespace }}</strong>
            <span
              v-if="project"
              class="muted"
            >Argo CD project capybara-{{ project }}</span>
          </NSpace>
          <NRadioGroup
            :value="mode"
            size="small"
            @update:value="switchMode"
          >
            <NRadio
              value="form"
              data-test="app-mode-form"
            >
              Form
            </NRadio>
            <NRadio
              value="yaml"
              data-test="app-mode-yaml"
            >
              YAML
            </NRadio>
          </NRadioGroup>
        </NSpace>
        <NAlert
          v-if="!namespaces.length && !editing"
          type="info"
          class="gap-bottom"
        >
          Applications can be created only in Project namespaces, and this cluster has no Projects yet.
        </NAlert>
        <NAlert
          v-else-if="namespace && !inProject"
          type="warning"
          class="gap-bottom"
        >
          {{ namespace }} is not a Project namespace: Applications can be written only in Projects.
        </NAlert>

        <component
          :is="YamlDiff"
          v-if="reviewing"
          :original="original"
          :modified="modified"
          data-test="app-diff"
        />
        <NForm
          v-else-if="mode === 'form'"
          label-placement="left"
          label-width="160"
          class="form"
        >
          <NFormItem
            label="Name"
            :feedback="at('metadata.name')"
            :validation-status="at('metadata.name') ? 'error' : undefined"
          >
            <NInput
              v-model:value="form.name"
              :disabled="editing"
              placeholder="guestbook"
              data-test="app-name"
            />
          </NFormItem>
          <NFormItem
            label="Repository URL"
            :feedback="at('spec.source.repoURL') || 'https://…, or http:// / git:// to a service in this cluster'"
            :validation-status="at('spec.source.repoURL') ? 'error' : undefined"
          >
            <NInput
              v-model:value="form.repoURL"
              placeholder="https://github.com/org/repo.git"
              data-test="app-repo"
            />
          </NFormItem>
          <NFormItem
            label="Revision"
            :feedback="at('spec.source.targetRevision') || 'Branch, tag or commit (HEAD: the default branch)'"
          >
            <NInput
              v-model:value="form.targetRevision"
              data-test="app-revision"
            />
          </NFormItem>
          <NFormItem
            label="Path"
            :feedback="at('spec.source.path') || 'Folder in the repository with the manifests, Kustomization or Helm chart'"
          >
            <NInput
              v-model:value="form.path"
              placeholder="deploy"
              data-test="app-path"
            />
          </NFormItem>
          <NFormItem label="Deploys to">
            <span>namespace <strong>{{ namespace || '—' }}</strong> on this cluster</span>
          </NFormItem>
          <NFormItem label="Sync">
            <NSpace vertical>
              <NCheckbox
                v-model:checked="form.autoSync"
                data-test="app-auto-sync"
              >
                Sync automatically when Git changes
              </NCheckbox>
              <NCheckbox
                v-model:checked="form.selfHeal"
                :disabled="!form.autoSync"
              >
                Self-heal: undo changes made in the cluster
              </NCheckbox>
              <NCheckbox
                v-model:checked="form.prune"
                :disabled="!form.autoSync"
              >
                Prune: delete resources removed from Git
              </NCheckbox>
            </NSpace>
          </NFormItem>
          <NFormItem label="On delete">
            <NCheckbox
              v-model:checked="form.cascade"
              data-test="app-cascade"
            >
              Also delete the resources it deployed (can be changed when deleting)
            </NCheckbox>
          </NFormItem>
          <NAlert
            v-if="hidden.length"
            type="info"
          >
            Kept as they are (edit them in YAML): {{ hidden.join(', ') }}
          </NAlert>
        </NForm>
        <component
          :is="YamlEditor"
          v-else
          v-model:value="text"
          :problems="problems"
          height="55vh"
        />

        <NAlert
          v-if="quick.length"
          type="warning"
          class="gap"
          data-test="app-quick-problems"
        >
          <div
            v-for="q in quick"
            :key="q"
          >
            {{ q }}
          </div>
        </NAlert>
        <NAlert
          v-if="error || otherProblems.length"
          type="error"
          class="gap"
          data-test="app-error"
        >
          {{ error ?? 'It does not meet the rules for this Project:' }}
          <ul v-if="otherProblems.length">
            <li
              v-for="p in otherProblems"
              :key="p.path + p.message"
              data-test="app-problem"
            >
              <code v-if="p.path">{{ p.path }}</code> {{ p.message }}
            </li>
          </ul>
        </NAlert>
        <NAlert
          v-else-if="checked && !reviewing"
          type="success"
          class="gap"
          data-test="app-valid"
        >
          It meets the rules for this Project and the cluster accepts it.
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
          <component
            :is="ResourceLink"
            v-if="editing"
            resource="argocd.applications"
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
            :disabled="!inProject || !writable"
            data-test="app-validate"
            @click="validate"
          >
            Validate
          </NButton>
          <NButton
            type="primary"
            :loading="busy"
            :disabled="!inProject || !writable"
            data-test="app-save"
            @click="primary"
          >
            {{ editing ? (reviewing ? 'Save' : 'Review changes') : 'Create Application' }}
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
.form {
  max-width: 760px;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
}
.gap {
  margin-top: 12px;
}
.gap-bottom {
  margin-bottom: 12px;
}
</style>
