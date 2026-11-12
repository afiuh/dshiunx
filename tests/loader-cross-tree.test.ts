import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import Loader, { Group } from '@deepseek-ai/cordis-plugin-loader'

test('跨树移动：entry 在 group 与 root 之间移动，插件不丢', async () => {
  const root = new Context()
  root.baseUrl = new URL('./fixtures/', import.meta.url).href
  await root.plugin(Loader)

  // 建一个 group（cordis-plugin-group 导出 Group 类）
  await root.loader.create({ id: 'group1', name: '@deepseek-ai/cordis-plugin-group', config: [] })
  await root.loader.await()
  const groupEntry = root.loader.store['group1']
  assert.ok(groupEntry?.subgroup, 'group1 应有 subgroup')

  // 在 group1 下建插件
  await root.loader.create({ id: 'child', name: './hello-plugin.ts' }, 'group1')
  await root.loader.await()
  assert.equal((globalThis as any).__dshiunx_hello, true, '子插件应已加载')

  // 移回 root（跨树移动）
  await root.loader.update('child', { name: './hello-plugin.ts' }, null)
  await root.loader.await()
  assert.equal((globalThis as any).__dshiunx_hello, true, '移动后插件仍应加载')
  assert.equal(root.loader.store['child']?.parent, root.loader.root, 'child 应挂在 root 下')

  root.loader.remove('child')
  root.loader.remove('group1')
  await root.loader.await()
})
