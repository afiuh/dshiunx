import { useState } from 'react'

const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value))

export type ResizeKey = 'top' | 'side' | 'bottom' | 'parallel'

/** 尺寸状态 + 拖拽（起始值 + 增量，平滑无档位）。 */
export function useResize(initial: Record<ResizeKey, number>, limits: Record<ResizeKey, [number, number]>) {
  const [sizes, setSizes] = useState(initial)

  /** direction: 'y' 向下增；'x' 向右增；sign 反转方向。 */
  const start = (key: ResizeKey, direction: 'x' | 'y', sign: 1 | -1) => (event: React.PointerEvent): void => {
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const startSize = sizes[key]
    const [lo, hi] = limits[key]
    const move = (ev: PointerEvent): void => {
      const delta = (direction === 'x' ? ev.clientX - startX : ev.clientY - startY) * sign
      setSizes(prev => ({ ...prev, [key]: clamp(startSize + delta, lo, hi) }))
    }
    const up = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return { sizes, start }
}
