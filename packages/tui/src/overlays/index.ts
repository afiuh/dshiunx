/** 覆盖层注册表：41 个 kind → 渲染函数。
 *  加弹窗 = 新建文件 + 在这里注册（见 ARCHITECTURE.md）。 */
import type React from 'react'
import { ActivityOverlay } from './activity.js'
import { AgentDetailOverlay } from './agent-detail.js'
import { AgentsDashboardOverlay } from './agents-dashboard.js'
import { CancelledOverlay } from './cancelled.js'
import { CheckingOverlay } from './checking.js'
import { ColorOverlay } from './color.js'
import { ConfirmOverlay } from './confirm.js'
import { DoneOverlay } from './done.js'
import { EffortOverlay } from './effort.js'
import { FailedOverlay } from './failed.js'
import { FileActionsOverlay } from './file-actions.js'
import { HelpOverlay } from './help.js'
import { HistoryOverlay } from './history.js'
import { IdleOverlay } from './idle.js'
import { ImagePreviewOverlay } from './image-preview.js'
import { LangOverlay } from './lang.js'
import { MigrateConfirmOverlay } from './migrate-confirm.js'
import { MigrateOverlay } from './migrate.js'
import { ModelOverlay } from './model.js'
import { NoGhOverlay } from './no-gh.js'
import { NoTargetOverlay } from './no-target.js'
import { NotAuthedOverlay } from './not-authed.js'
import { PanelOverlay } from './panel.js'
import { PlanOverlay } from './plan.js'
import { PnpmMissingOverlay } from './pnpm-missing.js'
import { PresetOverlay } from './preset.js'
import { QuestionOverlay } from './question.js'
import { RewindOverlay } from './rewind.js'
import { RunningOverlay } from './running.js'
import { SearchOverlay } from './search.js'
import { SkillsOverlay } from './skills.js'
import { StarredOverlay } from './starred.js'
import { SuccessOverlay } from './success.js'
import { ThemeOverlay } from './theme.js'
import { ThinkingOverlay } from './thinking.js'
import { TipsOverlay } from './tips.js'
import { TranscriptCardOverlay } from './transcript-card.js'
import type { OverlayContext, OverlayRenderer } from './types.js'

export type { OverlayContext, OverlayRenderer }

export const overlays: Record<string, OverlayRenderer> = {
  'activity': ActivityOverlay,
  'agent-detail': AgentDetailOverlay,
  'agents-dashboard': AgentsDashboardOverlay,
  'cancelled': CancelledOverlay,
  'checking': CheckingOverlay,
  'color': ColorOverlay,
  'done': DoneOverlay,
  'failed': FailedOverlay,
  'file-actions': FileActionsOverlay,
  'history': HistoryOverlay,
  'idle': IdleOverlay,
  'lang': LangOverlay,
  'migrate': MigrateOverlay,
  'migrate-confirm': MigrateConfirmOverlay,
  'no-gh': NoGhOverlay,
  'no-target': NoTargetOverlay,
  'not-authed': NotAuthedOverlay,
  'panel': PanelOverlay,
  'plan': PlanOverlay,
  'pnpm-missing': PnpmMissingOverlay,
  'preset': PresetOverlay,
  'rewind': RewindOverlay,
  'running': RunningOverlay,
  'skills': SkillsOverlay,
  'starred': StarredOverlay,
  'success': SuccessOverlay,
  'thinking': ThinkingOverlay,
  'tips': TipsOverlay,
  'transcript-card': TranscriptCardOverlay,
  'model': ModelOverlay,
  'effort': EffortOverlay,
  'theme': ThemeOverlay,
  'help': HelpOverlay,
  'confirm': ConfirmOverlay,
  'question': QuestionOverlay,
  'image-preview': ImagePreviewOverlay,
  'search': SearchOverlay,
}

export function renderOverlay(kind: string, ctx: OverlayContext): React.ReactNode {
  const renderer = overlays[kind]
  return renderer ? renderer(ctx) : null
}
