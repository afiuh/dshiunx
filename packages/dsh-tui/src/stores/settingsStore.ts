/** 设置面板开关（信息层）。 */
let open = false
const listeners = new Set<() => void>()
export const settingsStore = {
  get: (): boolean => open,
  set(value: boolean): void {
    if (open === value) return
    open = value
    for (const listener of listeners) listener()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
