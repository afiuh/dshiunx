/** tui-keyboard：18 个快捷键（注册表）。 */
import type { Context } from '@deepseek-ai/cordis'
import { keyHandlers } from '../keyboard/index.js'

export const name = 'tui-keyboard'

export function apply(ctx: Context): void {
  ctx.provide('tuiKeyHandlers', keyHandlers)
}
