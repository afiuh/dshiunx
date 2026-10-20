import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'

test('loader 按声明式配置加载插件', async () => {
  const root = new Context()
  root.baseUrl = new URL('./fixtures/', import.meta.url).href
  await root.plugin(Loader)

  const id = await root.loader.create({ name: './hello-plugin.ts' })
  await root.loader.await()
  assert.equal((globalThis as any).__dshiunx_hello, true, '插件应已加载')

  root.loader.remove(id)
  await root.loader.await()
  assert.equal((globalThis as any).__dshiunx_hello, false, '卸载后 effect 应撤销')
})
