/**
 * 对话回滚：基于 session/event 的 append-only log。
 *
 * 回滚 = 截断到某个 seq，然后用同一 agent 继续（不重建进程）。
 * 修改 = 替换该 seq 的 user message，截断之后的事件，重放。
 *
 * 参考 dsh-TUI 的 double-Esc time rewind。
 */
export interface TurnBoundary {
  seq: number
  label: string
}

/** 从 session 事件里提取 turn 边界（每个 user message 的 seq）。 */
export function collectTurns(events: Array<{ seq: number; type?: string; data?: any }>): TurnBoundary[] {
  const turns: TurnBoundary[] = []
  for (const event of events) {
    if (event.type === 'user/message') {
      const text = (event.data?.message?.content ?? [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')
      turns.push({ seq: event.seq, label: text.slice(0, 60) })
    }
  }
  return turns
}

/**
 * 回滚到某轮：返回需要保留的事件 seq 上界。
 * 调用方负责用 session API 截断（不直接改 JSONL）。
 */
export function rewindTarget(turns: TurnBoundary[], index: number): number | undefined {
  if (index < 0 || index >= turns.length) return undefined
  return turns[index].seq
}
