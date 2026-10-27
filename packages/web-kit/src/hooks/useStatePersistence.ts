import { useEffect, useRef } from 'react'
import type { WorkbenchState } from '../types'

/**
 * 关闭/刷新前回调一次（最轻）。
 *
 * 母体只负责"在 beforeunload 时把当前状态交出去"：
 * - 拖拽过程中零回调、不写存储
 * - 存哪 / 存什么 / 怎么恢复，由应用决定
 */
export function useStatePersistence(state: WorkbenchState, onChange?: (state: WorkbenchState) => void): void {
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    if (onChange === undefined) return
    const handler = (): void => onChange(latest.current)
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [onChange])
}
