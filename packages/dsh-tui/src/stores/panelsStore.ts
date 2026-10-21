/** 面板状态（信息层）：todo 折叠 / jobs 面板。 */
type TodoFooterOverride = {
  hidden: boolean
  agentId: string
  goal: unknown
  todos: unknown
} | undefined

let todoCollapsed = false
let todoFooterOverride: TodoFooterOverride
let jobsPanelOpen = false
let jobsPanelFocusId: string | null = null
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const panelsStore = {
  getTodoCollapsed: (): boolean => todoCollapsed,
  setTodoCollapsed(value: boolean | ((prev: boolean) => boolean)): void {
    todoCollapsed = typeof value === 'function' ? value(todoCollapsed) : value
    notify()
  },
  getTodoFooterOverride: (): TodoFooterOverride => todoFooterOverride,
  setTodoFooterOverride(value: TodoFooterOverride): void { todoFooterOverride = value; notify() },
  getJobsPanelOpen: (): boolean => jobsPanelOpen,
  setJobsPanelOpen(value: boolean): void { jobsPanelOpen = value; notify() },
  getJobsPanelFocusId: (): string | null => jobsPanelFocusId,
  setJobsPanelFocusId(value: string | null): void { jobsPanelFocusId = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
