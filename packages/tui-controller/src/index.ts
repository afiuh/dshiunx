/** Chat UI 逻辑（useChatController）：最小可用版。
 *  变量名与 dsh-TUI 的 Chat 保持一致（chatState 的 72 个字段），便于逐步对齐。 */
import { useCallback } from 'react'
import { useChatStore } from '../../tui-store/src/index.js'

export interface ChatControllerProps {
  channel: any
  [key: string]: any
}

export function useChatController(props: ChatControllerProps): Record<string, any> {
  const { channel } = props
  const helpOpen = useChatStore((s) => s.helpOpen)
  const settingsOpen = useChatStore((s) => s.settingsOpen)
  const overlay = useChatStore((s) => s.overlay)
  const treeOpen = useChatStore((s) => s.treeOpen)
  const showAllMessages = useChatStore((s) => s.showAllMessages)
  const thinkingVisible = useChatStore((s) => s.thinkingVisible)
  const todoCollapsed = useChatStore((s) => s.todoCollapsed)
  const unseenCount = useChatStore((s) => s.unseenCount)
  const selectionActive = useChatStore((s) => s.selectionActive)
  const expandedRows = useChatStore((s) => s.expandedRows)
  const streamViewToggledRows = useChatStore((s) => s.streamViewToggledRows)
  const searchQuery = useChatStore((s) => s.searchQuery)
  const searchCursor = useChatStore((s) => s.searchCursor)
  const searchCount = useChatStore((s) => s.searchCount)
  const searchCurrent = useChatStore((s) => s.searchCurrent)

  const runCommand = useCallback((name: string, rawInput = ''): boolean => {
    const store = useChatStore.getState()
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
      case 'model':
      case 'effort':
      case 'permission':
        store.dispatchOverlay({ type: 'open', overlay: { kind: name, index: 0 } } as never)
        return true
      default:
        channel.notify?.(`unknown command: /${name}`)
        return true
    }
  }, [channel])

  const dispatchOverlay = useChatStore((s) => s.dispatchOverlay)

  return {
    // 状态（与 Chat 的 chatState 同名）
    timeline: { turns: [], activeId: null, pinnedId: null, upId: null, downId: null },
    helpOpen,
    settingsOpen,
    overlay,
    treeOpen,
    showAllMessages,
    thinkingVisible,
    todoCollapsed,
    unseenCount,
    selectionActive,
    expandedRows,
    streamViewToggledRows,
    searchQuery,
    searchCursor,
    searchCount,
    searchCurrent,
    // 其余字段（默认值，逐步实现）
    activityWarnPct: undefined,
    backendModeStatus: undefined,
    backgroundToAgentView: () => {},
    brand: undefined,
    btwOverlayThread: undefined,
    btwOverlayVisible: false,
    chatColumns: 0,
    closeBtwOverlay: () => {},
    closeCoupon: () => {},
    closeStarModal: () => {},
    compactionBadge: undefined,
    coupon: undefined,
    dialogOverlayOpen: false,
    dialogSnapshot: undefined,
    dismissPeek: () => {},
    effortPickerStatus: undefined,
    expanded: false,
    failureHintRowId: undefined,
    forceMountRowId: undefined,
    fullscreen: false,
    handle: () => {},
    handleCaretImage: () => {},
    historyFill: undefined,
    loadedContextOpen: false,
    loadingStartTimeRef: { current: undefined },
    logoNonce: 0,
    markCouponShown: () => {},
    modelPickerStatus: undefined,
    openFileActions: () => {},
    openImagePreview: () => {},
    openJobsPanel: () => {},
    openPanelFullscreen: () => {},
    openRewind: () => {},
    openSubagentViewFromCard: () => {},
    pauseStartTimeRef: { current: undefined },
    petSaysNotices: () => {},
    pickerPanels: undefined,
    promptControllerRef: { current: undefined },
    promptReplacementOpen: false,
    promptSelectionActive: false,
    registerRowRef: { current: undefined },
    responseLengthRef: { current: undefined },
    revealAndSeekRow: () => {},
    runBalance: () => {},
    runStarAction: () => {},
    setHandle: () => {},
    setSubagentDetailId: () => {},
    setUnseenCount: () => {},
    sidePanel: { geometry: null, focus: 'chat', focusChat: () => {}, focusPanel: () => {}, resize: () => {}, chatColumns: 80, panelColumns: 0, split: false, activePanelId: undefined, enabledPanelIds: [] },
    starModalActions: undefined,
    starred: undefined,
    statusFields: undefined,
    subscribeTooltipInvalidation: () => {},
    thinkingStatus: undefined,
    toggleLoadedContext: () => {},
    toggleRowExpanded: () => {},
    toggleStreamView: () => {},
    toggleTodoFooter: () => {},
    totalPausedMsRef: { current: undefined },
    trajectory: undefined,
    uploadTokensRef: { current: undefined },
    watchJobOutput: () => {},
    workingActivity: undefined,
    // 动作
    runCommand,
    dispatchOverlay,
    // 依赖
    channel,
  }
}
