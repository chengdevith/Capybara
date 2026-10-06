import { byOrder, isActive, type ExtensionRegistry } from './registry'
import type {
  ExtensionContext,
  KindMatcher,
  NavItemExtension,
  NavSectionExtension,
  Registered,
  ResourceDetailTabExtension,
} from './types'

export type NavEntry =
  | { kind: 'item'; item: Registered<NavItemExtension> }
  | { kind: 'section'; section: Registered<NavSectionExtension>; items: Registered<NavItemExtension>[] }

/**
 * Builds the sidebar: top-level items and sections mixed by `order`, items
 * inside sections by `order`. Empty sections are hidden. Items whose route
 * is not registered or not active are dropped, and so are cluster-scoped
 * items on global pages (there is no cluster to link them to).
 */
export function navTree(registry: ExtensionRegistry, ctx: ExtensionContext): NavEntry[] {
  const routeActive = (id: string) => {
    const r = registry.get(id)
    if (r?.type !== 'route' || !isActive(r, ctx)) return false
    return r.scope === 'global' || ctx.cluster !== null
  }
  const items = registry.active('nav-item', ctx).filter((i) => routeActive(i.route))
  const sections = registry.active('nav-section', ctx)
  const sectionIds = new Set(sections.map((s) => s.id))

  const top: { order: number; entry: NavEntry }[] = []
  for (const item of items) {
    if (!item.section) top.push({ order: item.order, entry: { kind: 'item', item } })
    else if (!sectionIds.has(item.section)) {
      console.warn(`nav item "${item.id}": unknown section "${item.section}"`)
    }
  }
  for (const section of sections) {
    const children = items.filter((i) => i.section === section.id).sort(byOrder)
    if (children.length > 0) top.push({ order: section.order, entry: { kind: 'section', section, items: children } })
  }
  return top.sort(byOrder).map((t) => t.entry)
}

export function matchesKind(kinds: KindMatcher, kind: string): boolean {
  return kinds === '*' || kinds.includes(kind)
}

/** Tabs for the generic detail page of `kind`, in order. */
export function detailTabs(
  registry: ExtensionRegistry,
  kind: string,
  ctx: ExtensionContext,
): Registered<ResourceDetailTabExtension>[] {
  return registry
    .active('resource-detail-tab', ctx)
    .filter((t) => matchesKind(t.kinds, kind))
    .sort(byOrder)
}

/** First page of the sidebar for ctx: where /c/:cluster lands. */
export function firstNavRoute(registry: ExtensionRegistry, ctx: ExtensionContext): string | undefined {
  const first = navTree(registry, ctx)[0]
  if (!first) return undefined
  return first.kind === 'item' ? first.item.route : first.items[0]?.route
}
