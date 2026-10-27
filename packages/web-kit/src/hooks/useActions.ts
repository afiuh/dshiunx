import { useCallback } from 'react'
import type { RunAction } from '../actions'
import type { Panel, Group, Item } from '../types'

interface WorkbenchState {
  readonly parallel: readonly Panel[]
  open: (item: Item) => void
  close: (id: string) => void
  setActiveGroup: (id: string) => void
  setActiveItem: (id: string) => void
}

export type Focus = 'top' | 'side' | 'content' | 'actions' | 'parallel' | null

/** 行为实现（点击与快捷键共用）：状态操作 + 焦点分发。 */
export function useActions(
  wb: WorkbenchState,
  collapsed: { top: boolean; side: boolean; bottom: boolean },
  setCollapsed: React.Dispatch<React.SetStateAction<{ top: boolean; side: boolean; bottom: boolean }>>,
  focused: Focus,
): RunAction {
  return useCallback((name, payload) => {
    if (name === 'toggle-top') setCollapsed(prev => ({ ...prev, top: !prev.top }))
    if (name === 'toggle-side') setCollapsed(prev => ({ ...prev, side: !prev.side }))
    if (name === 'toggle-bottom') setCollapsed(prev => ({ ...prev, bottom: !prev.bottom }))
    if (name === 'open-parallel' && payload?.item !== undefined) wb.open(payload.item)
    if (name === 'close-parallel' && payload?.id !== undefined) wb.close(payload.id)
    if (name === 'select-group' && payload?.group !== undefined) wb.setActiveGroup(payload.group)
    if (name === 'select-item' && payload?.id !== undefined) wb.setActiveItem(payload.id)
    if (name === 'close-window') {
      // 按焦点：E 关面板 / B/C/D 收起 / A 免疫
      if (focused === 'top') setCollapsed(prev => ({ ...prev, top: !prev.top }))
      else if (focused === 'side') setCollapsed(prev => ({ ...prev, side: !prev.side }))
      else if (focused === 'actions') setCollapsed(prev => ({ ...prev, bottom: !prev.bottom }))
      else if (focused === 'parallel') {
        const last = wb.parallel[wb.parallel.length - 1]
        if (last !== undefined) wb.close(last.id)
      }
    }
  }, [wb, setCollapsed, focused])
}
