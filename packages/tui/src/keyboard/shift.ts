/** Shift 键。 */
import type { KeyEvent } from './types.js'

export function shiftKey(e: KeyEvent): boolean {
  if (e.key.shift) { return true }
  return false
}
