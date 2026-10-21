/** Down 键。 */
import type { KeyEvent } from './types.js'

export function downKey(e: KeyEvent): boolean {
  if (e.key.downArrow) { return true }
  return false
}
