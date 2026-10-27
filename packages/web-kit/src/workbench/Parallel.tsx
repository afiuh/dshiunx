import { useEffect, useState } from 'react'
import type { Panel as PanelModel, Item } from '../types'
import type { ReactNode } from 'react'
import { Panel } from './Panel'
import { Grip } from './Grip'

const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value))

/** E：并行区（面板容器；空则不渲染，由 Workbench 控制）。 */
export function Parallel({ panels, renderPanel, onClose, onResizeStart, zoneHandlers, active, width, onFocus, onBlur }: {
  panels: readonly PanelModel[]
  renderPanel: (item: Item) => ReactNode
  onClose: (id: string) => void
  onResizeStart: (event: React.PointerEvent) => void
  zoneHandlers: object
  active: boolean
  width: number
  onFocus?: () => void
  onBlur?: () => void
}) {
  const [flexes, setFlexes] = useState<number[]>([])

  useEffect(() => {
    setFlexes(prev => panels.map((_, index) => prev[index] ?? 1))
  }, [panels.length])

  const startPanelResize = (index: number) => (event: React.PointerEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    const startY = event.clientY
    const container = (event.currentTarget as HTMLElement).parentElement?.parentElement
    const total = container?.getBoundingClientRect().height ?? 400
    const startA = flexes[index] ?? 1
    const startB = flexes[index + 1] ?? 1
    const unit = (startA + startB) / total
    const move = (ev: PointerEvent): void => {
      const delta = (ev.clientY - startY) * unit
      setFlexes(prev => {
        const next = [...prev]
        next[index] = Math.max(0.2, startA + delta)
        next[index + 1] = Math.max(0.2, startB - delta)
        return next
      })
    }
    const up = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <section className={`wb-parallel ${active ? 'active' : ''}`} style={{ width }} {...zoneHandlers} onMouseEnter={onFocus} onMouseLeave={onBlur}>
      <Grip kind="left" onPointerDown={onResizeStart} />
      {panels.map((panel, index) => (
        <div className="wb-panel-wrap" key={panel.id} style={{ flex: `${flexes[index] ?? 1} 1 0` }}>
          <Panel
            title={panel.item.label}
            onClose={() => onClose(panel.id)}
            onResize={index < panels.length - 1 ? startPanelResize(index) : undefined}
          >
            {renderPanel(panel.item)}
          </Panel>
        </div>
      ))}
    </section>
  )
}
