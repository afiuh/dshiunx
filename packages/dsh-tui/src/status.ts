/**
 * 状态栏：参考 dsh-TUI 的实时信息选择，只保留我们有的服务。
 *
 * 一行显示：
 *   model · tokens/contextWindow · tps · cost · tools · goal/todo
 *
 * 不刷屏：只在 turn 结束或状态变化时重绘。
 */
export interface StatusState {
  model?: string
  tokens?: number
  contextWindow?: number
  tps?: number
  costUsd?: number
  activeTools?: number
  goal?: { done: number; total: number }
  todo?: { done: number; total: number }
  working?: boolean
}

const ANSI = {
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function renderStatus(state: StatusState): string {
  const parts: string[] = []
  if (state.model) parts.push(`${ANSI.cyan}${state.model}${ANSI.reset}`)
  if (state.tokens !== undefined && state.contextWindow) {
    parts.push(`${ANSI.dim}${fmtTokens(state.tokens)}/${fmtTokens(state.contextWindow)}${ANSI.reset}`)
  } else if (state.tokens !== undefined) {
    parts.push(`${ANSI.dim}${fmtTokens(state.tokens)} tokens${ANSI.reset}`)
  }
  if (state.tps !== undefined) parts.push(`${ANSI.green}${state.tps.toFixed(0)} tps${ANSI.reset}`)
  if (state.costUsd !== undefined) parts.push(`${ANSI.yellow}$${state.costUsd.toFixed(4)}${ANSI.reset}`)
  if (state.activeTools) parts.push(`${ANSI.dim}⏺ ${state.activeTools}${ANSI.reset}`)
  if (state.goal) parts.push(`${ANSI.dim}goal ${state.goal.done}/${state.goal.total}${ANSI.reset}`)
  if (state.todo) parts.push(`${ANSI.dim}todo ${state.todo.done}/${state.todo.total}${ANSI.reset}`)
  if (state.working) parts.push(`${ANSI.dim}…${ANSI.reset}`)
  return parts.join(`${ANSI.dim} · ${ANSI.reset}`)
}

/** 状态栏渲染器：保存一行，重绘时清掉旧行。 */
export class StatusBar {
  private last = ''

  render(state: StatusState): void {
    const line = renderStatus(state)
    if (line === this.last) return
    this.last = line
    // 清当前行 + 写新行（不换行，避免刷屏）
    process.stdout.write(`\r\x1b[2K${line}`)
  }

  clear(): void {
    process.stdout.write('\r\x1b[2K')
    this.last = ''
  }
}
