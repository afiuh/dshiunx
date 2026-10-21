/** 消息选择/展开状态（信息层）：Chat 与消息组件共享。 */
let active = false
let selectedId: number | null = null
let expanded: ReadonlySet<number> = new Set()
let toggled: ReadonlySet<number> = new Set()
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const selectionStore = {
  getActive: (): boolean => active,
  setActive(value: boolean): void { active = value; notify() },
  getSelectedId: (): number | null => selectedId,
  setSelectedId(value: number | null): void { selectedId = value; notify() },
  getExpanded: (): ReadonlySet<number> => expanded,
  setExpanded(value: ReadonlySet<number>): void { expanded = value; notify() },
  getToggled: (): ReadonlySet<number> => toggled,
  setToggled(value: ReadonlySet<number>): void { toggled = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
