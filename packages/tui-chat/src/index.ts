/** 插件边界：对话/消息/工具卡。用 tuiChatProps 构建 dsh-tui 的 Chat。 */
import type { Context } from '@deepseek-ai/cordis'
import { Chat } from '../../dsh-tui/src/screens/Chat.js'

export const name = 'tui-chat'
export const inject = ['tuiChat', 'tuiChatProps']

export function apply(ctx: Context): void {
  const slot = ctx.get('tuiChat') as { build: () => unknown; default?: () => unknown } | undefined
  const props = ctx.get('tuiChatProps') as Record<string, unknown> | undefined
  if (slot === undefined) return
  if (props === undefined) {
    // 等 tuiChatProps 出现前保持默认。
    return
  }
  // dshiunx: own the content slot; build the same Chat from slot props.
  ctx.provide('tuiChat', {
    build: () => (Chat as unknown as (p: Record<string, unknown>) => unknown)(props),
    default: slot.default,
  })
}
