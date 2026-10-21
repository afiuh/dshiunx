/** 命令分发（runCommand）：74 个命令，按类别逐步实现。
 *  参考 dsh-TUI 的 Chat.tsx（runCommand 的 case 分支）。 */
import { useChatStore } from '../../tui-store/src/index.js'

export interface CommandContext {
  channel: any
  [key: string]: any
}

/** 核心命令（第一批 10 个）。 */
export function runCommand(name: string, rawInput = '', ctx: CommandContext): boolean | Promise<boolean> {
  const store = useChatStore.getState()
  const { channel } = ctx

  switch (name) {
    case 'help':
      store.toggleHelp()
      return true

    case 'settings':
      store.setSettingsOpen(true)
      return true

    case 'new':
      void channel.newSession()
      return true

    case 'exit':
    case 'quit':
    case 'q':
      channel.requestExit?.()
      return true

    case 'clear':
      store.dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Clear transcript?' } } as never)
      return true

    case 'model':
      store.dispatchOverlay({ type: 'open', overlay: { kind: 'model', index: 0 } } as never)
      return true

    case 'effort':
      store.dispatchOverlay({ type: 'open', overlay: { kind: 'effort', index: 0 } } as never)
      return true

    case 'permission':
      store.dispatchOverlay({ type: 'open', overlay: { kind: 'permission', index: 0 } } as never)
      return true

    case 'theme':
      store.dispatchOverlay({ type: 'open', overlay: { kind: 'theme', index: 0 } } as never)
      return true

    case 'status':
      channel.notify?.(`session: ${channel.sessionId ?? 'unknown'}`)
      return true

    default:
      channel.notify?.(`unknown command: /${name}`)
      return true
  }
}
