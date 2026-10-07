import { definePlugin, EXTENSION_API_VERSION } from '@capybara/sdk'
import { pipelineRunsDef, pipelinesDef, setApi, taskRunsDef } from './tekton'

// Pipelines (id: tekton). Everything here shows only on clusters where the
// plugin is installed and enabled; Capybara adds that condition.
export default definePlugin({
  name: 'tekton',
  apiVersion: EXTENSION_API_VERSION,
  // registerResource, LogViewer, ResourceLink, useLiveList.
  minApi: '1.1',
  register(api) {
    setApi(api)
    api.register({ type: 'nav-section', id: 'tekton.section', label: 'Pipelines', order: 45 })
    api.registerResource(pipelineRunsDef, { order: 10, section: 'tekton.section' })
    api.registerResource(taskRunsDef, { order: 20, section: 'tekton.section' })
    api.registerResource(pipelinesDef, { order: 30, section: 'tekton.section' })
    api.register({
      type: 'resource-detail-tab', id: 'tekton.tab.tasks', label: 'Tasks', order: 15,
      kinds: ['PipelineRun'], component: () => import('./PipelineRunTasksTab.vue'),
    })
    api.register({
      type: 'resource-detail-tab', id: 'tekton.tab.logs', label: 'Logs', order: 40,
      kinds: ['TaskRun'], component: () => import('./TaskRunLogsTab.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.rerun', label: 'Rerun', order: 15,
      kinds: ['PipelineRun'], component: () => import('./RerunAction.vue'),
    })
    api.register({
      type: 'resource-action', id: 'tekton.action.cancel', label: 'Cancel run', order: 16, danger: true,
      kinds: ['PipelineRun'], component: () => import('./CancelAction.vue'),
    })
    api.register({
      type: 'project-overview-card', id: 'tekton.card.runs', title: 'Pipeline runs', order: 30,
      component: () => import('./ProjectRunsCard.vue'),
    })
  },
})
