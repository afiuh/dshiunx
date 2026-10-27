import type { ActionName } from './actions'

/**
 * 快捷键 → 行为。
 *
 * 目前为空（只有测试用的 Ctrl+W）。应用按需追加，例如：
 *   'ctrl+k': 'open-parallel'
 *   'escape': 'close-window'
 */
export const KEYBINDINGS: Record<string, ActionName> = {
  'alt+a': 'close-window',
}
