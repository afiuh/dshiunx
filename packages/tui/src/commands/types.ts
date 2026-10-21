/** 命令上下文。 */
export interface CommandContext {
  channel: any
  [key: string]: any
}

export type CommandHandler = (rawInput: string, ctx: CommandContext) => boolean | Promise<boolean>
