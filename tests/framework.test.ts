import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'

test('时间可组合性：插件卸载时 effect 自动撤销', async () => {
  const root = new Context()
  const log: string[] = []

  const fiber = root.plugin((ctx) => {
    ctx.effect(() => {
      log.push('install')
      return () => {
        log.push('dispose')
      }
    })
  })

  await fiber
  assert.deepEqual(log, ['install'], '插件启动后 effect 应已安装')

  await fiber.dispose()
  assert.deepEqual(log, ['install', 'dispose'], '插件卸载后 effect 应自动撤销')
})

test('空间可组合性：provider 卸载后 consumer 自动停用', async () => {
  class Counter extends Service {
    value = 0

    constructor(ctx: Context) {
      super(ctx, 'counter')
    }

    next() {
      return ++this.value
    }
  }

  const root = new Context()
  const log: string[] = []

  const provider = root.plugin(Counter)
  await provider

  const consumer = root.plugin(
    Object.assign(
      (ctx: Context) => {
        log.push('consumer-start')
        ctx.effect(() => () => log.push('consumer-stop'))
        assert.equal((ctx as any).counter.next(), 1)
      },
      { inject: ['counter'] },
    ),
  )

  await consumer
  assert.deepEqual(log, ['consumer-start'], 'consumer 应在 provider 就绪后启动')

  await provider.dispose()
  assert.ok(log.includes('consumer-stop'), 'provider 卸载后 consumer 应自动停用')

  await consumer.dispose()
})

test('effect 的逆按 LIFO 执行', async () => {
  const root = new Context()
  const log: string[] = []

  const fiber = root.plugin((ctx) => {
    ctx.effect(() => {
      log.push('a')
      return () => log.push('a-dispose')
    })
    ctx.effect(() => {
      log.push('b')
      return () => log.push('b-dispose')
    })
  })

  await fiber
  assert.deepEqual(log, ['a', 'b'])

  await fiber.dispose()
  assert.deepEqual(log, ['a', 'b', 'b-dispose', 'a-dispose'])
})
