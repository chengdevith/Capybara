import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ClusterScope from '@/components/layout/ClusterScope.vue'
import NotFound from '@/components/layout/NotFound.vue'
import RootRedirect from '@/components/layout/RootRedirect.vue'
import { clusterFromParams } from '@/composables/useExtensionContext'
import { firstNavRoute, isActive, type ExtensionRegistry, type Registered, type RouteExtension } from '@/extensions'

/** Names of the structural routes. Feature routes are named by their
 * extension id and are never declared here. */
export const LAYOUT_ROUTE = 'layout'
export const CLUSTER_ROUTE = 'cluster'
export const NOT_FOUND_ROUTE = 'not-found'

function structuralRoutes(registry: ExtensionRegistry): RouteRecordRaw[] {
  return [
    {
      path: '/',
      name: LAYOUT_ROUTE,
      component: AppLayout,
      children: [
        { path: '', name: 'root', component: RootRedirect },
        {
          path: 'c/:cluster',
          name: CLUSTER_ROUTE,
          component: ClusterScope,
          children: [
            {
              // /c/:cluster lands on the first sidebar page for that cluster.
              path: '',
              name: 'cluster-index',
              redirect: (to) => {
                const target = firstNavRoute(registry, { cluster: clusterFromParams(to.params) })
                return target ? { name: target, params: to.params } : { name: NOT_FOUND_ROUTE, params: { pathMatch: [] } }
              },
            },
          ],
        },
        { path: ':pathMatch(.*)*', name: NOT_FOUND_ROUTE, component: NotFound },
      ],
    },
  ]
}

function toRecord(ext: Registered<RouteExtension>): RouteRecordRaw {
  return {
    path: ext.path,
    name: ext.id,
    component: ext.component,
    props: ext.props ?? false,
    meta: { extension: ext.id, title: ext.title },
  }
}

/**
 * Keeps the router's feature routes in sync with route extensions,
 * including ones registered or removed after startup. Returns a stop function.
 */
export function syncRoutes(router: Router, registry: ExtensionRegistry): () => void {
  const add = (ext: Registered<RouteExtension>) =>
    router.addRoute(ext.scope === 'cluster' ? CLUSTER_ROUTE : LAYOUT_ROUTE, toRecord(ext))

  registry.all('route').forEach(add)
  return registry.subscribe((ev) => {
    if (ev.extension.type !== 'route') return
    if (ev.kind === 'add') add(ev.extension)
    else if (router.hasRoute(ev.extension.id)) router.removeRoute(ev.extension.id)
  })
}

export function createAppRouter(registry: ExtensionRegistry, history: RouterHistory = createWebHistory()): Router {
  const router = createRouter({ history, routes: structuralRoutes(registry) })
  syncRoutes(router, registry)

  // A route extension whose `when` fails for this cluster (e.g. a plugin not
  // enabled here) behaves as if it did not exist.
  router.beforeEach((to) => {
    const ext = typeof to.name === 'string' ? registry.get(to.name) : undefined
    if (ext?.type === 'route' && !isActive(ext, { cluster: clusterFromParams(to.params) })) {
      return { name: NOT_FOUND_ROUTE, params: { pathMatch: to.path.slice(1).split('/') } }
    }
  })

  router.afterEach((to) => {
    const title = to.meta.title
    document.title = typeof title === 'string' ? `${title} · Capybara` : 'Capybara'
  })
  return router
}
