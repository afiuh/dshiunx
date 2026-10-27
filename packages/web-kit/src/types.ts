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
 * 框架契约：**区域是边界，内容是渲染函数**。
 * - 边界（D/C/A/B/E 的位置、尺寸、拖拽、收起、E 按需出现）：框架固定
 * - 内容（每个边界里渲染什么）：应用通过 render* 提供，默认渲染只是兜底
 */
export interface WorkbenchProps {
  /** D：分组。 */
  readonly groups: readonly Group[]
  /** C：某分组下的条目。 */
  readonly itemsOf: (group: Group) => readonly Item[]
  /** D 的内容（默认 tabs；自定义时在 D 边界里渲染）。 */
  readonly renderGroups?: (props: {
    readonly groups: readonly Group[]
    readonly active: string
    readonly onSelect: (id: string) => void
  }) => ReactNode
  /** C 的内容（默认列表；自定义时在 C 边界里渲染，拖拽/打开用传入的 handlers）。 */
  readonly renderItems?: (props: {
    readonly items: readonly Item[]
    readonly active: string
    readonly onSelect: (id: string) => void
    readonly onOpen: (item: Item) => void
    readonly dragHandlers: (id: string) => object
  }) => ReactNode
  /** A：内容渲染（可以自带操作，比如设置页/表单）。 */
  readonly renderContent: (item: Item) => ReactNode
  /** B：需要区域的操作渲染（对话框/终端/输入/命令）；只读日志不放这里。 */
  readonly renderActions?: (item: Item) => ReactNode
  /** E：并行面板渲染（默认同 A；面板自带操作，不需要 B）。 */
  readonly renderPanel?: (item: Item) => ReactNode
  /** 主题（默认 light）。 */
  readonly theme?: 'light' | 'dark'
}
