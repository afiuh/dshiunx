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

const entriesDir = fileURLToPath(new URL('../packages/bundle-arch/', import.meta.url))
const configPath = `${entriesDir}entries.yml`

const ctx = await boot('dx', configPath, [], (hostCtx) => {
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
  })
  provideCmdline(hostCtx, {
    args: process.argv.slice(2),
    exit: (code: number) => process.exit(code),
  })
})

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

// 参数传给 TUI 插件（通过环境变量，避免改 TUI 的 apply 签名）
if (option('--model')) process.env.DSHIUNX_MODEL = option('--model')
if (option('--preset')) process.env.DSHIUNX_PRESET = option('--preset')
if (option('--session')) process.env.DSHIUNX_SESSION = option('--session')
if (flag('-c') || flag('--continue')) process.env.DSHIUNX_CONTINUE = '1'
if (flag('-r') || flag('--resume')) process.env.DSHIUNX_RESUME = '1'
if (option('--fork')) process.env.DSHIUNX_FORK = option('--fork')

const task = option('-p') ?? positional()
if (task) process.env.DSHIUNX_TASK = task

// 保持进程运行；TUI 的 onExit 会 process.exit(0)。
await new Promise<void>((resolve) => {
  process.on('SIGINT', resolve)
  process.on('SIGTERM', resolve)
})
await ctx.fiber.dispose()
