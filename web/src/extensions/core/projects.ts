import type { ExtensionRegistry } from '../registry'

// Projects sit right after Home (Namespaces' old spot; Namespaces moved to
// Administration).
export function registerProjects(registry: ExtensionRegistry): void {
  registry.register({
    type: 'route',
    id: 'core.projects',
    path: 'projects',
    scope: 'cluster',
    title: 'Projects',
    component: () => import('@/views/ProjectsView.vue'),
  })
  registry.register({
    type: 'route',
    id: 'core.projects.detail',
    path: 'projects/:name',
    scope: 'cluster',
    title: 'Project',
    parent: 'core.projects',
    component: () => import('@/views/ProjectDetailView.vue'),
  })
  registry.register({ type: 'nav-item', id: 'core.nav.projects', label: 'Projects', order: 5, route: 'core.projects' })
}
