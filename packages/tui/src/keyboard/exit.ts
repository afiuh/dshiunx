/** Ctrl+D：退出（空输入时）。 */
import type { KeyboardContext, KeyEvent } from './types.js'

export function exitKey(e: KeyEvent, ctx: KeyboardContext): boolean {
  if (e.key.ctrl && e.input === 'd') { ctx.channel.requestExit?.(); return true }
  return false
}
