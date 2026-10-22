import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Timer from '@deepseek-ai/cordis-plugin-timer'
import Hmr from '@deepseek-ai/cordis-plugin-hmr'

test('HMR 替换模块并保留进程', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dshiunx-hmr-'))
  const file = join(dir, 'plugin.ts')
  const write = (v: string) => writeFileSync(
    file,
    `export default { name: 'hmr-fixture', apply() { (globalThis as any).__hmr = '${v}' } }\n`,
  )
  write('v1')

  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(dir).href + '/'
  await ctx.plugin(Timer)
  await ctx.plugin(Loader)
  await ctx.plugin(Hmr, { root: [dir], ignored: [], debounce: 50 })
  await ctx.loader.create({ name: pathToFileURL(file).href })
  await ctx.loader.await()
  assert.equal((globalThis as any).__hmr, 'v1', '初始版本应加载')

  const reloaded = new Promise<void>((resolve) => {
    const off = ctx.on('hmr/reload', () => { off(); resolve() })
  })
  write('v2')
  await Promise.race([
    reloaded,
    new Promise((_, reject) => setTimeout(() => reject(new Error('HMR 超时')), 8000)),
  ])
  await ctx.loader.await()
  assert.equal((globalThis as any).__hmr, 'v2', '修改后应热替换为新版本')

  await ctx.fiber.dispose()
})


test('HMR：改深层依赖重载入口', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dshiunx-hmr-deep-'))
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}\n')
  const entry = join(dir, 'entry.ts')
  const dep = join(dir, 'dep.ts')
  writeFileSync(dep, `export const value = 'v1'\n`)
  writeFileSync(entry, `import { value } from './dep.ts'\nexport default { name: 'deep-entry', apply() { (globalThis as any).__deep = value } }\n`)

  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(dir).href + '/'
  await ctx.plugin(Timer)
  await ctx.plugin(Loader)
  await ctx.plugin(Hmr, { root: [dir], ignored: [], debounce: 50 })
  await ctx.loader.create({ name: pathToFileURL(entry).href })
  await ctx.loader.await()
  assert.equal((globalThis as any).__deep, 'v1', '初始深层依赖值应加载')

  const reloaded = new Promise<void>((resolve) => {
    const off = ctx.on('hmr/reload', () => { off(); resolve() })
  })
  writeFileSync(dep, `export const value = 'v2'\n`)
  await Promise.race([
    reloaded,
    new Promise((_, reject) => setTimeout(() => reject(new Error('HMR 超时')), 8000)),
  ])
  await ctx.loader.await()
  assert.equal((globalThis as any).__deep, 'v2', '深层依赖变更应重载入口')

  await ctx.fiber.dispose()
})

test('HMR：动态 import 的模块也能追踪（ctx.loader.importModule）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dshiunx-hmr-dyn-'))
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}\n')
  const entry = join(dir, 'entry.ts')
  const dep = join(dir, 'dyn-dep.ts')
  writeFileSync(dep, `export const value = 'v1'\n`)
  writeFileSync(entry, `export default { name: 'dyn-entry', async apply(ctx: any) { const m = await ctx.loader.importModule('./dyn-dep.ts'); (globalThis as any).__dyn = m.value } }\n`)

  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(dir).href + '/'
  await ctx.plugin(Timer)
  await ctx.plugin(Loader)
  await ctx.plugin(Hmr, { root: [dir], ignored: [], debounce: 50 })
  await ctx.loader.create({ name: pathToFileURL(entry).href })
  await ctx.loader.await()
  assert.equal((globalThis as any).__dyn, 'v1', '动态 import 的初始值应加载')

  const reloaded = new Promise<void>((resolve) => {
    const off = ctx.on('hmr/reload', () => { off(); resolve() })
  })
  writeFileSync(dep, `export const value = 'v2'\n`)
  await Promise.race([
    reloaded,
    new Promise((_, reject) => setTimeout(() => reject(new Error('HMR 超时')), 8000)),
  ])
  await ctx.loader.await()
  assert.equal((globalThis as any).__dyn, 'v2', '动态 import 的变更应触发入口重载')

  await ctx.fiber.dispose()
})

test('HMR：状态迁移（serialize / restore）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dshiunx-hmr-state-'))
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}\n')
  const entry = join(dir, 'entry.ts')
  const source = (comment: string) => `${comment}
let counter = 0
export default {
  name: 'state-entry',
  apply() { counter++; (globalThis as any).__counter = counter },
  serialize() { return { counter } },
  restore(state: any) { counter = state.counter; (globalThis as any).__restored = counter },
}
`
  writeFileSync(entry, source('// v1'))

  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(dir).href + '/'
  await ctx.plugin(Timer)
  await ctx.plugin(Loader)
  await ctx.plugin(Hmr, { root: [dir], ignored: [], debounce: 50 })
  await ctx.loader.create({ name: pathToFileURL(entry).href })
  await ctx.loader.await()
  assert.equal((globalThis as any).__counter, 1, '初始 apply 后 counter 应为 1')

  const reloaded = new Promise<void>((resolve) => {
    const off = ctx.on('hmr/reload', () => { off(); resolve() })
  })
  writeFileSync(entry, source('// v2'))
  await Promise.race([
    reloaded,
    new Promise((_, reject) => setTimeout(() => reject(new Error('HMR 超时')), 8000)),
  ])
  await ctx.loader.await()
  await new Promise(resolve => setTimeout(resolve, 100))
  assert.equal((globalThis as any).__restored, 1, '旧插件的状态应迁移到新插件')

  await ctx.fiber.dispose()
})
