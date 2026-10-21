/** Right 键。 */
import type { KeyEvent } from './types.js'

export function rightKey(e: KeyEvent): boolean {
  if (e.key.rightArrow) { return true }
  return false
}
