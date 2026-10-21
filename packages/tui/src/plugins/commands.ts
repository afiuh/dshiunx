/** tui-commands：75 个命令（注册表）。 */
import type { Context } from '@deepseek-ai/cordis'
import { commands } from '../commands/index.js'

export const name = 'tui-commands'

export function apply(ctx: Context): void {
  ctx.provide('tuiCommands', commands)
}
