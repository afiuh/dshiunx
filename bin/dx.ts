#!/usr/bin/env node
/**
 * dx —— dshiunx 入口，命令体系参考 pi（pi → dx）。
 *
 *   dx                     启动 TUI
 *   dx "task"              一次性任务（非交互）
 *   dx -p "task"           非交互模式
 *   dx --session <id>      继续指定会话
 *   dx -c / --continue     继续上一个会话
 *   dx -r / --resume       交互式选择会话
 *   dx --fork <id>         基于历史会话分叉
 *   dx --model <name>      指定模型
 *   dx --preset <id>       指定 preset（standard/ptc/minimal/creator）
 *   dx --help              帮助
 */
import { boot } from '@deepseek-ai/dsh-app-boot'
import ConsoleExporter from '@deepseek-ai/cordis-plugin-logger-console'
import { fileURLToPath } from 'node:url'
import { writeFileSync, unlinkSync } from 'node:fs'
import { provideCmdline } from '@deepseek-ai/dsh-cmdline'

const args = process.argv.slice(2)

function flag(name: string): boolean {
  return args.includes(name)
}
function option(name: string): string | undefined {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
function positional(): string | undefined {
  return args.find((a) => !a.startsWith('-') && !isOptionValue(a))
}
function isOptionValue(value: string): boolean {
  const i = args.indexOf(value)
  return i > 0 && ['--session', '--fork', '--model', '--preset', '-p'].includes(args[i - 1])
}

if (flag('--help') || flag('-h')) {
  console.log(`dx —— dshiunx

用法：
  dx                      启动 TUI
  dx "task"               一次性任务
  dx -p "task"            非交互模式
  dx --session <id>       继续指定会话
  dx -c, --continue       继续上一个会话
  dx -r, --resume         交互式选择会话
  dx --fork <id>          分叉历史会话
  dx --model <name>       指定模型
  dx --preset <id>        指定 preset（standard/ptc/minimal/creator）
  dx --help               帮助`)
  process.exit(0)
}

const task = option('-p') ?? positional()

/**
 * headless 参数白名单：只保留 startup（commander）认识的标志。
 * - `-p` 是 pi 风格，startup 不认；任务本身作为 positional 传入
 * - dx 风格的 `--session` 映射为 headless 的 `--session-id`
 * - TUI 参数（--model / --preset / --resume / --fork 等）丢弃，不进入 headless 解析
 */
function headlessArgs(input: readonly string[], taskText: string | undefined): string[] {
  if (taskText === undefined) return []
  const out = [taskText]
  for (let i = 0; i < input.length; i += 1) {
    const arg = input[i]
    if (arg === '-p') { i += 1; continue }
    if (arg === '--json' || arg === '-h' || arg === '--help') { out.push(arg); continue }
    if (arg === '--session') { out.push('--session-id', input[i + 1] ?? ''); i += 1; continue }
    if (arg === '--session-id' || arg === '--permission-mode' || arg === '--approval-policy' || arg === '--add-dir') {
      out.push(arg, input[i + 1] ?? '')
      i += 1
      continue
    }
    if (arg.startsWith('-')) i += 1
  }
  return out
}

const cmdlineArgs = headlessArgs(args, task)

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const configPath = `${entriesDir}entries.yml`

// 统一退出：先 dispose 树，再退出；5s 超时强制退出（照上游 createProcessShutdown）
let appCtx: { fiber: { dispose(): Promise<void> } } | undefined
let shutdownStarted = false
function shutdown(code: number): void {
  if (shutdownStarted) return
  shutdownStarted = true
  const timer = setTimeout(() => process.exit(code), 5_000)
  void Promise.resolve()
    .then(() => appCtx?.fiber.dispose())
    .catch(() => {})
    .finally(() => { clearTimeout(timer); process.exit(code) })
}

const ctx = await boot('dx', configPath, [], async (hostCtx) => {
  hostCtx.provide('profileContext', {
    name: 'dshiunx',
    dir: `${process.cwd()}/profiles/default`,
    patchPath: `${process.cwd()}/profiles/default/cordis.patch.yml`,
    installAnchor: process.cwd(),
    cwd: process.cwd(),
    home: process.env.HOME ?? '',
    startedBundles: [],
    overlays: [],
    telemetryDisabledEnv: undefined,
    headless: !!task,
    task: task ?? '',
  })
  provideCmdline(hostCtx, {
    args: cmdlineArgs,
    exit: (code: number) => shutdown(code),
  })
  // 在 entries 挂载前挂载日志出口，否则 boot 期间的 logger 日志会丢失
  await hostCtx.plugin(ConsoleExporter)
})

appCtx = ctx

const loaded = [...ctx.loader.entries()]
console.log(`dx: loaded ${loaded.length} entries`)

// 健康心跳：供外部 watchdog 监控（100ms 更新；退出时清理）
const heartbeatFile = process.env.DSHIUNX_HEARTBEAT ?? '/tmp/dshiunx-heartbeat'
const heartbeat = setInterval(() => {
  try { writeFileSync(heartbeatFile, String(Date.now())) } catch {}
}, 100)
const stopHeartbeat = () => {
  clearInterval(heartbeat)
  try { unlinkSync(heartbeatFile) } catch {}
}
process.on('exit', stopHeartbeat)

// TUI 参数（--model / --preset / --session / --resume / --fork）当前没有消费者：
// 全项目 grep 无 `DSHIUNX_*` 读取方，env 写入是死代码。待 TUI 重构时接线。
// headless 参数走 cmdlineArgs 白名单（startup 解析）；见 启动链路.md「参数契约」。

// SIGTERM 是管理者的普通停止（退出 0）；SIGINT 是用户中断（130）
process.on('SIGTERM', () => shutdown(0))
process.on('SIGINT', () => shutdown(130))

// headless 完成时通过 appExit → shutdown 结束进程；TUI 的 onExit 同理。
// 两者都走统一的 dispose → exit 路径，不再直接 process.exit。
await new Promise<void>(() => {})
