/** 会话命令：/new /resume /rewind /fork /rename /tree /clear */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { CommandHandler } from './types.js'

export const sessionCommands: Record<string, CommandHandler> = {
  new: (_input, { channel }) => { void channel.newSession(); return true },
  resume: () => { useChatStore.getState().setTreeOpen(true); return true },
  tree: () => { useChatStore.getState().setTreeOpen(true); return true },
  rewind: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'rewind', index: 0 } } as never); return true },
  fork: (_input, { channel }) => { void channel.forkSession?.(); return true },
  rename: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Rename session?' } } as never); return true },
  clear: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Clear transcript?' } } as never); return true },
}
