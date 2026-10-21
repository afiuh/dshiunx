/** Meta 键。 */
import type { KeyEvent } from './types.js'

export function metaKey(e: KeyEvent): boolean {
  if (e.key.meta) { return true }
  return false
}
