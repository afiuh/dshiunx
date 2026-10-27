import type { ReactNode } from 'react'

/** 一个分类（D 区的 tab）。 */
export interface Group {
  readonly id: string
  readonly label: string
}

/** 分类下的一个条目（C 区的项）。 */
export interface Item {
  readonly id: string
  readonly label: string
}

/** 并行区（E）里的一个面板。 */
export interface Panel {
  readonly id: string
  readonly item: Item
}

/** 框架契约：只负责布局/拖拽，内容由调用方提供。 */
export interface WorkbenchProps {
  /** D：分组。 */
  readonly groups: readonly Group[]
  /** C：某分组下的条目。 */
  readonly itemsOf: (group: Group) => readonly Item[]
  /** A：内容渲染。 */
  readonly renderContent: (item: Item) => ReactNode
  /** B：操作渲染。 */
  readonly renderActions?: (item: Item) => ReactNode
  /** E：并行面板渲染（默认同 A）。 */
  readonly renderPanel?: (item: Item) => ReactNode
  /** 主题（默认 light）。 */
  readonly theme?: 'light' | 'dark'
}
