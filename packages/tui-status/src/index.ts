/** 插件边界：状态栏。提供 tuiStatus 插槽（Chat 的状态栏位置）。 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { StatusLine } from '../../dsh-tui/src/screens/StatusLine.js'

export const name = 'tui-status'

export function apply(ctx: Context): void {
  ctx.provide('tuiStatus', (props: Record<string, unknown>) => React.createElement(StatusLine, props as never))
}
