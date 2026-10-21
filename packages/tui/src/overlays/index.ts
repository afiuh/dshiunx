/** 覆盖层注册表：41 个 kind → 渲染函数。
 *  加弹窗 = 新建文件 + 在这里注册（见 ARCHITECTURE.md）。 */
import type React from 'react'
import { ModelOverlay } from './model.js'
import { EffortOverlay } from './effort.js'
import { ThemeOverlay } from './theme.js'
import { HelpOverlay } from './help.js'
import { ConfirmOverlay } from './confirm.js'
import { PermissionOverlay } from './permission.js'
import { QuestionOverlay } from './question.js'
import { ImagePreviewOverlay } from './image-preview.js'
import { SearchOverlay } from './search.js'
import type { OverlayContext, OverlayRenderer } from './types.js'

export type { OverlayContext, OverlayRenderer }

export const overlays: Record<string, OverlayRenderer> = {
  model: ModelOverlay,
  effort: EffortOverlay,
  theme: ThemeOverlay,
  help: HelpOverlay,
  confirm: ConfirmOverlay,
  permission: PermissionOverlay,
  question: QuestionOverlay,
  'image-preview': ImagePreviewOverlay,
  search: SearchOverlay,
}

export function renderOverlay(kind: string, ctx: OverlayContext): React.ReactNode {
  const renderer = overlays[kind]
  return renderer ? renderer(ctx) : null
}
