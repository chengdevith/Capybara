// A plugin's committed bundle has its sha256 pinned in plugin.yaml: builds
// must be byte-for-byte reproducible, so the Node version is pinned too
// (ui/.nvmrc). Run from the plugin's ui/ folder.
import { readFileSync } from 'node:fs'

const want = readFileSync('.nvmrc', 'utf8').trim()
if (process.versions.node !== want) {
  const name = JSON.parse(readFileSync('package.json', 'utf8')).name
  console.error(`${name}: build with Node ${want} (this is ${process.versions.node}); see .nvmrc`)
  process.exit(1)
}
