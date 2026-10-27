import type { ReactNode } from 'react'
import { Grip } from './Grip'

/** E 里的单个面板（F/G）。 */
export function Panel({ title, children, onClose, onResize }: {
  title: string
  children: ReactNode
  onClose: () => void
  onResize?: (event: React.PointerEvent) => void
}) {
  return (
    <div className="wb-panel">
      <div className="wb-panel-head">
        <span>{title}</span>
        <button title="关闭" onClick={onClose}>×</button>
      </div>
      <div className="wb-panel-body">{children}</div>
      {onResize !== undefined && <Grip kind="v" onPointerDown={onResize} />}
    </div>
  )
}
