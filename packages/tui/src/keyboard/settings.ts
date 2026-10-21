/** Ctrl+,：设置。 */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { KeyEvent } from './types.js'

export function settingsKey(e: KeyEvent): boolean {
  if (e.key.ctrl && e.input === ',') { useChatStore.getState().setSettingsOpen(true); return true }
  return false
}
