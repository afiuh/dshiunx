/** 工作区命令：/workspace /migrate /add-dir /jobs /agents /agentview /subagent /btw /goal /todo /panel */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { CommandHandler } from './types.js'

export const workspaceCommands: Record<string, CommandHandler> = {
  workspace: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'workspace-menu', index: 0 } } as never); return true },
  migrate: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'migrate', index: 0 } } as never); return true },
  'add-dir': () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'confirm', message: 'Add directory?' } } as never); return true },
  jobs: () => { useChatStore.getState().setJobsPanelOpen(true); return true },
  agents: () => { useChatStore.getState().setSubagentDashboardOpen(true); return true },
  agentview: () => { useChatStore.getState().setSubagentDashboardOpen(true); return true },
  subagent: () => { useChatStore.getState().setSubagentDashboardOpen(true); return true },
  btw: () => { useChatStore.getState().setBtwSceneOpen(true); return true },
  goal: () => { useChatStore.getState().setTodoCollapsed(false); return true },
  todo: () => { useChatStore.getState().setTodoCollapsed(!useChatStore.getState().todoCollapsed); return true },
  panel: () => { useChatStore.getState().dispatchOverlay({ type: 'open', overlay: { kind: 'panel', index: 0 } } as never); return true },
}
