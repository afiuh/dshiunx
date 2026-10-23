/** 从 profile + bundles/ 组合生成 entries.yml（自动生成，不要手写）。 */
import { readFileSync, writeFileSync } from 'node:fs'
import * as yaml from 'js-yaml'

const profile = yaml.load(readFileSync('profiles/default/profile.yml', 'utf8'))
const parts = profile.bundles.map((b) => readFileSync(`bundles/${b}/cordis.patch.yml`, 'utf8'))
writeFileSync('packages/bundle-arch/entries.yml', parts.join(''))
console.log(`entries.yml generated from ${profile.bundles.length} bundles`)
