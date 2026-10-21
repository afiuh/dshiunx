/** Up 键。 */
import type { KeyEvent } from './types.js'

export function upKey(e: KeyEvent): boolean {
  if (e.key.upArrow) { return true }
  return false
}
