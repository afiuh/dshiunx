/** 搜索状态（信息层）：Chat 与搜索栏共享。 */
let query = ''
let cursor = 0
let count = 0
let current = 0
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const searchStore = {
  getQuery: (): string => query,
  setQuery(value: string): void { query = value; notify() },
  getCursor: (): number => cursor,
  setCursor(value: number): void { cursor = value; notify() },
  getCount: (): number => count,
  setCount(value: number): void { count = value; notify() },
  getCurrent: (): number => current,
  setCurrent(value: number): void { current = value; notify() },
  reset(): void { query = ''; cursor = 0; count = 0; current = 0; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
