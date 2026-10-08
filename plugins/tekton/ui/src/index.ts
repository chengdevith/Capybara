import { definePlugin, EXTENSION_API_VERSION, type ExtensionContext } from '@capybara/sdk'
import { isProjectNamespace, loadProjects, pipelineRunsDef, pipelinesDef, setApi, taskRunsDef, tasksDef } from './tekton'

// Pipelines (id: tekton). Everything here shows only on clusters where the
// plugin is installed and enabled; Capybara adds that condition. Writes
// (create, edit, start, delete, rerun, cancel) exist only in Project
// namespaces, and Capybara's server checks each one (ADR 0008).
type Obj = { metadata: { name: string; namespace?: string } }
const inProject = (o: Obj, ctx: ExtensionContext) => isProjectNamespace(o.metadata.namespace, ctx.cluster)

export default definePlugin({
  name: 'tekton',
  apiVersion: EXTENSION_API_VERSION,
  // YAML editor and diff, pluginObjects, navigation, appliesTo (1.2).
  minApi: '1.2',
  register(api) {
    setApi(api)
    void loadProjects()

    api.register({ type: 'nav-section', id: 'tekton.section', label: 'Pipelines', order: 45 })
    api.registerResource(pipelineRunsDef, { order: 10, section: 'tekton.section' })
    api.registerResource(taskRunsDef, { order: 20, section: 'tekton.section' })
    api.registerResource(pipelinesDef, { order: 30, section: 'tekton.section' })
    api.registerResource(tasksDef, { order: 40, section: 'tekton.section' })

    // Create, edit and start pages.
    const editor = () => import('./EditorPage.vue')
    api.register({ type: 'route', id: 'tekton.tasks.new', path: 'tekton/tasks/new', scope: 'cluster', title: 'Create Task', parent: 'tekton.tasks.list', props: { object: 'tasks' }, component: editor })
    api.register({ type: 'route', id: 'tekton.pipelines.new', path: 'tekton/pipelines/new', scope: 'cluster', title: 'Create Pipeline', parent: 'tekton.pipelines.list', props: { object: 'pipelines' }, component: editor })
    api.register({ type: 'route', id: 'tekton.tasks.edit', path: 'tekton/tasks/:namespace/:name/edit', scope: 'cluster', title: 'Edit Task', parent: 'tekton.tasks.list', props: { object: 'tasks' }, component: editor })
    api.register({ type: 'route', id: 'tekton.pipelines.edit', path: 'tekton/pipelines/:namespace/:name/edit', scope: 'cluster', title: 'Edit Pipeline', parent: 'tekton.pipelines.list', props: { object: 'pipelines' }, component: editor })
    api.register({ type: 'route', id: 'tekton.pipelines.start', path: 'tekton/pipelines/:namespace/:name/start', scope: 'cluster', title: 'Start run', parent: 'tekton.pipelines.list', component: () => import('./StartRunPage.vue') })

    // Detail tabs.
    api.register({
      type: 'resource-detail-tab', id: 'tekton.tab.graph', label: 'Graph', order: 12,
      kinds: ['Pipeline', 'PipelineRun'], component: () => import('./GraphTab.vue'),
    })
    api.register({
      type: 'resource-detail-tab', id: 'tekton.tab.tasks', label: 'Tasks', order: 15,
      kinds: ['PipelineRun'], component: () => import('./PipelineRunTasksTab.vue'),
    })
    api.register({
      type: 'resource-detail-tab', id: 'tekton.tab.logs', label: 'Logs', order: 40,
      kinds: ['TaskRun'], component: () => import('./TaskRunLogsTab.vue'),
    })

    // Actions: only on objects in Project namespaces.
    api.register({
      type: 'resource-action', id: 'tekton.action.start', label: 'Start run', order: 5,
      kinds: ['Pipeline'], appliesTo: inProject, component: () => import('./StartRunAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.edit', label: 'Edit', order: 10,
      kinds: ['Task', 'Pipeline'], appliesTo: inProject, component: () => import('./EditAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.rerun', label: 'Rerun', order: 15,
      kinds: ['PipelineRun'], appliesTo: inProject, component: () => import('./RerunAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.cleanup', label: 'Clean up runs', order: 30,
      kinds: ['Pipeline'], appliesTo: inProject, component: () => import('./CleanupAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.cancel', label: 'Cancel run', order: 16, danger: true,
      kinds: ['PipelineRun'], appliesTo: inProject, component: () => import('./CancelAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.delete', label: 'Delete', order: 90, danger: true,
      kinds: ['Task', 'Pipeline', 'PipelineRun'], appliesTo: inProject, component: () => import('./DeleteAction.vue'),
    })

    api.register({
      type: 'project-overview-card', id: 'tekton.card.runs', title: 'Pipeline runs', order: 30,
      component: () => import('./ProjectRunsCard.vue'),
    })
  },
})
