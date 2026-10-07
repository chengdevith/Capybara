// Fails if a built browser bundle references Node globals (process,
// Buffer, global, require) as free variables: they do not exist in the
// browser and throw at runtime (ECharts' process.env did). Object keys,
// property names and strings with these words are fine; so are local
// variables that happen to share a name.
//
//   node scripts/check-bundle.mjs dist/monitoring.js
import { readFileSync } from 'node:fs'
import { parseAst } from 'vite'

const FORBIDDEN = new Set(['process', 'Buffer', 'global', 'require'])

export function freeNodeGlobals(code) {
  const ast = parseAst(code)
  const found = []
  // Scopes are approximated per function (var, let, const, class, params
  // and function names all count as declared in their nearest function).
  const scopes = [new Set()]

  function declare(pattern) {
    if (!pattern) return
    switch (pattern.type) {
      case 'Identifier': scopes.at(-1).add(pattern.name); break
      case 'ObjectPattern': pattern.properties.forEach((p) => declare(p.type === 'RestElement' ? p.argument : p.value)); break
      case 'ArrayPattern': pattern.elements.forEach(declare); break
      case 'RestElement': declare(pattern.argument); break
      case 'AssignmentPattern': declare(pattern.left); break
    }
  }
  // First pass per function body: hoist every declaration inside it.
  function hoist(node, top = true) {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach((n) => hoist(n, top))
    if (!top && /Function/.test(node.type)) {
      if (node.type === 'FunctionDeclaration') declare(node.id)
      return // its own scope
    }
    if (node.type === 'VariableDeclarator') declare(node.id)
    if (node.type === 'ClassDeclaration') declare(node.id)
    if (node.type === 'CatchClause') declare(node.param)
    if (node.type === 'ImportSpecifier' || node.type === 'ImportDefaultSpecifier' || node.type === 'ImportNamespaceSpecifier') declare(node.local)
    for (const [k, v] of Object.entries(node)) if (k !== 'type' && v && typeof v === 'object') hoist(v, false)
  }
  const declared = (name) => scopes.some((s) => s.has(name))

  function walk(node, parent, key) {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach((n) => walk(n, parent, key))
    if (/Function/.test(node.type)) {
      scopes.push(new Set())
      if (node.id && node.type !== 'FunctionDeclaration') declare(node.id)
      node.params.forEach(declare)
      hoist(node.body)
      walk(node.body, node, 'body')
      node.params.forEach((p) => walk(p, node, 'params'))
      scopes.pop()
      return
    }
    if (node.type === 'Identifier' && FORBIDDEN.has(node.name)) {
      const isProperty = parent && ((parent.type === 'MemberExpression' && key === 'property' && !parent.computed) ||
        ((parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') && key === 'key' && !parent.computed))
      if (!isProperty && !declared(node.name)) found.push({ name: node.name, at: node.start })
    }
    for (const [k, v] of Object.entries(node)) if (k !== 'type' && v && typeof v === 'object') walk(v, node, k)
  }
  hoist(ast)
  walk(ast, null, null)
  return found
}

if (process.argv[2]) {
  const code = readFileSync(process.argv[2], 'utf8')
  const found = freeNodeGlobals(code)
  if (found.length) {
    for (const f of found.slice(0, 10)) console.error(`${process.argv[2]}: Node global "${f.name}" at offset ${f.at}: …${code.slice(Math.max(0, f.at - 40), f.at + 30).replace(/\s+/g, ' ')}…`)
    console.error(`${found.length} reference(s) to Node globals; define them at build time (vite define) or avoid the code using them`)
    process.exit(1)
  }
}
