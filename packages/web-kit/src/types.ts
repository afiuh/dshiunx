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

/**
 * 框架契约：只负责容器和交互（布局 / 拖拽 / 收起 / E 按需出现），
 * 不规定内容语义——每个区放什么、操作谁、A/E 关系，全部由应用决定。
 */
export interface WorkbenchProps {
  /** D：分组。 */
  readonly groups: readonly Group[]
  /** C：某分组下的条目。 */
  readonly itemsOf: (group: Group) => readonly Item[]
  /** A：内容渲染（可以自带操作，比如设置页/表单）。 */
  readonly renderContent: (item: Item) => ReactNode
  /** B：独立交互区渲染（对话框/终端/输入；不需要时可以不放）。 */
  readonly renderActions?: (item: Item) => ReactNode
  /** E：并行面板渲染（默认同 A；面板自带操作，不需要 B）。 */
  readonly renderPanel?: (item: Item) => ReactNode
  /** 主题（默认 light）。 */
  readonly theme?: 'light' | 'dark'
}
