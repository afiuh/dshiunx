import { createInterface, emitKeypressEvents } from 'node:readline'
import { resolveAction } from './keybindings.ts'

/**
 * 终端输入：readline + 快捷键。
 * 参考用户系统快捷键习惯（Ctrl 系，不用 SUPER——会被 Hyprland 拦截）。
 *
 * 快捷键：
 *   Enter      发送
 *   Ctrl+C     取消当前 turn（空闲时退出）
 *   Ctrl+D     退出
 *   Ctrl+L     清屏
 *   Ctrl+O     展开/折叠工具卡
 *   Esc Esc    进入回滚模式（双击）
 *   Up/Down    历史
 *   /          命令
 */
export interface InputHandlers {
  onSubmit(text: string): void
  onCancel(): void
  onExit(): void
  onClear(): void
  onToggleTools(): void
  onRewind(): void
}

export function startInput(handlers: InputHandlers): { close(): void } {
  emitKeypressEvents(process.stdin)
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  let lastEsc = 0
  const history: string[] = []
  let historyIndex = -1

  process.stdin.on('keypress', (_str, key) => {
    if (!key) return
    const action = resolveAction(key)
    switch (action) {
      case 'rewind': {
        const now = Date.now()
        if (now - lastEsc < 400) handlers.onRewind()
        lastEsc = now
        return
      }
      case 'cancel': handlers.onCancel(); return
      case 'exit': handlers.onExit(); return
      case 'clear': handlers.onClear(); return
      case 'toggle-tools': handlers.onToggleTools(); return
      case 'history-prev':
        if (history.length) {
          historyIndex = Math.max(0, historyIndex - 1)
          rl.write(history[historyIndex] ?? '')
        }
        return
      case 'history-next':
        if (history.length) {
          historyIndex = Math.min(history.length - 1, historyIndex + 1)
          rl.write(history[historyIndex] ?? '')
        }
        return
    }
  })

  rl.on('line', (line) => {
    const text = line.trim()
    if (!text) return
    history.push(text)
    historyIndex = history.length
    handlers.onSubmit(text)
  })

  return { close: () => rl.close() }
}
