/** 快捷键注册表：18 个键 → handler。
 *  加快捷键 = 新建文件 + 在这里注册（见 ARCHITECTURE.md）。 */
import { helpKey } from './help.js'
import { settingsKey } from './settings.js'
import { exitKey } from './exit.js'
import { escapeKey } from './escape.js'
import { tabKey } from './tab.js'
import { pageupKey } from './page-up.js'
import { pagedownKey } from './page-down.js'
import { homeKey } from './home.js'
import { endKey } from './end.js'
import { upKey } from './up.js'
import { downKey } from './down.js'
import { leftKey } from './left.js'
import { rightKey } from './right.js'
import { backspaceKey } from './backspace.js'
import { deleteKey } from './delete.js'
import { ctrlKey } from './ctrl.js'
import { metaKey } from './meta.js'
import { shiftKey } from './shift.js'
import type { KeyboardContext, KeyEvent } from './types.js'

export type { KeyboardContext, KeyEvent }

export type KeyHandler = (e: KeyEvent, ctx: KeyboardContext) => boolean

export const keyHandlers: KeyHandler[] = [
  helpKey,
  settingsKey,
  (e, ctx) => exitKey(e, ctx),
  escapeKey,
  tabKey,
  pageupKey,
  pagedownKey,
  homeKey,
  endKey,
  upKey,
  downKey,
  leftKey,
  rightKey,
  backspaceKey,
  deleteKey,
  ctrlKey,
  metaKey,
  shiftKey,
]

export function handleKey(e: KeyEvent, ctx: KeyboardContext): boolean {
  for (const handler of keyHandlers) {
    if (handler(e, ctx)) return true
  }
  return false
}
