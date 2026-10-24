/**
 * dshiunx shell —— 登录后的默认界面（命令层），不承载对话。
 *
 * 主题（核心战略 §2.0）：welcome to dshiunx, you can do anything。
 * shell 只提供「命令注册表 + 输入循环 + 分发」；对话/界面由插件注册命令打开。
 * 内置只有 exit / help —— 它们是 shell 自身的控制流，不是应用。
 *
 * 服务名用 `dxShell`：`ctx.shell` 已被 @deepseek-ai/dsh-shell 的 ShellExecutor 占用。
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

export const name = 'shell'

/** One shell command registered by a plugin. */
export interface ShellCommand {
  /** One-line description shown by `help`. */
  description: string
  /** Handle the argument text after the command name. */
  run(args: string, ctx: Context): void | Promise<void>
}

const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

/** figlet Small "dshiunx"（约 32 列，80 列终端不换行）。 */
const BANNER = [
  '     _    _    _               ',
  "  __| |__| |_ (_)_  _ _ _ __ __",
  " / _` (_-< ' \\| | || | ' \\\\ \\ /",
  ' \\__,_/__/_||_|_|\\_,_|_||_/_\\_\\',
].join('\n')

/** Command registry + interactive loop. */
export class Shell extends Service {
  private readonly commands = new Map<string, ShellCommand>()

  constructor(ctx: Context) {
    super(ctx, 'dxShell')
  }

  /** Register one command; returns its exact disposer. */
  register(commandName: string, command: ShellCommand): () => void {
    if (this.commands.has(commandName)) throw new Error(`shell command "${commandName}" is already registered`)
    this.commands.set(commandName, command)
    return () => {
      if (this.commands.get(commandName) === command) this.commands.delete(commandName)
    }
  }

  /** Registered commands (excluding builtins), for `help`. */
  list(): Array<[string, string]> {
    return [...this.commands.entries()].map(([commandName, command]) => [commandName, command.description])
  }

  /** Run the input loop until `exit`/EOF. */
  async run(): Promise<void> {
    const io = createInterface({ input: stdin, output: stdout })
    try {
      for (;;) {
        let line: string
        try {
          line = (await io.question(`${CYAN}dx>${RESET} `)).trim()
        } catch {
          return
        }
        if (line === '') continue
        const [commandName, ...rest] = line.split(/\s+/)
        const args = rest.join(' ')
        if (commandName === 'exit' || commandName === 'quit') return
        if (commandName === 'help') { this.printHelp(); continue }
        const command = this.commands.get(commandName ?? '')
        if (command === undefined) {
          stdout.write(`unknown command: ${commandName} (try help)\n`)
          continue
        }
        try {
          await command.run(args, this.ctx)
        } catch (error) {
          stdout.write(`${DIM}${commandName}: ${error instanceof Error ? error.message : String(error)}${RESET}\n`)
        }
      }
    } finally {
      io.close()
    }
  }

  private printHelp(): void {
    stdout.write(`${DIM}commands:${RESET}\n`)
    const rows: Array<[string, string]> = [['help', 'list commands'], ['exit', 'leave the shell'], ...this.list()]
    for (const [commandName, description] of rows) {
      stdout.write(`  ${commandName.padEnd(14)} ${DIM}${description}${RESET}\n`)
    }
  }
}

/** Mount the shell and start its loop; EOF/exit requests process exit 0. */
export function apply(ctx: Context): void {
  const shell = new Shell(ctx)
  if (stdout.isTTY) {
    stdout.write(`${DIM}${BANNER}${RESET}\n\n`)
    stdout.write(`  ${CYAN}welcome to dshiunx, you can do anything${RESET}\n`)
    stdout.write(`  ${DIM}type \`help\` for commands, \`exit\` to leave.${RESET}\n\n`)
  }
  void shell.run().then(
    () => { ctx.get('appExit')?.(0) },
    (error: unknown) => {
      ctx.logger.error(error)
      ctx.get('appExit')?.(1)
    },
  )
}
