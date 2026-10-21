/** Ctrl 键。 */
import type { KeyEvent } from './types.js'

export function ctrlKey(e: KeyEvent): boolean {
  if (e.key.ctrl) { return true }
  return false
}
