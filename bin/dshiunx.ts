import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { mountRootInclude } from '@deepseek-ai/dsh-app-boot'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const ctx = new Context()
ctx.baseUrl = pathToFileURL(entriesDir).href + '/'
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
await mountRootInclude(ctx, `${entriesDir}entries.yml`, [], undefined, 'dshiunx')
await ctx.get('loader')?.await()

const loaded = [...ctx.loader.entries()]
console.log(`loaded ${loaded.length} entries:`)
for (const entry of loaded) {
  console.log(`  ${entry.id.padEnd(24)} ${entry.options.name}  ${entry.fiber?.state ?? '?'}`)
}
