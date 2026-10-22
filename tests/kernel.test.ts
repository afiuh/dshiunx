import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Group from '@deepseek-ai/cordis-plugin-group'

async function makeRoot() {
  const root = new Context()
  root.baseUrl = new URL('./fixtures/', import.meta.url).href
  await root.plugin(Loader)
  root.loader.builtins.group = Group
  return root
}

test('嵌套 group：2 层加载与卸载', async () => {
  const root = await makeRoot()
  ;(globalThis as any).__probe = []

  await root.loader.create({
    id: 'outer',
    name: 'cordis:group',
    group: true,
    config: [{
      id: 'inner',
      name: 'cordis:group',
      group: true,
      config: [{ id: 'leaf', name: './probe.ts', config: { tag: 'leaf' } }],
    }],
  })
  await root.loader.await()
  assert.deepEqual((globalThis as any).__probe, ['leaf'], '2 层 group 内的插件应加载')

  root.loader.remove('outer')
  await new Promise(resolve => setTimeout(resolve, 50))
  assert.deepEqual((globalThis as any).__probe, [], '卸载 outer 应级联卸载 leaf')
})

test('isolate：局部作用域互不可见', async () => {
  const root = await makeRoot()
  await root.loader.create({
    id: 'a', name: './value-provider.ts',
    isolate: { value: true }, config: { tag: 'A' },
  })
  await root.loader.create({
    id: 'b', name: './value-provider.ts',
    isolate: { value: true }, config: { tag: 'B' },
  })
  await root.loader.await()

  const a = root.loader.resolve('a')
  const b = root.loader.resolve('b')
  assert.equal(a.ctx.get('value').tag, 'A')
  assert.equal(b.ctx.get('value').tag, 'B')
  assert.notEqual(a.ctx.get('value'), b.ctx.get('value'), '两个局部 scope 的服务实例应不同')
})

test('配置：schema 默认值', async () => {
  const root = await makeRoot()
  await root.loader.create({ name: './config-probe.ts' })
  await root.loader.await()
  assert.equal((globalThis as any).__config_tag, 'default', '未传 config 时应使用 schema 默认值')
})

test('配置：非法配置进入 FAILED', async () => {
  const root = await makeRoot()
  const entry = root.loader.resolve(await root.loader.create({ name: './config-probe.ts', config: { tag: 123 } }))
  await root.loader.await()
  assert.notEqual(entry.fiber?.state, undefined)
  // fiber 不应处于 ACTIVE
  assert.notEqual(entry.fiber?.state, 2, '非法配置不应让插件进入 ACTIVE')
})

test('错误隔离：单个 entry 失败不影响其他', async () => {
  const root = await makeRoot()
  ;(globalThis as any).__probe = []
  await root.loader.create({ id: 'fail', name: './fail.ts' })
  await root.loader.create({ id: 'ok', name: './probe.ts', config: { tag: 'ok' } })
  await root.loader.await()
  assert.deepEqual((globalThis as any).__probe, ['ok'], 'fail 不应阻塞 ok')
})

test('事件：emit / serial / bail / waterfall', async () => {
  const ctx = new Context()
  const log: string[] = []

  ;(ctx as any).on('e', () => log.push('a'))
  ;(ctx as any).on('e', () => log.push('b'))
  ;(ctx as any).emit('e')
  assert.deepEqual(log, ['a', 'b'])

  log.length = 0
  ;(ctx as any).on('s', () => { log.push('1') })
  ;(ctx as any).on('s', () => { log.push('2') })
  await (ctx as any).serial('s')
  assert.deepEqual(log, ['1', '2'])

  log.length = 0
  ;(ctx as any).on('b', () => 'stop')
  ;(ctx as any).on('b', () => log.push('never'))
  assert.equal((ctx as any).bail('b'), 'stop')
  assert.deepEqual(log, [])

  ;(ctx as any).on('w', (_v: number, next: () => number) => next() + 1)
  ;(ctx as any).on('w', (_v: number, next: () => number) => next() + 10)
  assert.equal((ctx as any).waterfall('w', 0, () => 0), 11)
})

test('嵌套 group：3 层', async () => {
  const root = await makeRoot()
  ;(globalThis as any).__probe = []
  await root.loader.create({
    id: 'l1', name: 'cordis:group', group: true,
    config: [{
      id: 'l2', name: 'cordis:group', group: true,
      config: [{
        id: 'l3', name: 'cordis:group', group: true,
        config: [{ id: 'leaf', name: './probe.ts', config: { tag: 'deep' } }],
      }],
    }],
  })
  await root.loader.await()
  assert.deepEqual((globalThis as any).__probe, ['deep'], '3 层 group 内的插件应加载')
})

test('isolate：同 label 共享作用域', async () => {
  const root = await makeRoot()
  await root.loader.create({
    id: 'provider', name: './value-provider.ts',
    isolate: { value: 'shared' }, config: { tag: 'shared-tag' },
  })
  await root.loader.create({
    id: 'consumer', name: './value-consumer.ts',
    isolate: { value: 'shared' },
  })
  await root.loader.await()
  assert.equal((globalThis as any).__value_tag, 'shared-tag', '同 label 的 consumer 应看到 provider 的实例')
})

test('waterfall：不调用 next 就 veto', () => {
  const ctx = new Context()
  ;(ctx as any).on('w', () => 'vetoed')
  ;(ctx as any).on('w', (_v: number, next: () => number) => next() + 1)
  assert.equal((ctx as any).waterfall('w', 0, () => 0), 'vetoed', '不调用 next 的监听器应 veto 后续链')
})

test('volatile：改值不重挂插件', async () => {
  const root = await makeRoot()
  ;(globalThis as any).__volatile_tag = undefined
  ;(globalThis as any).__volatile_updated = undefined
  ;(globalThis as any).__volatile_remounts = 0

  const id = await root.loader.create({ id: 'v', name: './volatile-probe.ts', config: { tag: 'a' } })
  await root.loader.await()
  assert.equal((globalThis as any).__volatile_tag, 'a')
  assert.equal((globalThis as any).__volatile_remounts, 1)

  await root.loader.update(id, { config: { tag: 'b' } })
  await new Promise(resolve => setTimeout(resolve, 50))
  assert.equal((globalThis as any).__volatile_updated, 'b', 'volatile 变化应触发 loader/volatile-update')
  assert.equal((globalThis as any).__volatile_remounts, 1, 'volatile 变化不应重挂插件')
})
