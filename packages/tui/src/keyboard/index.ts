/** 快捷键注册表：18 个键 → handler。
 *  加快捷键 = 新建文件 + 在这里注册（见 ARCHITECTURE.md）。 */
import { helpKey } from './help.js'
import { settingsKey } from './settings.js'
import { exitKey } from './exit.js'
import { escapeKey } from './escape.js'
import type { KeyboardContext, KeyEvent } from './types.js'

export type { KeyboardContext, KeyEvent }

export type KeyHandler = (e: KeyEvent, ctx: KeyboardContext) => boolean

export const keyHandlers: KeyHandler[] = [
  helpKey,
  settingsKey,
  (e, ctx) => exitKey(e, ctx),
  escapeKey,
]

export function handleKey(e: KeyEvent, ctx: KeyboardContext): boolean {
  for (const handler of keyHandlers) {
    if (handler(e, ctx)) return true
  }
  return false
}
