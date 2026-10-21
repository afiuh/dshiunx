/** Ctrl+H：帮助。 */
import { useChatStore } from '../../../tui-store/src/index.js'
import type { KeyEvent } from './types.js'

export function helpKey(e: KeyEvent): boolean {
  if (e.key.ctrl && e.input === 'h') { useChatStore.getState().toggleHelp(); return true }
  return false
}
