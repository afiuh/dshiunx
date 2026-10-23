/** 从 entries.yml 生成 catalog.yml（插件索引，自动生成，不要手写）。 */
import { readFileSync, writeFileSync } from 'node:fs'
import * as yaml from 'js-yaml'

const entriesPath = 'packages/bundle-arch/entries.yml'
const outPath = 'packages/bundle-arch/catalog.yml'

const JsType = new yaml.Type('tag:yaml.org,2002:js', {
  kind: 'scalar',
  construct: (data) => ({ __jsExpr: data }),
})
const schema = yaml.DEFAULT_SCHEMA.extend([JsType])
const entries = yaml.load(readFileSync(entriesPath, 'utf8'), { schema })

function category(name) {
  if (/dsh-agent|dsh-system-prompt|dsh-persona|dsh-agent-preset|dsh-agent-instructions/.test(name)) return 'agent'
  if (/dsh-plugin-manager|dsh-plugin-market/.test(name)) return 'assembly'
  if (/dsh-tool-|dsh-subagent|dsh-subprocess|dsh-schedule|dsh-web|dsh-skill|dsh-command/.test(name)) return 'tool'
  if (/^@dshiunx\/tui|tui/.test(name)) return 'ui'
  if (/cordis|loader|hmr|timer/.test(name)) return 'kernel'
  return 'runtime'
}

function walk(list, parent = null) {
  const out = []
  for (const e of list) {
    if (!e || typeof e !== 'object') continue
    const name = e.name ?? ''
    if (e.id) out.push({ id: e.id, name, category: category(name), parent })
    if (e.group && Array.isArray(e.config)) {
      out.push(...walk(e.config, e.id ?? parent))
    } else if (e.config && Array.isArray(e.config.plugins)) {
      out.push(...walk(e.config.plugins, e.id ?? parent))
    }
  }
  return out
}

const all = walk(entries)
const seen = new Set()
const unique = all.filter((e) => {
  const key = `${e.id}|${e.name}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})
const byCategory = {}
for (const e of unique) (byCategory[e.category] ??= []).push(e)

const doc = {
  generated: new Date().toISOString().slice(0, 10),
  source: entriesPath,
  total: unique.length,
  categories: byCategory,
}
writeFileSync(outPath, yaml.dump(doc, { lineWidth: 120 }))
console.log(`catalog: ${unique.length} entries -> ${outPath}`)
