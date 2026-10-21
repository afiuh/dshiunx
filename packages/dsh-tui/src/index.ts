import { Renderer } from './renderer.ts'
import { projectSessionEvent } from './projection.ts'
import type { ViewEvent } from './view-event.ts'

export const name = 'tui'
export const inject = ['agents', 'sessions', 'agentPresets']

/**
 * 最小 TUI 插件：订阅 session 事件，投影成 ViewEvent，交给 ANSI renderer。
 * 不弹审批；Ctrl+C 取消当前 turn。
 */
export function apply(ctx: any): void {
  const renderer = new Renderer()
  const emit = (event: ViewEvent) => renderer.write(event)

  ctx.effect(() => {
    const off = ctx.on('session/event', (_session: any, event: any) => {
      const view = projectSessionEvent(event)
      if (view) emit(view)
    })
    return () => off?.()
  }, 'tui.session-events')
}
