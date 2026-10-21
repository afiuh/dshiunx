/** 弹窗/面板状态（信息层）：Chat 与各 picker/弹窗共享。 */
import { NO_OVERLAY, chatOverlayReducer, type ChatOverlay, type ChatOverlayAction } from '../screens/chatOverlay.js'

let overlay: ChatOverlay = NO_OVERLAY
const listeners = new Set<() => void>()

export const overlayStore = {
  get: (): ChatOverlay => overlay,
  dispatch(action: ChatOverlayAction): void {
    overlay = chatOverlayReducer(overlay, action)
    for (const listener of listeners) listener()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
