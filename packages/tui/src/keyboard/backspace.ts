/** Backspace 键。 */
import type { KeyEvent } from './types.js'

export function backspaceKey(e: KeyEvent): boolean {
  if (e.key.backspace) { return true }
  return false
}
