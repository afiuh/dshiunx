/** 插件边界：对话/消息/工具卡。默认复用 dsh-tui 的 Chat（通过 tuiChat.default）。 */
import type { Context } from '@deepseek-ai/cordis'

export const name = 'tui-chat'
export const inject = ['tuiChat']

export function apply(ctx: Context): void {
  const slot = ctx.get('tuiChat') as { build: () => unknown; default?: () => unknown } | undefined
  if (slot === undefined) return
  // 占位：保持 dsh-tui 的默认 Chat；未来在这里换成自己的组件。
  void slot.default
}
