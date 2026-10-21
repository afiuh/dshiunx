/** Delete 键。 */
import type { KeyEvent } from './types.js'

export function deleteKey(e: KeyEvent): boolean {
  if (e.key.delete) { return true }
  return false
}
