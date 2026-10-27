import { useEffect } from 'react'
import type { RunAction } from '../actions'
import { KEYBINDINGS } from '../keybindings'

/** 组合键字符串：ctrl+shift+k / meta+w / escape。 */
function comboOf(event: KeyboardEvent): string {
  const parts: string[] = []
  if (event.ctrlKey) parts.push('ctrl')
  if (event.metaKey) parts.push('meta')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')
  parts.push(event.key.toLowerCase())
  return parts.join('+')
}

/** 监听 keydown，按 KEYBINDINGS 分发行为。 */
export function useKeybindings(run: RunAction, bindings?: Record<string, string>): void {
  const map = bindings ?? KEYBINDINGS
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const action = map[comboOf(event)]
      if (action === undefined) return
      event.preventDefault()
      run(action as Parameters<RunAction>[0])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [run, map])
}
