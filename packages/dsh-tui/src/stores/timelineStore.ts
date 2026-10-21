/** 时间线快照（信息层）：MessageList 写入，Chat 读。 */
import type { TimelineSnapshot } from '../screens/TimelineRail.js'

let snapshot: TimelineSnapshot = {
  turns: [],
  activeId: null,
  pinnedId: null,
  upId: null,
  downId: null,
}
const listeners = new Set<() => void>()

export const timelineStore = {
  get: (): TimelineSnapshot => snapshot,
  set(value: TimelineSnapshot): void {
    snapshot = value
    for (const listener of listeners) listener()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
