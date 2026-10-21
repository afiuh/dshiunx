/** Tab 键。 */
import type { KeyEvent } from './types.js'

export function tabKey(e: KeyEvent): boolean {
  if (e.key.tab) { return true }
  return false
}
