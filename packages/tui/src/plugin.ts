/** TUI 插件（Cordis）：以 cordis 核心架构管理生命周期。
 *
 *  生命周期（DSH 核心架构）：
 *    - ctx.provide：服务（tui/tuiCommands/tuiOverlays/tuiKeyHandlers）
 *    - ctx.effect：清理（卸载时释放）
 *    - ctx.inject：依赖（tuiChatProps 就绪后才构建）
 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { Tui } from './index.js'
import { commands } from './commands/index.js'
import { overlays } from './overlays/index.js'
import { keyHandlers } from './keyboard/index.js'

export const name = 'tui'
export const inject = ['tuiChatProps']

export function apply(ctx: Context): void {
  // 组件（覆盖 tuiChat：dx 渲染 Tui 而不是 dsh-tui 的 Chat）
  ctx.provide('tui', (props: Record<string, unknown>) => React.createElement(Tui, props as never))
  ctx.provide('tuiChat', {
    build: () => React.createElement(Tui, { channel: ctx.get('tuiChatProps')?.channel } as never),
    default: undefined,
  })

  // 命令/弹窗/快捷键：注册表（生命周期 = tui 插件）
  ctx.provide('tuiCommands', commands)
  ctx.provide('tuiOverlays', overlays)
  ctx.provide('tuiKeyHandlers', keyHandlers)

  // 清理：插件卸载时释放（DSH 核心架构的 effect）
  ctx.effect(() => {
    return () => {
      // 服务由 ctx.provide 自动 dispose；这里只做显式清理（日志/缓存）。
    }
  })
}
