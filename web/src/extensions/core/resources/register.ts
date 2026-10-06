import { detailRouteOf, listRouteOf, type ResourceDef } from '@/components/resource/types'
import type { ExtensionRegistry } from '../../registry'

/**
 * Registers a resource kind: its list page, its detail page and its sidebar
 * item. The pages are the generic ones; `def` is all that differs per kind.
 */
export function registerResource(
  registry: ExtensionRegistry,
  def: ResourceDef,
  nav: { order: number; section?: string },
): void {
  registry.register({
    type: 'route',
    id: listRouteOf(def),
    path: def.path,
    scope: 'cluster',
    title: def.label,
    props: { resource: def },
    component: () => import('@/views/ResourceListView.vue'),
  })
  registry.register({
    type: 'route',
    id: detailRouteOf(def),
    path: def.type.namespaced ? `${def.path}/:namespace/:name` : `${def.path}/:name`,
    scope: 'cluster',
    title: def.singular,
    parent: listRouteOf(def),
    props: { resource: def },
    component: () => import('@/views/ResourceDetailView.vue'),
  })
  registry.register({
    type: 'nav-item',
    id: `${def.id}.nav`,
    label: def.label,
    order: nav.order,
    section: nav.section,
    route: listRouteOf(def),
  })
}
