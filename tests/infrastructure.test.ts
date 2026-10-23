import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import * as yaml from 'js-yaml'

test('gen-catalog：6 类 + 总数 > 0', () => {
  execSync('node scripts/gen-catalog.mjs', { stdio: 'ignore' })
  const catalog: any = yaml.load(readFileSync('packages/bundle-arch/catalog.yml', 'utf8'))
  assert.ok(catalog.total > 0, '应有 entry')
  const cats = Object.keys(catalog.categories).sort()
  assert.deepEqual(cats, ['agent', 'assembly', 'kernel', 'runtime', 'tool', 'ui'], '应有 6 类')
})

test('build-entries：输出包含 base/preset/tui', () => {
  execSync('node scripts/build-entries.mjs', { stdio: 'ignore' })
  const entries = readFileSync('packages/bundle-arch/entries.yml', 'utf8')
  assert.ok(entries.includes('agent-preset-registry'), '应包含 base 的 agent-preset-registry')
  assert.ok(entries.includes('preset-standard'), '应包含 standard preset')
  assert.ok(entries.includes('tui-protocol'), '应包含 tui')
})

test('profile：default 包含 6 个 bundle', () => {
  const profile: any = yaml.load(readFileSync('profiles/default/profile.yml', 'utf8'))
  assert.equal(profile.bundles.length, 6)
  assert.deepEqual(profile.bundles, ['base', 'presets/standard', 'presets/ptc', 'presets/minimal', 'presets/creator', 'tui'])
})
