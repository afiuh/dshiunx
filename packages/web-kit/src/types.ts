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
  /** A：内容渲染（可以自带操作，比如设置页/表单）。A 免疫关闭——永远存在，没有收起/关闭。 */
  readonly renderContent: (item: Item) => ReactNode
  /** B：需要区域的操作渲染（对话框/终端/输入/命令）；只读日志不放这里。 */
  readonly renderActions?: (item: Item) => ReactNode
  /** E：并行面板渲染（默认同 A；面板自带操作，不需要 B）。 */
  readonly renderPanel?: (item: Item) => ReactNode
  /** 主题（默认 light）。 */
  readonly theme?: 'light' | 'dark'
  /** 快捷键映射（默认用 keybindings.ts；应用可按情境覆盖）。 */
  readonly keybindings?: Record<string, string>
  /**
   * 初始状态（**仅首次生效**）。
   *
   * 母体做最轻：只接受初始值，**不预设存储**（localStorage / 后端 / URL / 内存都行）。
   * 应用怎么读、要不要版本迁移、要不要校验，由应用按需决定。
   */
  readonly initialState?: Partial<WorkbenchState>
  /**
   * 关闭/刷新前回调**一次**（`beforeunload`）。
   *
   * 母体做最轻：不 debounce、不写存储、不存选中。
   * 应用在这里决定：存哪、存什么、下次怎么恢复。
   */
  readonly onStateChange?: (state: WorkbenchState) => void
}
