import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'

test('entry id 允许冒号（DSH 0.2.2 修复）', async () => {
  const root = new Context()
  root.baseUrl = new URL('./fixtures/', import.meta.url).href
  await root.plugin(Loader)

  const id = await root.loader.create({ id: 'bundle:preset:standard', name: './hello-plugin.ts' })
  await root.loader.await()
  assert.equal(id, 'bundle:preset:standard', '带冒号的 id 应原样保留')
  const entry = root.loader.store[id]
  assert.ok(entry, 'store 里应有这个 id')
  assert.equal((globalThis as any).__dshiunx_hello, true, '插件应已加载')

  entry.fiber?.dispose()
  await root.loader.await()
  assert.equal((globalThis as any).__dshiunx_hello, false, '卸载后 effect 应撤销')
})
