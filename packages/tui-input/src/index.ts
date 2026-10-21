/** 插件边界：输入/快捷键。提供 tuiInput 插槽（Chat 的输入框位置）。 */
import type { Context } from '@deepseek-ai/cordis'
import React from 'react'
import { PromptInput } from '../../dsh-tui/src/components/PromptInput.js'

export const name = 'tui-input'

export function apply(ctx: Context): void {
  ctx.provide('tuiInput', (props: Record<string, unknown>) => React.createElement(PromptInput, props as never))
}
