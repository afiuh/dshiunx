import { Renderer } from './renderer.ts'
import { projectSessionEvent } from './projection.ts'
import type { ViewEvent } from './view-event.ts'
import { StatusBar } from './status.ts'
import { startInput } from './input.ts'
import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'tui'
export const inject = ['agents', 'sessions', 'agentPresets']

/**
 * 最小 TUI 插件：订阅 session 事件，投影成 ViewEvent，交给 ANSI renderer。
 * 不弹审批；Ctrl+C 取消当前 turn。
 */
export function apply(ctx: any): void {
  const renderer = new Renderer()
  let currentAgent: any
  const status = new StatusBar()
  const emit = (event: ViewEvent) => {
    if (event.kind === 'text-delta') status.clear()
    renderer.write(event)
  }

  ctx.effect(() => {
    const off = ctx.on('session/event', (_session: any, event: any) => {
      const view = projectSessionEvent(event)
      if (view) emit(view)
    })
    return () => off?.()
  }, 'tui.session-events')

  ctx.effect(() => {
    const off = ctx.on('session/event', (_session: any, event: any) => {
      if (event?.type === 'turn/end') {
        status.render({ model: process.env.DSHIUNX_MODEL ?? 'deepseek-chat', working: false })
      }
    })
    return () => off?.()
  }, 'tui.status')

  // 输入接线：Enter 创建/复用 agent 并发送；Ctrl+C 取消；Ctrl+D 退出。
  const input = startInput({
    onSubmit(text) {
      void (async () => {
        try {
          if (!currentAgent) {
            const agents = ctx.get('agents') as any
            const presets = ctx.get('agentPresets') as any
            const selection = { provider: 'deepseek-official', model: process.env.DSHIUNX_MODEL ?? 'deepseek-chat' }
            const { agent } = await agents.create({
              sessionId: `session-${Date.now()}`,
              meta: { cwd: process.cwd() },
              agentOptions: selection,
              setup: async (agentCtx: any) => {
                await presets.mount(agentCtx, 'standard')
              },
            })
            currentAgent = agent
          }
          status.render({ model: process.env.DSHIUNX_MODEL ?? 'deepseek-chat', working: true })
          currentAgent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
          await currentAgent.whenIdle()
        } catch (error: any) {
          renderer.write({ kind: 'error', message: error?.message ?? String(error) })
        }
      })()
    },
    onCancel() {
      currentAgent?.interrupt?.()
    },
    onExit() {
      process.exit(0)
    },
    onClear() {
      process.stdout.write('\x1b[2J\x1b[H')
    },
    onToggleTools() {
      // 工具卡展开/折叠：先留空，后续实现
    },
    onRewind() {
      // double-Esc 回滚：先留空，后续实现
    },
  })
  ctx.effect(() => () => input.close(), 'tui.input')
}
