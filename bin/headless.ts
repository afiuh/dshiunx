import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import yaml from 'js-yaml'
import { brandString } from '@deepseek-ai/dsh-brand'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'

const task = process.argv.slice(2).join(' ').trim()
if (!task) {
  console.error('usage: dshiunx "task"')
  process.exit(2)
}

const entries = yaml.load(readFileSync(fileURLToPath(new URL('../packages/bundle-arch/entries.yml', import.meta.url)), 'utf8')) as Array<{
  id: string
  name: string
  config?: any
}>

const ctx = new Context()
await ctx.plugin(Loader)
for (const entry of entries) {
  await ctx.loader.create({ id: entry.id, name: entry.name, config: entry.config })
}
await ctx.loader.await()

const agents = ctx.get('agents') as any
const sessions = ctx.get('sessions') as any
if (!agents || !sessions) {
  throw new Error('missing core services: agents / sessions')
}

// 第一版直接指定 provider/model；以后接 agent-default-model 或配置。
const selection = { provider: 'deepseek-official', model: 'deepseek-chat' }
const agentOptions = { provider: selection.provider, model: selection.model }
const setup = (agentCtx: Context) => {
  installModelSelection(agentCtx, { current: selection, assembled: undefined })
}
const sessionId = brandString(`session-${randomUUID()}`)
const fs = ctx.get('fs') as any
const cwd = fs === undefined ? process.cwd() : fs.processPath(await fs.resolve('.'))
const { agent } = await agents.create({ sessionId, meta: { cwd }, agentOptions, setup })
ctx.on('agent/error', ({ agent: subject, error }: any) => {
  if (subject === agent) console.error('agent/error:', error?.message ?? error)
})
await agent.whenIdle()

const firstSeq = agent.session.seq
agent.followup(createUserMessage({
  content: [{ type: 'text', text: task }],
  source: { kind: 'user' },
}))
await agent.whenIdle()
await sessions.flush(agent.session)

let text = ''
for (let seq = firstSeq; seq < agent.session.seq; seq++) {
  const event = agent.session.eventAt(SessionSeq(seq))
  if (event?.type === 'assistant/message') {
    const joined = event.data.message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('')
    if (joined !== '') text = joined
  }
}
console.log(text)
await ctx.fiber.dispose()
