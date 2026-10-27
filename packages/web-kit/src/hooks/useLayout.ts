import { useState } from 'react'

export type Focus = 'top' | 'side' | 'content' | 'actions' | 'parallel' | null

/** 布局状态：折叠（D/C/B）+ 焦点（鼠标所在区）。 */
export function useLayout(initialCollapsed?: Partial<{ top: boolean; side: boolean; bottom: boolean }>) {
  const [collapsed, setCollapsed] = useState({ top: false, side: false, bottom: false, ...initialCollapsed })
  const [focused, setFocused] = useState<Focus>(null)
  return { collapsed, setCollapsed, focused, setFocused }
}
