/** tui-core：组件 + tuiChat（覆盖 dsh-TUI 的 Chat）。 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { Tui } from '../index.js'

export const name = 'tui-core'

export function apply(ctx: Context): void {
  ctx.provide('tui', (props: Record<string, unknown>) => React.createElement(Tui, props as never))
  // tuiChat 由 tui-protocol（dsh-tui apply）注册；这里只提供 tui 组件。
}
