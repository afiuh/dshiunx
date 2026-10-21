/** 帮助面板开关（信息层）：Chat 与 PromptInput 共享，不经过 React state。 */
let open = false
const listeners = new Set<() => void>()

export const helpStore = {
  get: (): boolean => open,
  set(value: boolean): void {
    if (open === value) return
    open = value
    for (const listener of listeners) listener()
  },
  toggle(): void {
    helpStore.set(!open)
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
