import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sessionFormatV0ToV1, releasedV0SessionFormatCodec } from '@deepseek-ai/dsh-session-format-v0-to-v1'
import { sessionFormatCatalog } from '@deepseek-ai/dsh-session-format-catalog'

test('session v0→v1 迁移器已导出（DSH 0.2.2 修复）', () => {
  assert.ok(sessionFormatV0ToV1, 'v0→v1 迁移器应存在')
  assert.equal(typeof sessionFormatV0ToV1, 'object', '迁移器应是对象')
})

test('v0 codec 已冻结（released）', () => {
  assert.ok(releasedV0SessionFormatCodec, 'v0 codec 应存在')
})

test('当前 catalog 可用', () => {
  assert.ok(sessionFormatCatalog, 'catalog 应存在')
})
