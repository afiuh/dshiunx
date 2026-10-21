/** TUI 插件（Cordis）：提供 tui 组件 + 命令/弹窗/快捷键注册表。 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { Tui } from './index.js'
import { commands } from './commands/index.js'
import { overlays } from './overlays/index.js'
import { keyHandlers } from './keyboard/index.js'

export const name = 'tui'

export function apply(ctx: Context): void {
  // 组件（覆盖 tuiChat：dx 渲染 Tui 而不是 dsh-TUI 的 Chat）
  ctx.provide('tui', (props: Record<string, unknown>) => React.createElement(Tui, props as never))
  ctx.provide('tuiChat', {
    build: () => React.createElement(Tui, { channel: ctx.get('tuiChatProps')?.channel } as never),
    default: undefined,
  })
  // 命令（75 个）
  ctx.provide('tuiCommands', commands)
  // 弹窗（41 个）
  ctx.provide('tuiOverlays', overlays)
  // 快捷键（18 个）
  ctx.provide('tuiKeyHandlers', keyHandlers)
}
