import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import Timer from '@deepseek-ai/cordis-plugin-timer'
import Include from '@deepseek-ai/cordis-plugin-include'
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

test('时间与调度：fiber dispose 后定时器清理', async () => {
  const ctx = new Context()
  await ctx.plugin(Timer)
  let fired = 0
  const fiber = ctx.plugin(Object.assign((c: any) => {
    c.timeout(() => { fired++ }, 50)
  }, { inject: ['timer'] }))
  await fiber
  await fiber.dispose()
  await new Promise(r => setTimeout(r, 100))
  assert.equal(fired, 0, 'dispose 后定时器不应触发')
})

test('事件：parallel 错误聚合 / once / prepend', async () => {
  const ctx = new Context()
  const log: string[] = []
  ;(ctx as any).on('p', async () => { throw new Error('boom') })
  await assert.rejects(() => (ctx as any).parallel('p'), AggregateError)

  ;(ctx as any).once('o', () => { log.push('once') })
  ;(ctx as any).emit('o')
  ;(ctx as any).emit('o')
  assert.deepEqual(log, ['once'], 'once 只触发一次')

  log.length = 0
  ;(ctx as any).on('x', () => { log.push('a') })
  ;(ctx as any).on('x', () => { log.push('b') }, { prepend: true })
  ;(ctx as any).emit('x')
  assert.deepEqual(log, ['b', 'a'], 'prepend 应插到最前')
})

test('Service：check 谓词阻止依赖者启动', async () => {
  class Gated extends Service {
    [Service.check]() { return false }
    constructor(ctx: any) { super(ctx, 'gated') }
  }
  const ctx = new Context()
  await ctx.plugin(Gated)
  let started = false
  const consumer = ctx.plugin(Object.assign((_c: any) => { started = true }, { inject: ['gated'] }))
  await new Promise(r => setTimeout(r, 50))
  assert.equal(started, false, 'check=false 时依赖者不应启动')
  await consumer.dispose()
})

test('include：配置文件加载与 patch', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dshiunx-include-'))
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}\n')
  writeFileSync(join(dir, 'probe.ts'), `export default { name: 'inc-probe', apply(ctx: any, config: any) { (globalThis as any).__inc = config?.tag ?? 'default' } }\n`)
  writeFileSync(join(dir, 'cordis.yml'), `- id: p\n  name: ./probe.ts\n`)

  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(dir).href + '/'
  await ctx.plugin(Loader)
  const include = await ctx.plugin(Include, { path: 'cordis.yml', patches: [{ id: 'p', config: { tag: 'patched' } }] })
  await ctx.loader.await()
  assert.equal((globalThis as any).__inc, 'patched', 'patch 应覆盖配置')
  await include.dispose()
})

test('嵌套 group：disabled 级联', async () => {
  const root = await makeRoot()
  ;(globalThis as any).__probe = []
  await root.loader.create({
    id: 'g', name: 'cordis:group', group: true, disabled: true,
    config: [{ id: 'leaf', name: './probe.ts', config: { tag: 'leaf' } }],
  })
  await root.loader.await()
  assert.deepEqual((globalThis as any).__probe, [], 'disabled group 的子插件不应加载')
})

test('intercept：配置合并（intercept 覆盖 base）', async () => {
  class Configured extends Service {
    tag: string
    constructor(ctx: any, config: any) {
      super(ctx, 'configured')
      const merged = (this as any)[Service.resolveConfig](config)
      this.tag = merged.tag
    }
  }
  const ctx = new Context()
  await ctx.plugin(Configured, { tag: 'base' })
  const child = ctx.intercept('configured', { tag: 'overridden' })
  const fiber = child.plugin((c: any) => {
    const svc = c.get('configured')
    const merged = svc[Service.resolveConfig]({ tag: 'local' })
    ;(globalThis as any).__intercept = merged.tag
  })
  await fiber
  assert.equal((globalThis as any).__intercept, 'overridden', 'intercept 配置应覆盖 base')
  await fiber.dispose()
})
