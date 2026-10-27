import { useMemo, useState } from 'react'
import type { Group, Item, Panel } from '../types'

/** 数据状态：分组 / 条目 / 选中 / 并行面板。 */
export function useWorkbench(groups: readonly Group[], itemsOf: (group: Group) => readonly Item[], initialParallel: readonly string[] = []) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id ?? '')
  const group = groups.find(item => item.id === activeGroup) ?? groups[0]
  const items = useMemo(() => (group === undefined ? [] : itemsOf(group)), [group, itemsOf])
  const [activeItem, setActiveItem] = useState(items[0]?.id ?? '')
  const item = items.find(entry => entry.id === activeItem) ?? items[0]
  const [parallel, setParallel] = useState<Panel[]>(() =>
    initialParallel
      .map(id => items.find(entry => entry.id === id))
      .filter((entry): entry is Item => entry !== undefined)
      .map((entry, index) => ({ id: `p-init-${index}`, item: entry })),
  )

  const open = (target: Item): void => {
    setParallel(prev => [...prev, { id: `p${Date.now()}-${prev.length}`, item: target }])
  }

  const close = (id: string): void => {
    setParallel(prev => prev.filter(panel => panel.id !== id))
  }

  return { activeGroup, setActiveGroup, group, items, activeItem, setActiveItem, item, parallel, open, close }
}
