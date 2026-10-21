/** 命令分发（runCommand）：合并 6 个命令表，按类别分文件。
 *  加命令 = 在对应文件加一个 handler（见 ARCHITECTURE.md）。 */
import { uiCommands } from './ui.js'
import { sessionCommands } from './session.js'
import { modelCommands } from './model.js'
import { systemCommands } from './system.js'
import { workspaceCommands } from './workspace.js'
import { miscCommands } from './misc.js'
import type { CommandContext, CommandHandler } from './types.js'

export type { CommandContext, CommandHandler }

export const commands: Record<string, CommandHandler> = {
  ...uiCommands,
  ...sessionCommands,
  ...modelCommands,
  ...systemCommands,
  ...workspaceCommands,
  ...miscCommands,
}

export function runCommand(name: string, rawInput = '', ctx: CommandContext): boolean | Promise<boolean> {
  const handler = commands[name]
  if (handler) return handler(rawInput, ctx)
  ctx.channel.notify?.(`unknown command: /${name}`)
  return true
}
