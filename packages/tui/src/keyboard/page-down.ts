/** PageDown 键。 */
import type { KeyEvent } from './types.js'

export function pagedownKey(e: KeyEvent): boolean {
  if (e.key.pageDown) { return true }
  return false
}
