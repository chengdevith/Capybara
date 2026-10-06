import type { ExtensionRegistry } from '../registry'

/** Actions on resources: Edit YAML, Scale, Restart, Delete. */
export function registerActions(registry: ExtensionRegistry): void {
  registry.register({
    type: 'resource-action',
    id: 'core.action.edit-yaml',
    label: 'Edit YAML',
    order: 10,
    kinds: '*',
    component: () => import('@/views/resource-actions/EditYamlAction.vue'),
  })
  registry.register({
    type: 'resource-action',
    id: 'core.action.scale',
    label: 'Scale',
    order: 20,
    kinds: ['Deployment'],
    component: () => import('@/views/resource-actions/ScaleAction.vue'),
  })
  registry.register({
    type: 'resource-action',
    id: 'core.action.restart',
    label: 'Restart rollout',
    order: 30,
    kinds: ['Deployment'],
    component: () => import('@/views/resource-actions/RestartAction.vue'),
  })
  registry.register({
    type: 'resource-action',
    id: 'core.action.delete',
    label: 'Delete',
    order: 100,
    kinds: '*',
    danger: true,
    component: () => import('@/views/resource-actions/DeleteAction.vue'),
  })
}
