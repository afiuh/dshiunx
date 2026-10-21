/** 新 TUI（参考 pi-tui 的布局，复用 dsh-TUI 的组件 + useChatStore）。
 *  不依赖 dsh-TUI 的 Chat.tsx（7158 行），只读 useChatStore。 */
import React from 'react'
import { Box, Text, ScrollBox } from '../../dsh-tui/src/ui.js'
import { useChatStore } from '../../tui-store/src/index.js'
import { MessageList } from '../../tui-components/src/index.js'
import { PromptInput } from '../../tui-components/src/index.js'
import { StatusLine } from '../../dsh-tui/src/screens/StatusLine.js'

export interface TuiProps {
  channel: any
  [key: string]: any
}

export function Tui({ channel }: TuiProps): React.ReactNode {
  // 状态：Zustand（细粒度）
  const helpOpen = useChatStore((s) => s.helpOpen)
  const overlay = useChatStore((s) => s.overlay)
  const statusFields = useChatStore((s) => s.statusFields)
  const selectionActive = useChatStore((s) => s.selectionActive)
  const expandedRows = useChatStore((s) => s.expandedRows)
  const streamViewToggledRows = useChatStore((s) => s.streamViewToggledRows)

  return (
    <Box flexDirection="column" flexGrow={1} width="100%">
      <ScrollBox flexDirection="column" flexGrow={1} flexShrink={1} stickyScroll>
        <MessageList
          rows={channel.rows}
          expandedRows={expandedRows}
          streamViewToggledRows={streamViewToggledRows}
          selectionActive={selectionActive}
          onToggleRow={() => {}}
          onToggleStreamView={() => {}}
          onRegisterRowRef={() => {}}
        />
      </ScrollBox>
      <PromptInput
        channel={channel}
        helpOpen={helpOpen}
        onRunCommand={() => {}}
        onToggleHelp={() => {}}
      />
      <StatusLine
        channel={channel}
        activity={undefined}
        selectionActive={selectionActive}
        helpOpen={helpOpen}
        pluginFields={statusFields}
      />
    </Box>
  )
}
