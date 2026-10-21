/** Agent↔agent message delivery state: color + localized word (shared by
 *  TranscriptLeaves and AssistantToolUseMessage, breaking their cycle). */
import { t } from '../../i18n.js'
import type { Theme } from '../../theme.js'
import type { AgentMessageState } from './agentTeam.js'

/** Delivery-state badge color: only what the channel reported. */
export function agentMessageStateColor(state: AgentMessageState): keyof Theme {
  if (state === 'delivered') return 'success'
  if (state === 'refused') return 'error'
  if (state === 'issued' || state === 'queued' || state === 'held') return 'warning'
  return 'subtle'
}

/** The localized state word (issued/queued/delivered/held/refused/expired/unknown). */
export function agentMessageStateText(state: AgentMessageState): string {
  return t(`agent-message-delivery-${state}`)
}
