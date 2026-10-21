/** PageUp 键。 */
import type { KeyEvent } from './types.js'

export function pageupKey(e: KeyEvent): boolean {
  if (e.key.pageUp) { return true }
  return false
}
