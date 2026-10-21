#!/usr/bin/env node
/**
 * dshiunx 依赖管理：唯一入口（tsconfig paths 模式）。
 *
 * 原则：
 *   - 包只保留 name / private / type / main / exports
 *   - 所有 @deepseek-ai/* 走 tsconfig paths，不走包管理器
 *   - 根 package.json 只装外部依赖
 *
 * 用法：
 *   node scripts/deps.mjs sync     简化 package.json + 生成 tsconfig paths
 *   node scripts/deps.mjs check    检查：entries 包存在、paths 映射、无发布元数据残留
 *   node scripts/deps.mjs install  npm install（只装根外部依赖）
 *   node scripts/deps.mjs verify   跑 bin/dshiunx.ts，检查 51/51 ACTIVE
 *   node scripts/deps.mjs all      sync → check → install → verify
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import yaml from 'js-yaml'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CFG = JSON.parse(readFileSync(join(ROOT, 'scripts/deps.config.json'), 'utf8'))
const abs = (p) => join(ROOT, p)
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n')

function packageFiles() {
  return readdirSync(abs(CFG.packagesDir))
    .filter((d) => d !== 'bundle-arch')
    .map((d) => join(CFG.packagesDir, d, 'package.json'))
    .filter((p) => existsSync(p))
}

function packages() {
  const map = new Map()
  for (const file of packageFiles()) {
    const pkg = readJson(file)
    if (pkg.name) map.set(pkg.name, { file, pkg })
  }
  return map
}

function entries() {
  return yaml.load(readFileSync(abs(CFG.entriesFile), 'utf8'))
}

function baseName(n) {
  if (!n.startsWith('@')) return n
  const parts = n.split('/')
  return parts.length > 2 ? parts.slice(0, 2).join('/') : n
}

function sync() {
  const map = packages()
  for (const [name, rec] of map) {
    const next = {
      name,
      private: true,
      type: 'module',
      main: 'src/index.ts',
      types: 'src/index.ts',
    }
    if (rec.pkg.exports) next.exports = rec.pkg.exports
    writeJson(rec.file, next)
  }

  const paths = {}
  for (const name of map.keys()) {
    paths[name] = [`${CFG.packagesDir}/${name.split('/').pop()}/src/index.ts`]
  }
  paths['@deepseek-ai/dsh-tool-subagent-control/list-agents'] = [
    `${CFG.packagesDir}/dsh-tool-subagent-control/src/list-agents.ts`,
  ]
  const ts = readJson(abs('tsconfig.json'))
  ts.compilerOptions = { ...ts.compilerOptions, baseUrl: '.', paths }
  writeJson(abs('tsconfig.json'), ts)

  console.log(`sync: packages=${map.size} paths=${Object.keys(paths).length}`)
}

function check() {
  const map = packages()
  const list = entries()
  const ts = readJson(abs('tsconfig.json'))
  const paths = ts.compilerOptions?.paths ?? {}

  const missingPackages = []
  const missingPaths = []
  const dirty = []
  for (const entry of list) {
    const base = baseName(entry.name)
    if (!map.has(base)) { missingPackages.push(entry.name); continue }
    if (!paths[base]) missingPaths.push(base)
    if (!paths[entry.name] && !paths[base]) missingPaths.push(entry.name)
  }
  for (const [name, rec] of map) {
    const p = rec.pkg
    if (p.version || p.dependencies || p.peerDependencies || p.devDependencies || p.files) {
      dirty.push(name)
    }
  }

  console.log(`check: entries=${list.length} packages=${map.size} paths=${Object.keys(paths).length}`)
  console.log(`  missing packages: ${missingPackages.length}`, missingPackages)
  console.log(`  missing paths:    ${missingPaths.length}`, missingPaths)
  console.log(`  publish metadata: ${dirty.length}`, dirty)
  if (missingPackages.length || missingPaths.length || dirty.length) process.exitCode = 1
}

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' })
}

function install() {
  run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'])
}

function verify() {
  const out = execFileSync('npx', ['tsx', CFG.entrypoint], { cwd: ROOT, encoding: 'utf8' })
  const active = (out.match(/ 2$/gm) ?? []).length
  const total = (out.match(/^  \S+/gm) ?? []).length
  console.log(out)
  console.log(`verify: ${active}/${total} active (expected ${CFG.expectedEntries})`)
  if (active !== CFG.expectedEntries) process.exitCode = 1
}

const command = process.argv[2] ?? 'check'
if (command === 'sync') sync()
else if (command === 'check') check()
else if (command === 'install') install()
else if (command === 'verify') verify()
else if (command === 'all') { sync(); check(); install(); verify() }
else {
  console.error('usage: node scripts/deps.mjs <sync|check|install|verify|all>')
  process.exit(2)
}
