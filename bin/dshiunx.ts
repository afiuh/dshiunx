import { boot } from '@deepseek-ai/dsh-app-boot'
import { fileURLToPath } from 'node:url'

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const configPath = `${entriesDir}entries.yml`

const ctx = await boot('dshiunx', configPath, [], (hostCtx) => {
  hostCtx.provide('profileContext', {
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
})

const loaded = [...ctx.loader.entries()]
console.log(`loaded ${loaded.length} entries:`)
for (const entry of loaded) {
  console.log(`  ${entry.id.padEnd(24)} ${entry.options.name}  ${entry.fiber?.state ?? '?'}`)
}

await ctx.fiber.dispose()
