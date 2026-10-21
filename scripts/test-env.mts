/**
 * dshiunx 可复用测试环境。
 *
 * 用法：
 *   npx tsx scripts/test-env.mts list
 *   npx tsx scripts/test-env.mts ask standard "你好"
 *   npx tsx scripts/test-env.mts run standard docs/test-questions.json
 *   npx tsx scripts/test-env.mts run-all docs/test-questions.json
 *
 * 问题集格式（JSON）：
 *   [{ "id": 1, "title": "语义降维", "text": "..." }, ...]
 */
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { boot } from '@deepseek-ai/dsh-app-boot'
import { brandString } from '@deepseek-ai/dsh-brand'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'

export interface Question {
  id: number
  title: string
  text: string
}

export interface Answer {
  preset: string
  questionId: number
  title: string
  text: string
  tools: string[]
}

export interface Harness {
  listPresets(): Promise<string[]>
  ask(preset: string, text: string): Promise<{ text: string; tools: string[] }>
  run(preset: string, questions: Question[]): Promise<Answer[]>
  dispose(): Promise<void>
}

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))

export async function createHarness(): Promise<Harness> {
  const ctx = await boot('dshiunx-test', `${entriesDir}entries.yml`, [], (hostCtx) => {
    hostCtx.provide('profileContext', {
      name: 'dshiunx', dir: `${process.cwd()}/profiles/default`,
      patchPath: `${process.cwd()}/profiles/default/cordis.patch.yml`,
      installAnchor: process.cwd(), cwd: process.cwd(), home: process.env.HOME ?? '',
      startedBundles: [], overlays: [], telemetryDisabledEnv: undefined,
    })
  })
  const agents = ctx.get('agents') as any
  const sessions = ctx.get('sessions') as any
  const presets = ctx.get('agentPresets') as any
  const fs = ctx.get('fs') as any
  const cwd = fs === undefined ? process.cwd() : fs.processPath(await fs.resolve('.'))
  const selection = { provider: 'deepseek-official', model: process.env.DSHIUNX_MODEL ?? 'deepseek-chat' }
  const agentOptions = { provider: selection.provider, model: selection.model }

  async function ask(preset: string, text: string) {
    const sessionId = brandString(`session-${randomUUID()}`)
    const { agent } = await agents.create({
      sessionId,
      meta: { cwd, agentPreset: preset },
      agentOptions,
      setup: async (agentCtx: any) => {
        installModelSelection(agentCtx, { current: selection, assembled: undefined })
        await presets.mount(agentCtx, preset)
      },
    })
    await agent.whenIdle()
    const tools = agent.ctx?.tools?.schemas?.().map((s: any) => s.name) ?? []
    const firstSeq = agent.session.seq
    agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
    await agent.whenIdle()
    await sessions.flush(agent.session)
    let reply = ''
    for (let seq = firstSeq; seq < agent.session.seq; seq++) {
      const event = agent.session.eventAt(SessionSeq(seq))
      if (event?.type === 'assistant/message') {
        const joined = event.data.message.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
        if (joined) reply = joined
      }
    }
    await agent.dispose?.()
    return { text: reply, tools }
  }

  return {
    async listPresets() {
      const roster = await presets.list()
      return roster.map((p: any) => p.id)
    },
    ask,
    async run(preset, questions) {
      const concurrency = Number(process.env.DSHIUNX_CONCURRENCY ?? 4)
      const out: Answer[] = []
      let next = 0
      async function worker() {
        while (true) {
          const i = next++
          if (i >= questions.length) return
          const q = questions[i]
          const { text, tools } = await ask(preset, q.text)
          out.push({ preset, questionId: q.id, title: q.title, text, tools })
          console.log(`[${preset}] ${out.length}/${questions.length} Q${q.id} ${q.title}: ${text.slice(0, 100).replace(/\n/g, ' ')}...`)
        }
      }
      await Promise.all(Array.from({ length: Math.min(concurrency, questions.length) }, worker))
      return out
    },
    async dispose() {
      await ctx.fiber.dispose()
    },
  }
}

// CLI
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const [, , command, ...args] = process.argv
  const harness = await createHarness()
  try {
    if (command === 'list') {
      const presets = await harness.listPresets()
      console.log(presets.join('\n'))
    } else if (command === 'ask') {
      const [preset, ...rest] = args
      if (!preset || rest.length === 0) throw new Error('usage: ask <preset> <text>')
      const { text, tools } = await harness.ask(preset, rest.join(' '))
      console.log(`tools(${tools.length}): ${tools.join(', ')}`)
      console.log(text)
    } else if (command === 'run' || command === 'run-all') {
      const preset = command === 'run-all' ? '' : args[0]
      const file = command === 'run-all' ? args[0] : args[1]
      if (!file) throw new Error('usage: run <preset> <questions.json> | run-all <questions.json>')
      const questions = JSON.parse(readFileSync(file, 'utf8')) as Question[]
      const presets = command === 'run-all' ? await harness.listPresets() : [preset]
      const results: Answer[] = []
      for (const p of presets) results.push(...await harness.run(p, questions))
      mkdirSync(fileURLToPath(new URL('../docs/', import.meta.url)), { recursive: true })
      const out = fileURLToPath(new URL('../docs/test-results.json', import.meta.url))
      writeFileSync(out, JSON.stringify(results, null, 2))
      console.log(`\nwritten ${out} (${results.length} answers)`)
    } else {
      console.error('usage: list | ask <preset> <text> | run <preset> <questions.json> | run-all <questions.json>')
      process.exitCode = 2
    }
  } finally {
    await harness.dispose()
  }
}
