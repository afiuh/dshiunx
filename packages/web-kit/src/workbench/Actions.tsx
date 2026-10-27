import type { ReactNode } from 'react'
import { Grip } from './Grip'
import { Arrow } from './Arrow'

/** B：操作区。 */
export function Actions({ children, onResize, height, collapsed, onToggle, onFocus, onBlur }: { children?: ReactNode; onResize: (event: React.PointerEvent) => void; height: number; collapsed: boolean; onToggle: () => void; onFocus?: () => void; onBlur?: () => void }) {
  return (
    <footer className="wb-actions" data-collapsed={collapsed} style={{ height }} onMouseEnter={onFocus} onMouseLeave={onBlur}>
      <Grip kind="top" onPointerDown={onResize} />
      <button className="wb-collapse-edge" title={collapsed ? '展开' : '收起'} onClick={onToggle}><Arrow direction={collapsed ? 'up' : 'down'} /></button>
      {children}
    </footer>
  )
}
