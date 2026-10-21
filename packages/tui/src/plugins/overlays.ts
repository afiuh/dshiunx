/** tui-overlays：41 个弹窗（注册表）。 */
import type { Context } from '@deepseek-ai/cordis'
import { overlays } from '../overlays/index.js'

export const name = 'tui-overlays'

export function apply(ctx: Context): void {
  ctx.provide('tuiOverlays', overlays)
}
