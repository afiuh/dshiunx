/** 插件边界：对话/消息/工具卡。用 tuiChatProps 构建 dsh-tui 的 Chat。 */
import type { Context } from '@deepseek-ai/cordis'
import { Chat } from '../../dsh-tui/src/screens/Chat.js'

export const name = 'tui-chat'

export function apply(ctx: Context): void {
  // 等 tui-protocol 的 apply 末尾 provide 出 tuiChat/tuiChatProps。
  ctx.inject(['tuiChat', 'tuiChatProps'], (c) => {
    const slot = c.get('tuiChat') as { build: () => unknown; default?: () => unknown } | undefined
    const props = c.get('tuiChatProps') as Record<string, unknown> | undefined
    if (slot === undefined || props === undefined) return
    c.provide('tuiChat', {
      build: () => (Chat as unknown as (p: Record<string, unknown>) => unknown)(props),
      default: slot.default,
    })
    c.emit('tui/rerender')
  })
}
