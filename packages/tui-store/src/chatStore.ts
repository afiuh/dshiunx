/** Chat 状态（信息层）：Zustand 单 store，组件用 selector 细粒度订阅。 */
import { create } from 'zustand'
import { NO_OVERLAY, chatOverlayReducer, type ChatOverlay, type ChatOverlayAction } from '../../dsh-tui/src/screens/chatOverlay.js'

type TodoFooterOverride = { hidden: boolean; agentId: string; goal: unknown; todos: unknown } | undefined
type AgentView = { agentId: string; source: string } | null
type StarModal = { index: number; phase: 'ask' | 'done' } | null
type MigrateRow = { agentId: string } & Record<string, unknown>

export interface ChatStore {
  // 帮助/设置
  helpOpen: boolean
  setHelpOpen: (v: boolean) => void
  toggleHelp: () => void
  settingsOpen: boolean
  setSettingsOpen: (v: boolean) => void
  // 会话
  treeOpen: boolean
  setTreeOpen: (v: boolean) => void
  agentView: AgentView
  setAgentView: (v: AgentView | ((prev: AgentView) => AgentView)) => void
  agentViewReturnId: string | undefined
  setAgentViewReturnId: (v: string | undefined) => void
  // 搜索
  searchQuery: string
  setSearchQuery: (v: string) => void
  searchCursor: number
  setSearchCursor: (v: number) => void
  searchCount: number
  setSearchCount: (v: number) => void
  searchCurrent: number
  setSearchCurrent: (v: number) => void
  // overlay（弹窗/面板）
  overlay: ChatOverlay
  dispatchOverlay: (action: ChatOverlayAction) => void
  // 选择
  selectionActive: boolean
  setSelectionActive: (v: boolean) => void
  selectedId: number | null
  setSelectedId: (v: number | null) => void
  expandedRows: ReadonlySet<number>
  setExpandedRows: (v: ReadonlySet<number> | ((prev: ReadonlySet<number>) => ReadonlySet<number>)) => void
  streamViewToggledRows: ReadonlySet<number>
  setStreamViewToggledRows: (v: ReadonlySet<number> | ((prev: ReadonlySet<number>) => ReadonlySet<number>)) => void
  // 时间线
  timeline: unknown
  setTimeline: (v: unknown) => void
  // 模型
  models: readonly unknown[]
  setModels: (v: readonly unknown[]) => void
  modelsLoading: boolean
  setModelsLoading: (v: boolean) => void
  providerInfos: readonly unknown[]
  setProviderInfos: (v: readonly unknown[]) => void
  presetOptions: readonly unknown[]
  setPresetOptions: (v: readonly unknown[]) => void
  effortOptions: readonly unknown[]
  setEffortOptions: (v: readonly unknown[]) => void
  effortLevelsFallback: boolean
  setEffortLevelsFallback: (v: boolean) => void
  skillsList: readonly unknown[] | null
  setSkillsList: (v: readonly unknown[] | null) => void
  // 面板
  todoCollapsed: boolean
  setTodoCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void
  todoFooterOverride: TodoFooterOverride
  setTodoFooterOverride: (v: TodoFooterOverride) => void
  jobsPanelOpen: boolean
  setJobsPanelOpen: (v: boolean) => void
  jobsPanelFocusId: string | null
  setJobsPanelFocusId: (v: string | null) => void
  // 迁移
  migrateRows: MigrateRow[] | null
  setMigrateRows: (v: MigrateRow[] | null) => void
  migrateChecked: ReadonlySet<string>
  setMigrateChecked: (v: ReadonlySet<string>) => void
  migratePending: readonly MigrateRow[]
  setMigratePending: (v: readonly MigrateRow[]) => void
  migrateHintAgent: string | null
  setMigrateHintAgent: (v: string | null | ((prev: string | null) => string | null)) => void
  // 杂项 UI
  showAllMessages: boolean
  setShowAllMessages: (v: boolean) => void
  minimizedQuestionKey: string | null
  setMinimizedQuestionKey: (v: string | null) => void
  thinkingVisible: boolean
  setThinkingVisible: (v: boolean) => void
  btwOverlayOpen: boolean
  setBtwOverlayOpen: (v: boolean) => void
  btwSceneOpen: boolean
  setBtwSceneOpen: (v: boolean) => void
  logoNonce: number
  setLogoNonce: (v: number) => void
  sceneOpen: boolean
  setSceneOpen: (v: boolean) => void
  loadedContextOpen: boolean
  setLoadedContextOpen: (v: boolean) => void
  peekSuppressed: string | null
  setPeekSuppressed: (v: string | null) => void
  unseenCount: number
  statusFields: unknown
  approvalSnapshot: unknown
  questionSnapshot: unknown
  failureHintRowId: number | null
  setUnseenCount: (v: number) => void
  forceMountRowId: number | null
  setForceMountRowId: (v: number | null) => void
  subagentDashboardOpen: boolean
  setSubagentDashboardOpen: (v: boolean) => void
  subagentDetailId: string | null
  setSubagentDetailId: (v: string | null) => void
  // 启动
  launchpadDraft: string
  setLaunchpadDraft: (v: string) => void
  launchpadCaret: number
  setLaunchpadCaret: (v: number) => void
  launchpadFocus: number
  setLaunchpadFocus: (v: number) => void
  launchpadUpdateAvailable: boolean
  setLaunchpadUpdateAvailable: (v: boolean) => void
  onboardingPending: boolean
  setOnboardingPending: (v: boolean) => void
  starred: boolean
  setStarred: (v: boolean) => void
  starModal: StarModal
  setStarModal: (v: StarModal) => void
  sdkPhase: { kind: string } & Record<string, unknown>
  setSdkPhase: (v: { kind: string } & Record<string, unknown>) => void
  token: string | null
  setToken: (v: string | null) => void
  workspaceTargets: readonly unknown[]
  setWorkspaceTargets: (v: readonly unknown[]) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  helpOpen: false,
  setHelpOpen: (v) => set({ helpOpen: v }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  settingsOpen: false,
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  treeOpen: false,
  setTreeOpen: (v) => set({ treeOpen: v }),
  agentView: null,
  setAgentView: (v) => set((s) => ({ agentView: typeof v === 'function' ? v(s.agentView) : v })),
  agentViewReturnId: undefined,
  setAgentViewReturnId: (v) => set({ agentViewReturnId: v }),
  searchQuery: '',
  setSearchQuery: (v) => set({ searchQuery: v }),
  searchCursor: 0,
  setSearchCursor: (v) => set({ searchCursor: v }),
  searchCount: 0,
  setSearchCount: (v) => set({ searchCount: v }),
  searchCurrent: 0,
  setSearchCurrent: (v) => set({ searchCurrent: v }),
  overlay: NO_OVERLAY,
  dispatchOverlay: (action) => set((s) => ({ overlay: chatOverlayReducer(s.overlay, action) })),
  selectionActive: false,
  setSelectionActive: (v) => set({ selectionActive: v }),
  selectedId: null,
  setSelectedId: (v) => set({ selectedId: v }),
  expandedRows: new Set(),
  setExpandedRows: (v) => set((s) => ({ expandedRows: typeof v === 'function' ? v(s.expandedRows) : v })),
  streamViewToggledRows: new Set(),
  setStreamViewToggledRows: (v) => set((s) => ({ streamViewToggledRows: typeof v === 'function' ? v(s.streamViewToggledRows) : v })),
  timeline: { turns: [], activeId: null, pinnedId: null, upId: null, downId: null },
  setTimeline: (v) => set({ timeline: v }),
  models: [],
  setModels: (v) => set({ models: v }),
  modelsLoading: false,
  setModelsLoading: (v) => set({ modelsLoading: v }),
  providerInfos: [],
  setProviderInfos: (v) => set({ providerInfos: v }),
  presetOptions: [],
  setPresetOptions: (v) => set({ presetOptions: v }),
  effortOptions: [],
  setEffortOptions: (v) => set({ effortOptions: v }),
  effortLevelsFallback: false,
  setEffortLevelsFallback: (v) => set({ effortLevelsFallback: v }),
  skillsList: null,
  setSkillsList: (v) => set({ skillsList: v }),
  todoCollapsed: false,
  setTodoCollapsed: (v) => set((s) => ({ todoCollapsed: typeof v === 'function' ? v(s.todoCollapsed) : v })),
  todoFooterOverride: undefined,
  setTodoFooterOverride: (v) => set({ todoFooterOverride: v }),
  jobsPanelOpen: false,
  setJobsPanelOpen: (v) => set({ jobsPanelOpen: v }),
  jobsPanelFocusId: null,
  setJobsPanelFocusId: (v) => set({ jobsPanelFocusId: v }),
  migrateRows: null,
  setMigrateRows: (v) => set({ migrateRows: v }),
  migrateChecked: new Set(),
  setMigrateChecked: (v) => set({ migrateChecked: v }),
  migratePending: [],
  setMigratePending: (v) => set({ migratePending: v }),
  migrateHintAgent: null,
  setMigrateHintAgent: (v) => set((s) => ({ migrateHintAgent: typeof v === 'function' ? v(s.migrateHintAgent) : v })),
  showAllMessages: false,
  setShowAllMessages: (v) => set({ showAllMessages: v }),
  minimizedQuestionKey: null,
  setMinimizedQuestionKey: (v) => set({ minimizedQuestionKey: v }),
  thinkingVisible: true,
  setThinkingVisible: (v) => set({ thinkingVisible: v }),
  btwOverlayOpen: false,
  setBtwOverlayOpen: (v) => set({ btwOverlayOpen: v }),
  btwSceneOpen: false,
  setBtwSceneOpen: (v) => set({ btwSceneOpen: v }),
  logoNonce: 0,
  setLogoNonce: (v) => set({ logoNonce: v }),
  sceneOpen: false,
  setSceneOpen: (v) => set({ sceneOpen: v }),
  loadedContextOpen: false,
  setLoadedContextOpen: (v) => set({ loadedContextOpen: v }),
  peekSuppressed: null,
  setPeekSuppressed: (v) => set({ peekSuppressed: v }),
  unseenCount: 0,
  statusFields: undefined,
  approvalSnapshot: null,
  questionSnapshot: null,
  failureHintRowId: null,
  setUnseenCount: (v) => set({ unseenCount: v }),
  forceMountRowId: null,
  setForceMountRowId: (v) => set({ forceMountRowId: v }),
  subagentDashboardOpen: false,
  setSubagentDashboardOpen: (v) => set({ subagentDashboardOpen: v }),
  subagentDetailId: null,
  setSubagentDetailId: (v) => set({ subagentDetailId: v }),
  launchpadDraft: '',
  setLaunchpadDraft: (v) => set({ launchpadDraft: v }),
  launchpadCaret: 0,
  setLaunchpadCaret: (v) => set({ launchpadCaret: v }),
  launchpadFocus: -1,
  setLaunchpadFocus: (v) => set({ launchpadFocus: v }),
  launchpadUpdateAvailable: false,
  setLaunchpadUpdateAvailable: (v) => set({ launchpadUpdateAvailable: v }),
  onboardingPending: false,
  setOnboardingPending: (v) => set({ onboardingPending: v }),
  starred: false,
  setStarred: (v) => set({ starred: v }),
  starModal: null,
  setStarModal: (v) => set({ starModal: v }),
  sdkPhase: { kind: 'idle' },
  setSdkPhase: (v) => set({ sdkPhase: v }),
  token: null,
  setToken: (v) => set({ token: v }),
  workspaceTargets: [],
  setWorkspaceTargets: (v) => set({ workspaceTargets: v }),
}))
