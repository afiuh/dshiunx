import type { Item } from './types'

/** 框架行为（除拖动外的所有交互）。 */
export type ActionName =
  | 'toggle-top'      // 收起/展开 D
  | 'toggle-side'     // 收起/展开 C
  | 'toggle-bottom'   // 收起/展开 B
  | 'open-parallel'   // 当前条目并行打开（E）
  | 'close-parallel'  // 关闭一个面板
  | 'select-group'    // 选择分组
  | 'select-item'     // 选择条目
  | 'close-window'    // 关闭窗口（应用行为）

export interface ActionPayload {
  readonly item?: Item
  readonly id?: string
  readonly group?: string
}

export type RunAction = (name: ActionName, payload?: ActionPayload) => void
