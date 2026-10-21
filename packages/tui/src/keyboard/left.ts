/** Left 键。 */
import type { KeyEvent } from './types.js'

export function leftKey(e: KeyEvent): boolean {
  if (e.key.leftArrow) { return true }
  return false
}
