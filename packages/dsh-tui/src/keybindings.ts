/**
 * TUI 快捷键：所有绑定集中在这一个文件，随时改随时生效。
 * 参考系统 hyprland.conf 的组织方式——不在代码里散落硬编码。
 *
 * 格式：`修饰键+键名`，如 `ctrl+c`、`esc`、`up`、`/`。
 * 修饰键：ctrl / alt / shift（可组合，如 `ctrl+shift+o`）。
 */
export type KeyAction =
  | 'submit'
  | 'cancel'
  | 'exit'
  | 'clear'
  | 'toggle-tools'
  | 'rewind'
  | 'history-prev'
  | 'history-next'
  | 'command'

export interface Keybinding {
  key: string
  action: KeyAction
  /** 可选说明，显示在 /help 里 */
  description?: string
}

/** 默认绑定——改这里即可，和 hyprland.conf 一样自由。 */
export const KEYBINDINGS: Keybinding[] = [
  { key: 'enter', action: 'submit', description: '发送' },
  { key: 'ctrl+c', action: 'cancel', description: '取消当前 turn（空闲时退出）' },
  { key: 'ctrl+d', action: 'exit', description: '退出' },
  { key: 'ctrl+l', action: 'clear', description: '清屏' },
  { key: 'ctrl+o', action: 'toggle-tools', description: '展开/折叠工具卡' },
  { key: 'esc', action: 'rewind', description: '双击进入回滚模式' },
  { key: 'up', action: 'history-prev', description: '上一条历史' },
  { key: 'down', action: 'history-next', description: '下一条历史' },
  { key: '/', action: 'command', description: '命令' },
]

/** 把 keypress 的 key 对象归一化成 `ctrl+c` 这种字符串。 */
export function normalizeKey(key: { name?: string; ctrl?: boolean; alt?: boolean; shift?: boolean }): string {
  const parts: string[] = []
  if (key.ctrl) parts.push('ctrl')
  if (key.alt) parts.push('alt')
  if (key.shift) parts.push('shift')
  parts.push(key.name ?? '')
  return parts.join('+')
}

/** 查表：keypress → action。 */
export function resolveAction(key: { name?: string; ctrl?: boolean; alt?: boolean; shift?: boolean }): KeyAction | undefined {
  const normalized = normalizeKey(key)
  return KEYBINDINGS.find((b) => b.key === normalized)?.action
}
