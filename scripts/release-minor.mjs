import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(path, 'utf8'))
const parts = pkg.version.split('.').map(Number)
parts[1] += 1
parts[2] = 0
pkg.version = parts.join('.')
writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`Version bumped to ${pkg.version}`)
