import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import yaml from 'js-yaml'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const entriesFile = fileURLToPath(new URL('../packages/bundle-arch/entries.yml', import.meta.url))
const entries = yaml.load(readFileSync(entriesFile, 'utf8')) as Array<{
  id: string
  name: string
  config?: any
}>

const ctx = new Context()
ctx.provide('profileContext', {
  name: 'dshiunx',
  dir: `${process.cwd()}/profiles/default`,
  patchPath: `${process.cwd()}/profiles/default/cordis.patch.yml`,
  installAnchor: process.cwd(),
  cwd: process.cwd(),
  home: process.env.HOME ?? '',
  startedBundles: [],
  overlays: [],
  telemetryDisabledEnv: undefined,
})
await ctx.plugin(Loader)

for (const entry of entries) {
  await ctx.loader.create({ id: entry.id, name: entry.name, config: entry.config })
}
await ctx.loader.await()

const loaded = [...ctx.loader.entries()]
console.log(`loaded ${loaded.length}/${entries.length} entries:`)
for (const entry of loaded) {
  console.log(`  ${entry.id.padEnd(24)} ${entry.options.name}  ${entry.fiber?.state ?? '?'}`)
}
