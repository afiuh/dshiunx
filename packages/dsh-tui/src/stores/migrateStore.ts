/** /migrate 迁移选择器状态（信息层）。 */
type MigrateRow = { agentId: string } & Record<string, unknown>

let rows: MigrateRow[] | null = null
let checked: ReadonlySet<string> = new Set()
let pending: readonly MigrateRow[] = []
let hintAgent: string | null = null
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const migrateStore = {
  getRows: (): MigrateRow[] | null => rows,
  setRows(value: MigrateRow[] | null): void { rows = value; notify() },
  getChecked: (): ReadonlySet<string> => checked,
  setChecked(value: ReadonlySet<string>): void { checked = value; notify() },
  getPending: (): readonly MigrateRow[] => pending,
  setPending(value: readonly MigrateRow[]): void { pending = value; notify() },
  getHintAgent: (): string | null => hintAgent,
  setHintAgent(value: string | null | ((prev: string | null) => string | null)): void {
    hintAgent = typeof value === 'function' ? value(hintAgent) : value
    notify()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
