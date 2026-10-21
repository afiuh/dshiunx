import { Text } from '@earendil-works/pi-tui'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { createTui } from './app.ts'
import { projectSessionEvent } from './projection.ts'

export const name = 'tui'
export const inject = ['agents', 'sessions', 'agentPresets']

/**
 * TUI 插件：pi-tui 布局（滚动区 + 编辑器 + 状态栏），
 * 事件 → ViewEvent → pi-tui 组件。
 */
export function apply(ctx: any): void {
  let currentAgent: any
  let streamText: Text | undefined
  let streamBuffer = ''

  const app = createTui({
    onSubmit(text) {
      void (async () => {
        try {
          if (!currentAgent) {
            const agents = ctx.get('agents') as any
            const presets = ctx.get('agentPresets') as any
            const selection = {
              provider: 'deepseek-official',
              model: process.env.DSHIUNX_MODEL ?? 'deepseek-chat',
            }
            const { agent } = await agents.create({
              sessionId: `session-${Date.now()}`,
              meta: { cwd: process.cwd() },
              agentOptions: selection,
              setup: async (agentCtx: any) => {
                await presets.mount(agentCtx, process.env.DSHIUNX_PRESET ?? 'standard')
              },
            })
            currentAgent = agent
          }
          app.setStatus(`⏺ ${process.env.DSHIUNX_MODEL ?? 'deepseek-chat'} · working`)
          currentAgent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
          await currentAgent.whenIdle()
          app.setStatus(`${process.env.DSHIUNX_MODEL ?? 'deepseek-chat'} · idle`)
        } catch (error: any) {
          app.append(new Text(`✗ ${error?.message ?? String(error)}`))
          app.setStatus('error')
        }
      })()
    },
    onCancel() {
      currentAgent?.interrupt?.()
    },
    onExit() {
      process.exit(0)
    },
  })

  ctx.effect(() => {
    const off = ctx.on('session/event', (_session: any, event: any) => {
      const view = projectSessionEvent(event)
      if (!view) return
      if (view.kind === 'text-delta') {
        if (!streamText) {
          streamText = new Text('')
          app.append(streamText)
        }
        streamBuffer += view.text
        streamText.setText(streamBuffer)
        return
      }
      if (view.kind === 'tool-call') {
        streamText = undefined
        streamBuffer = ''
        app.append(new Text(`⏺ ${view.name}`))
        return
      }
      if (view.kind === 'tool-result') {
        app.append(new Text(`✓ ${view.preview ? view.preview.slice(0, 100) : 'done'}`))
        return
      }
      if (view.kind === 'turn-end') {
        streamText = undefined
        streamBuffer = ''
        return
      }
      if (view.kind === 'error') {
        app.append(new Text(`✗ ${view.message}`))
      }
    })
    return () => off?.()
  }, 'tui.events')
}
