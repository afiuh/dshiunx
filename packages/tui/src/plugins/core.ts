/** tui-core：组件 + tuiChat（覆盖 dsh-TUI 的 Chat）。 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { Tui } from '../index.js'

export const name = 'tui-core'

export function apply(ctx: Context): void {
  ctx.provide('tui', (props: Record<string, unknown>) => React.createElement(Tui, props as never))
  // 覆盖 tuiChat：dsh-tui 的 plugin.ts 只在未注册时才 provide（dshiunx 改动）。
  ctx.provide('tuiChat', {
    // strict=false：tui-protocol 的 apply 是 async，其 fiber 在 buildTree 时仍 PENDING。
    build: () => React.createElement(Tui, { channel: (ctx.get('tuiChatProps', false) as any)?.channel } as never),
    default: undefined,
  })
}
