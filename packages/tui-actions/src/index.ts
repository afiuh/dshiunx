/** Chat 动作（逻辑层）：6 个核心函数，经 Context 提供，不触发重渲染。 */
import { createContext } from 'react'

export interface ChatActions {
  runCommand: (name: string, rawInput?: string, images?: readonly unknown[]) => boolean | Promise<boolean>
  openScene: (options?: { readonly fullscreen?: boolean }) => void
  handleCaretImage: (...args: unknown[]) => void
  openRewind: () => void
  openPanelFullscreen: (panelId: string) => void
  backgroundToAgentView: () => void
}

export const ChatActionsContext = createContext<ChatActions | null>(null)
