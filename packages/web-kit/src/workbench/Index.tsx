import type { ReactNode } from 'react'
import type { Item } from '../types'
import { Grip } from './Grip'
import { Arrow } from './Arrow'

/** C：索引列表（可选拖拽 + 并行打开）。 */
export function Index({ title, items, active, onSelect, onOpen, dragHandlers, onResize, width, collapsed, onToggle, render }: {
  title: string
  items: readonly Item[]
  active: string
  onSelect: (id: string) => void
  onOpen: (item: Item) => void
  dragHandlers: (id: string) => object
  onResize: (event: React.PointerEvent) => void
  width: number
  collapsed: boolean
  onToggle: () => void
  render?: (props: { items: readonly Item[]; active: string; onSelect: (id: string) => void; onOpen: (item: Item) => void; dragHandlers: (id: string) => object }) => ReactNode
}) {
  return (
    <aside className="wb-side" data-collapsed={collapsed} style={{ width }}>
      <div className="wb-side-scroll">
      <div className="wb-side-title">{title}</div>
      {render !== undefined
        ? render({ items, active, onSelect, onOpen, dragHandlers })
        : items.map(item => (
        <div
          key={item.id}
          className={`wb-item ${item.id === active ? 'active' : ''}`}
          onClick={() => onSelect(item.id)}
          {...dragHandlers(item.id)}
        >
          <span>{item.label}</span>
          <button className="wb-open" title="并行打开" onClick={event => { event.stopPropagation(); onOpen(item) }}>→</button>
        </div>
      ))}
      </div>
      <button className="wb-collapse-edge" title={collapsed ? '展开' : '收起'} onClick={onToggle}><Arrow direction={collapsed ? 'right' : 'left'} /></button>
      <Grip kind="h" onPointerDown={onResize} />
    </aside>
  )
}
