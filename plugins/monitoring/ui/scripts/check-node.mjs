// The committed bundle's sha256 is pinned in plugin.yaml: builds must be
// byte-for-byte reproducible, so the Node version is pinned too.
import { readFileSync } from 'node:fs'

const want = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim()
if (process.versions.node !== want) {
  console.error(`monitoring UI: build with Node ${want} (this is ${process.versions.node}); see plugins/monitoring/ui/.nvmrc`)
  process.exit(1)
}
