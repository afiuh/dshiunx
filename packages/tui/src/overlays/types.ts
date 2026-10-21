/** 覆盖层（overlay）：41 个 kind，每个一个文件。
 *  渲染层用 dsh-TUI 的组件（ApprovalPanel/AskUserQuestionPanel/...）。 */
import type React from 'react'

export interface OverlayContext {
  channel: any
  [key: string]: any
}

export type OverlayRenderer = (ctx: OverlayContext) => React.ReactNode
