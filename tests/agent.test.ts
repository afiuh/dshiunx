import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as SystemPrompt from '../packages/dsh-system-prompt/src/index.ts'
import * as Persona from '../packages/dsh-persona/src/index.ts'
import * as Preset from '../packages/dsh-agent-preset/src/index.ts'
import * as Registry from '../packages/dsh-agent-preset-registry/src/index.ts'

test('system-prompt Config：5 个字段 + 默认值', () => {
  const schema = (SystemPrompt as any).default?.Config ?? (SystemPrompt as any).Config
  assert.ok(schema, 'Config 应存在')
  const parsed = schema['~standard'].validate({})
  assert.equal(parsed.issues, undefined, '空配置应通过（全部有默认值）')
  assert.equal(parsed.value.personaPrefix, '')
  assert.equal(parsed.value.personaSuffix, '')
  assert.equal(parsed.value.includeHarnessIdentity, true)
  assert.equal(parsed.value.includeRuntimeContext, true)
})

test('persona Config：prefix 必填 / suffix 默认空 / complete 默认 false', () => {
  const schema = (Persona as any).Config
  assert.ok(schema, 'Config 应存在')
  const missing = schema['~standard'].validate({})
  assert.ok(missing.issues, '缺 prefix 应报错')
  const parsed = schema['~standard'].validate({ prefix: 'hello' })
  assert.equal(parsed.issues, undefined)
  assert.equal(parsed.value.prefix, 'hello')
  assert.equal(parsed.value.suffix, '')
  assert.equal(parsed.value.complete, false)
  assert.equal(parsed.value.includeRuntimeContext, true)
})

test('agent-preset PresetDefinition：id + plugins 必填', () => {
  const schema = (Preset as any).default?.Config ?? (Preset as any).Config
  assert.ok(schema, 'Config 应存在')
  const missing = schema['~standard'].validate({})
  assert.ok(missing.issues, '缺 id/plugins 应报错')
  const parsed = schema['~standard'].validate({ id: 'standard', plugins: [] })
  assert.equal(parsed.issues, undefined)
  assert.equal(parsed.value.id, 'standard')
  assert.deepEqual(parsed.value.plugins, [])
})

test('agent-preset-registry Config：default 必填', () => {
  const schema = (Registry as any).default?.Config ?? (Registry as any).Config
  assert.ok(schema, 'Config 应存在')
  const missing = schema['~standard'].validate({})
  assert.ok(missing.issues, '缺 default 应报错')
  const parsed = schema['~standard'].validate({ default: 'standard' })
  assert.equal(parsed.issues, undefined)
  assert.equal(parsed.value.default, 'standard')
})
