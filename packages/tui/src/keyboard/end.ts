/** End 键。 */
import type { KeyEvent } from './types.js'

export function endKey(e: KeyEvent): boolean {
  if (e.key.end) { return true }
  return false
}
