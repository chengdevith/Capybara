import { isNode, parseDocument } from 'yaml'

/** Splits "spec.steps[0].env[1]" into ["spec", "steps", 0, "env", 1]. */
export function pathSegments(path: string): (string | number)[] {
  const out: (string | number)[] = []
  for (const part of path.split('.')) {
    const m = /^([^[\]]*)((?:\[\d+\])*)$/.exec(part)
    if (!m) {
      out.push(part)
      continue
    }
    if (m[1]) out.push(m[1])
    for (const idx of m[2]!.matchAll(/\[(\d+)\]/g)) out.push(Number(idx[1]))
  }
  return out
}

/**
 * The 1-based line range of a field path in YAML text: the field itself, or
 * its nearest existing parent (a problem may name a key that is missing).
 * Line 1 when nothing matches (e.g. a problem about the whole object).
 */
export function lineOf(text: string, path: string): { start: number; end: number } {
  const doc = parseDocument(text)
  const segs = pathSegments(path)
  for (let n = segs.length; n > 0; n--) {
    const node = doc.getIn(segs.slice(0, n), true)
    if (isNode(node) && node.range) {
      const [start, , end] = node.range
      return { start: lineAt(text, start), end: lineAt(text, Math.max(start, end - 1)) }
    }
  }
  return { start: 1, end: 1 }
}

function lineAt(text: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < text.length; i++) if (text[i] === '\n') line++
  return line
}
