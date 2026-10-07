import type { Component } from 'vue'

/**
 * Version of the extension API. Bump on breaking changes; extensions that
 * declare a newer version than this are refused at registration.
 */
export const EXTENSION_API_VERSION = 1

/**
 * Minor version of the extension API: bumped when the API gains something
 * (backwards compatible). A plugin declares the minimum it needs
 * (PluginModule.minApi, e.g. '1.1') and is refused by an older console.
 *
 * 1.0  extension points, register()
 * 1.1  registerResource(), components (LogViewer, ResourceLink),
 *      composables (useLiveList), pluginAction()
 */
export const EXTENSION_API_MINOR = 1

/** What an extension's `when` predicate can look at. */
export interface ExtensionContext {
  /** Cluster id from the URL, or null on global pages. */
  cluster: string | null
  /** Plugins installed and enabled on that cluster. A plugin's own
   * extensions are only active where its name is in this set. */
  plugins: ReadonlySet<string>
}

export type LazyComponent = () => Promise<Component | { default: Component }>

/** Kinds a resource-scoped extension applies to, or '*' for all. */
export type KindMatcher = readonly string[] | '*'

interface ExtensionBase {
  /** Globally unique, e.g. 'core.nav.home' or 'monitoring.tab.metrics'. */
  id: string
  /** 'core' or the plugin name. Defaults to 'core'. */
  source?: string
  /** Extension API version this was written for. Defaults to current. */
  apiVersion?: number
  /** Only active when this returns true. */
  when?: (ctx: ExtensionContext) => boolean
}

/** A collapsible group in the sidebar (Workloads, Networking, ...).
 * Hidden while it has no active items. */
export interface NavSectionExtension extends ExtensionBase {
  type: 'nav-section'
  label: string
  order: number
}

/** A sidebar link to a route extension. */
export interface NavItemExtension extends ExtensionBase {
  type: 'nav-item'
  label: string
  order: number
  /** nav-section id; omit for a top-level item. */
  section?: string
  /** id of the route extension this item opens. */
  route: string
}

/** A page. Its id is also the Vue Router route name. */
export interface RouteExtension extends ExtensionBase {
  type: 'route'
  /** Relative path, no leading slash. Cluster routes live under /c/:cluster/. */
  path: string
  scope: 'cluster' | 'global'
  component: LazyComponent
  title?: string
  /** Route id this page belongs under (e.g. a detail page's list page):
   * keeps that page's sidebar item highlighted. */
  parent?: string
  /** Static props passed to the page (lets one generic page serve many kinds). */
  props?: Record<string, unknown>
}

/** A tab on the generic resource detail page. */
export interface ResourceDetailTabExtension extends ExtensionBase {
  type: 'resource-detail-tab'
  label: string
  order: number
  kinds: KindMatcher
  component: LazyComponent
}

// The extension points below are declared now so the API shape is stable.
// Nothing renders them until the phase that needs them.

/**
 * An action on a resource (scale, restart, delete, ...), shown in the
 * detail page's Actions menu and each list row's menu. `component` is a
 * dialog: it gets `cluster`, `resource` (ResourceDef) and `object`, and
 * emits `close` when done or cancelled.
 */
export interface ResourceActionExtension extends ExtensionBase {
  type: 'resource-action'
  label: string
  order: number
  kinds: KindMatcher
  /** Destructive: shown last and in red. */
  danger?: boolean
  component: LazyComponent
}

/**
 * A card on the cluster overview page (Home). `component` gets `cluster`
 * (id) and `overview` (ClusterOverview, or null while loading/failed).
 */
export interface ClusterOverviewCardExtension extends ExtensionBase {
  type: 'cluster-overview-card'
  title: string
  order: number
  component: LazyComponent
}

/** A card on the project overview page. `component` gets `cluster` and
 * `project` (the Project object). */
export interface ProjectOverviewCardExtension extends ExtensionBase {
  type: 'project-overview-card'
  title: string
  order: number
  component: LazyComponent
}

/** A tab on the cluster's Settings page (Administration → Settings).
 * `component` gets `cluster`. */
export interface SettingsPageExtension extends ExtensionBase {
  type: 'settings-page'
  label: string
  order: number
  component: LazyComponent
}

export type Extension =
  | NavSectionExtension
  | NavItemExtension
  | RouteExtension
  | ResourceDetailTabExtension
  | ResourceActionExtension
  | ClusterOverviewCardExtension
  | ProjectOverviewCardExtension
  | SettingsPageExtension

export type ExtensionType = Extension['type']
export type ExtensionOf<T extends ExtensionType> = Extract<Extension, { type: T }>

/** An extension after registration: defaults filled in, frozen. */
export type Registered<E extends Extension = Extension> = Readonly<E & { source: string; apiVersion: number }>
