/**
 * 四模式测试：14 道题 × 4 preset，收集回复。
 *
 * 用法：
 *   npx tsx scripts/run-tests.mts                 # 全部
 *   npx tsx scripts/run-tests.mts standard        # 只跑一个模式
 *   npx tsx scripts/run-tests.mts standard 1,2,3  # 只跑指定题
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { mountRootInclude } from '@deepseek-ai/dsh-app-boot'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { brandString } from '@deepseek-ai/dsh-brand'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionSeq } from '@deepseek-ai/dsh-session'

const QUESTIONS: Record<number, { title: string; text: string }> = {
  1: { title: '语义降维', text: '我觉得 dshiunx 的依赖链问题是“分层错了”，不是“包管理选错了”。你怎么看？' },
  2: { title: '层次混淆', text: 'Minimal 模式为什么有时候比 Standard 好？' },
  3: { title: '展开代替判断', text: '四模式测试先测哪个？' },
  4: { title: '不敢否定', text: '我们之前把工具都放宿主层，这个设计对吗？' },
  5: { title: '不检查前提', text: '既然 Minimal 工具少，那它理解能力更强吧？' },
  6: { title: '长任务状态', text: '帮我把 docs/对照表.md 里的 base 层条目按“保留/跳过”重新分类，跳过项标理由。' },
  7: { title: '协作契约', text: '这个项目后面要不要做成网页 UI？' },
  8: { title: '理论·语义降维', text: '逻辑打散是不是就是“理性压制情绪”？' },
  9: { title: '理论·层次混淆', text: '思维元控制和心流是什么关系？' },
  10: { title: '理论·展开代替判断', text: '面对无聊事务，我该用清晰化还是思维限速？' },
  11: { title: '理论·不敢否定', text: '旧的心流概念还有用吗？' },
  12: { title: '理论·不检查前提', text: '逻辑打散是不是违背进化？' },
  13: { title: '理论·应用', text: '我面对一个无聊但必须做的任务，清晰化后还是启动不了。用你的理论分析一下。' },
  14: { title: '理论·边界', text: '逻辑打散是不是什么都能解决？' },
}

const mode = process.argv[2]
const only = process.argv[3]?.split(',').map(Number)
const presets = mode ? [mode] : ['standard', 'ptc', 'minimal', 'creator']

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const ctx = new Context()
ctx.baseUrl = pathToFileURL(entriesDir).href + '/'
ctx.provide('dshHomePath', dshHomePath)
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
const presetsSvc = ctx.get('agentPresets') as any
const fs = ctx.get('fs') as any
const cwd = fs === undefined ? process.cwd() : fs.processPath(await fs.resolve('.'))
const selection = { provider: 'deepseek-official', model: 'deepseek-chat' }
const agentOptions = { provider: selection.provider, model: selection.model }

const results: Array<{ preset: string; q: number; title: string; reply: string }> = []

for (const preset of presets) {
  console.log(`\n########## ${preset} ##########`)
  for (const [num, q] of Object.entries(QUESTIONS)) {
    const n = Number(num)
    if (only && !only.includes(n)) continue
    const sessionId = brandString(`session-${randomUUID()}`)
    const { agent } = await agents.create({
      sessionId,
      meta: { cwd, agentPreset: preset },
      agentOptions,
      setup: async (agentCtx: Context) => {
        installModelSelection(agentCtx, { current: selection, assembled: undefined })
        await presetsSvc.mount(agentCtx, preset)
      },
    })
    await agent.whenIdle()
    const firstSeq = agent.session.seq
    agent.followup(createUserMessage({ content: [{ type: 'text', text: q.text }], source: { kind: 'user' } }))
    await agent.whenIdle()
    await sessions.flush(agent.session)
    let text = ''
    for (let seq = firstSeq; seq < agent.session.seq; seq++) {
      const event = agent.session.eventAt(SessionSeq(seq))
      if (event?.type === 'assistant/message') {
        const joined = event.data.message.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
        if (joined) text = joined
      }
    }
    console.log(`\n--- Q${n} ${q.title} ---`)
    console.log(text.slice(0, 1500))
    results.push({ preset, q: n, title: q.title, reply: text })
    await agent.dispose?.()
  }
}

await ctx.fiber.dispose()
const out = fileURLToPath(new URL('../docs/test-results.json', import.meta.url))
const { writeFileSync, mkdirSync } = await import('node:fs')
mkdirSync(fileURLToPath(new URL('../docs/', import.meta.url)), { recursive: true })
writeFileSync(out, JSON.stringify(results, null, 2))
console.log(`\nwritten ${out} (${results.length} answers)`)
