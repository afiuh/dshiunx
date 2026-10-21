/** 杂项 UI 状态（信息层）：面板/场景/提示。 */
let showAllMessages = false
let minimizedQuestionKey: string | null = null
let thinkingVisible = true
let btwOverlayOpen = false
let btwSceneOpen = false
let logoNonce = 0
let sceneOpen = false
let loadedContextOpen = false
let peekSuppressed: string | null = null
let unseenCount = 0
let forceMountRowId: number | null = null
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const uiStore = {
  getShowAllMessages: (): boolean => showAllMessages,
  setShowAllMessages(value: boolean): void { showAllMessages = value; notify() },
  getMinimizedQuestionKey: (): string | null => minimizedQuestionKey,
  setMinimizedQuestionKey(value: string | null): void { minimizedQuestionKey = value; notify() },
  getThinkingVisible: (): boolean => thinkingVisible,
  setThinkingVisible(value: boolean): void { thinkingVisible = value; notify() },
  getBtwOverlayOpen: (): boolean => btwOverlayOpen,
  setBtwOverlayOpen(value: boolean): void { btwOverlayOpen = value; notify() },
  getBtwSceneOpen: (): boolean => btwSceneOpen,
  setBtwSceneOpen(value: boolean): void { btwSceneOpen = value; notify() },
  getLogoNonce: (): number => logoNonce,
  setLogoNonce(value: number): void { logoNonce = value; notify() },
  getSceneOpen: (): boolean => sceneOpen,
  setSceneOpen(value: boolean): void { sceneOpen = value; notify() },
  getLoadedContextOpen: (): boolean => loadedContextOpen,
  setLoadedContextOpen(value: boolean): void { loadedContextOpen = value; notify() },
  getPeekSuppressed: (): string | null => peekSuppressed,
  setPeekSuppressed(value: string | null): void { peekSuppressed = value; notify() },
  getUnseenCount: (): number => unseenCount,
  setUnseenCount(value: number): void { unseenCount = value; notify() },
  getForceMountRowId: (): number | null => forceMountRowId,
  setForceMountRowId(value: number | null): void { forceMountRowId = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
