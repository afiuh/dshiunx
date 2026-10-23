/** 从 bundles/ 组合生成 entries.yml（自动生成，不要手写）。 */
import { readFileSync, writeFileSync } from 'node:fs'

const presets = ['standard', 'ptc', 'minimal', 'creator']
const parts = [
  readFileSync('bundles/base/cordis.patch.yml', 'utf8'),
  ...presets.map((p) => readFileSync(`bundles/presets/${p}.patch.yml`, 'utf8')),
  readFileSync('bundles/tui/cordis.patch.yml', 'utf8'),
]
writeFileSync('packages/bundle-arch/entries.yml', parts.join(''))
console.log('entries.yml generated from bundles/')
