/** 系统命令：/exit /quit /q /reload /update /status /doctor /compact /context /cost /tokens /export /import /init /setup /terminal-setup */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { CommandHandler } from './types.js'

export const systemCommands: Record<string, CommandHandler> = {
  exit: (_i, { channel }) => { channel.requestExit?.(); return true },
  quit: (_i, { channel }) => { channel.requestExit?.(); return true },
  q: (_i, { channel }) => { channel.requestExit?.(); return true },
  reload: (_i, { channel }) => { void channel.reload?.(); return true },
  update: (_i, { channel }) => { void channel.checkUpdate?.(); return true },
  status: (_i, { channel }) => { channel.notify?.(`session: ${channel.sessionId ?? 'unknown'}`); return true },
  doctor: (_i, { channel }) => { channel.notify?.('doctor: ok'); return true },
  compact: (_i, { channel }) => { void channel.compact?.(); return true },
  context: (_i, { channel }) => { channel.notify?.(`context: ${channel.tokens ?? '?'} tokens`); return true },
  cost: (_i, { channel }) => { channel.notify?.(`cost: ${channel.cost ?? '?'}`); return true },
  tokens: (_i, { channel }) => { channel.notify?.(`tokens: ${channel.tokens ?? '?'}`); return true },
  export: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Export session?' } } as never); return true },
  import: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Import session?' } } as never); return true },
  init: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Initialize project?' } } as never); return true },
  setup: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'onboarding', index: 0 } } as never); return true },
  'terminal-setup': () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'terminal-setup', index: 0 } } as never); return true },
}
