/** 模型命令：/model /effort /preset /provider /permission /thinking */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { CommandHandler } from './types.js'

export const modelCommands: Record<string, CommandHandler> = {
  model: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'model', index: 0 } } as never); return true },
  effort: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'effort', index: 0 } } as never); return true },
  preset: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'preset', index: 0 } } as never); return true },
  provider: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'provider', index: 0 } } as never); return true },
  permission: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'permission', index: 0 } } as never); return true },
  thinking: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'thinking', index: 0 } } as never); return true },
}
