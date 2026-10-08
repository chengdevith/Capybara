// Layout of a Pipeline's tasks as a left-to-right graph: a task's column is
// one past the furthest task it waits for (runAfter, or a result it uses);
// `finally` tasks get their own last column. Pure, so it is tested with
// node --test.

export interface PipelineTaskSpec {
  name: string
  runAfter?: string[]
  params?: { name: string; value?: unknown }[]
  when?: { input?: string; values?: string[] }[]
}

export interface GraphNode {
  name: string
  column: number
  row: number
  finally: boolean
}

export interface GraphEdge {
  from: string
  to: string
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  columns: number
  rows: number
}

// "$(tasks.build.results.image)" → "build"
const resultRef = /\$\(tasks\.([a-z0-9]([-a-z0-9]*[a-z0-9])?)\.results\./g

/** The tasks t waits for: runAfter plus tasks whose results it reads. */
export function dependencies(t: PipelineTaskSpec, names: Set<string>): string[] {
  const out = new Set(t.runAfter ?? [])
  const text = JSON.stringify([t.params ?? [], t.when ?? []])
  for (const m of text.matchAll(resultRef)) out.add(m[1]!)
  return [...out].filter((n) => names.has(n) && n !== t.name).sort()
}

export function layout(tasks: PipelineTaskSpec[], finallyTasks: PipelineTaskSpec[] = []): Graph {
  const names = new Set(tasks.map((t) => t.name))
  const deps = new Map(tasks.map((t) => [t.name, dependencies(t, names)]))
  const column = new Map<string, number>()
  const visiting = new Set<string>()
  const col = (name: string): number => {
    const known = column.get(name)
    if (known !== undefined) return known
    if (visiting.has(name)) return 0 // a cycle: Tekton refuses it; draw it flat
    visiting.add(name)
    const c = Math.max(-1, ...(deps.get(name) ?? []).map(col)) + 1
    visiting.delete(name)
    column.set(name, c)
    return c
  }
  tasks.forEach((t) => col(t.name))
  const columns = tasks.length ? Math.max(...column.values()) + 1 : 0

  const nodes: GraphNode[] = []
  const perColumn = new Map<number, number>()
  for (const t of tasks) {
    const c = column.get(t.name)!
    const row = perColumn.get(c) ?? 0
    perColumn.set(c, row + 1)
    nodes.push({ name: t.name, column: c, row, finally: false })
  }
  finallyTasks.forEach((t, i) => nodes.push({ name: t.name, column: columns, row: i, finally: true }))

  const edges: GraphEdge[] = []
  for (const t of tasks) for (const d of deps.get(t.name)!) edges.push({ from: d, to: t.name })
  // finally runs after everything else: link it from the last column.
  const last = nodes.filter((n) => !n.finally && n.column === columns - 1)
  for (const f of finallyTasks) for (const l of last) edges.push({ from: l.name, to: f.name })

  const rows = Math.max(1, ...[...perColumn.values()], finallyTasks.length)
  return { nodes, edges, columns: columns + (finallyTasks.length ? 1 : 0), rows }
}
