/** Chat 状态（信息层）：Zustand 单 store，组件用 selector 细粒度订阅。 */
import { create } from 'zustand'

export interface ChatStore {
  // 帮助面板
  helpOpen: boolean
  setHelpOpen: (value: boolean) => void
  toggleHelp: () => void
  // 设置面板
  settingsOpen: boolean
  setSettingsOpen: (value: boolean) => void
  // 会话树
  treeOpen: boolean
  setTreeOpen: (value: boolean) => void
  // 搜索
  searchQuery: string
  setSearchQuery: (value: string) => void
  searchCursor: number
  setSearchCursor: (value: number) => void
  searchCount: number
  setSearchCount: (value: number) => void
  searchCurrent: number
  setSearchCurrent: (value: number) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  helpOpen: false,
  setHelpOpen: (value) => set({ helpOpen: value }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  settingsOpen: false,
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  treeOpen: false,
  setTreeOpen: (value) => set({ treeOpen: value }),
  searchQuery: '',
  setSearchQuery: (value) => set({ searchQuery: value }),
  searchCursor: 0,
  setSearchCursor: (value) => set({ searchCursor: value }),
  searchCount: 0,
  setSearchCount: (value) => set({ searchCount: value }),
  searchCurrent: 0,
  setSearchCurrent: (value) => set({ searchCurrent: value }),
}))
