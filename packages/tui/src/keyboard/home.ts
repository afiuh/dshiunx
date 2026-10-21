/** Home 键。 */
import type { KeyEvent } from './types.js'

export function homeKey(e: KeyEvent): boolean {
  if (e.key.home) { return true }
  return false
}
