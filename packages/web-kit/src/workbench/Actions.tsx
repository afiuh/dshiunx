import type { ReactNode } from 'react'
import { Grip } from './Grip'
import { Arrow } from './Arrow'

/** B：操作区。 */
export function Actions({ children, onResize, height, collapsed, onToggle }: { children?: ReactNode; onResize: (event: React.PointerEvent) => void; height: number; collapsed: boolean; onToggle: () => void }) {
  return (
    <footer className="wb-actions" data-collapsed={collapsed} style={{ height }}>
      <Grip kind="top" onPointerDown={onResize} />
      <button className="wb-collapse wb-collapse-right" title={collapsed ? '展开' : '收起'} onClick={onToggle}><Arrow direction={collapsed ? 'down' : 'up'} /></button>
      {children}
    </footer>
  )
}
