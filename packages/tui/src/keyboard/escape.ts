/** Esc：关闭覆盖层。 */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { KeyEvent } from './types.js'

export function escapeKey(e: KeyEvent): boolean {
  if (!e.key.escape) return false
  const store = useChatStore.getState()
  if (store.overlay.kind !== 'none') { store.dispatchOverlay({ type: 'close' } as never); return true }
  if (store.settingsOpen) { store.setSettingsOpen(false); return true }
  if (store.treeOpen) { store.setTreeOpen(false); return true }
  return false
}
