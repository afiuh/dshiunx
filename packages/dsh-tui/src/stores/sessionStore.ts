/** 会话面板状态（信息层）：会话树/监督器/agent view。 */
type AgentView = { agentId: string; source: string } | null

let treeOpen = false
let supervisorOpen = false
let agentViewReturnId: string | undefined
let agentView: AgentView = null
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const sessionStore = {
  getTreeOpen: (): boolean => treeOpen,
  setTreeOpen(value: boolean): void { treeOpen = value; notify() },
  getSupervisorOpen: (): boolean => supervisorOpen,
  setSupervisorOpen(value: boolean): void { supervisorOpen = value; notify() },
  getAgentViewReturnId: (): string | undefined => agentViewReturnId,
  setAgentViewReturnId(value: string | undefined): void { agentViewReturnId = value; notify() },
  getAgentView: (): AgentView => agentView,
  setAgentView(value: AgentView | ((prev: AgentView) => AgentView)): void {
    agentView = typeof value === 'function' ? value(agentView) : value
    notify()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
