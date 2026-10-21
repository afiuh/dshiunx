/** UI 命令：/help /settings /theme /tips /lang /color */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { CommandHandler } from './types.js'

export const uiCommands: Record<string, CommandHandler> = {
  help: () => { useChatStore.getState().toggleHelp(); return true },
  settings: () => { useChatStore.getState().setSettingsOpen(true); return true },
  theme: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'theme', index: 0 } } as never); return true },
  color: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'color', index: 0 } } as never); return true },
  lang: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'lang', index: 0 } } as never); return true },
  tips: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'tips', index: 0 } } as never); return true },
}
