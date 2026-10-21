/**
 * 最小可用性测试：对四个 preset 各创建一个 agent，让它介绍自己能干什么。
 *
 * 用法：npx tsx scripts/verify-presets.mts
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { mountRootInclude } from '@deepseek-ai/dsh-app-boot'
import { pathToFileURL } from 'node:url'
import { brandString } from '@deepseek-ai/dsh-brand'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const ctx = new Context()
ctx.baseUrl = pathToFileURL(entriesDir).href + '/'
ctx.provide('profileContext', {
  name: 'dshiunx', dir: `${process.cwd()}/profiles/default`,
  patchPath: `${process.cwd()}/profiles/default/cordis.patch.yml`,
  installAnchor: process.cwd(), cwd: process.cwd(), home: process.env.HOME ?? '',
  startedBundles: [], overlays: [], telemetryDisabledEnv: undefined,
})
await ctx.plugin(Loader)
await mountRootInclude(ctx, `${entriesDir}entries.yml`, [], undefined, 'dshiunx')
await ctx.get('loader')?.await()

const agents = ctx.get('agents') as any
const sessions = ctx.get('sessions') as any
const presets = ctx.get('agentPresets') as any
const fs = ctx.get('fs') as any
if (!agents || !sessions || !presets) throw new Error('missing core services')

const roster = await presets.list()
console.log('presets:', roster.map((p: any) => p.id).join(', '))
const cwd = fs === undefined ? process.cwd() : fs.processPath(await fs.resolve('.'))

const selection = { provider: 'deepseek-official', model: 'deepseek-chat' }
const agentOptions = { provider: selection.provider, model: selection.model }

for (const preset of roster) {
  console.log(`\n===== ${preset.id} =====`)
  try {
  const sessionId = brandString(`session-${randomUUID()}`)
  const setup = async (agentCtx: Context) => {
    installModelSelection(agentCtx, { current: selection, assembled: undefined })
    await presets.mount(agentCtx, preset.id)
  }
  const { agent } = await agents.create({ sessionId, meta: { cwd, agentPreset: preset.id }, agentOptions, setup })
  ctx.on('agent/error', ({ agent: subject, error }: any) => {
    if (subject === agent) console.error('agent/error:', error?.message ?? error)
  })
  await agent.whenIdle()

  const tools = agent.ctx?.tools?.schemas?.() ?? []
  console.log('tools:', tools.length, tools.map((t: any) => t.name).join(', '))

  const firstSeq = agent.session.seq
  agent.followup(createUserMessage({
    content: [{ type: 'text', text: '请用两三句话介绍你自己，以及你能做什么。' }],
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
  console.log('reply:', text.slice(0, 500))
  await agent.dispose?.()
  } catch (err: any) {
    console.log('FAILED:', err?.message?.split('\n')[0] ?? err)
  }
}

await ctx.fiber.dispose()
