/** 新 TUI（参考 pi-tui 的布局，复用 dsh-TUI 的组件 + useChatStore）。
 *
 *  架构（后面增减功能都在这里）：
 *    main-screen  布局（ScrollBox + MessageList + PromptInput + StatusLine）
 *    messages     消息列表（MessageList + 工具卡）
 *    composer     输入（PromptInput）
 *    status       状态栏（StatusLine）
 *    overlays     弹窗（41 个，逐步补）
 *    state        useChatStore（107 字段，已解耦）
 *
 *  不依赖 dsh-TUI 的 Chat.tsx（7158 行），只读 useChatStore + channel。
 */
import React from 'react'
import { Box, ScrollBox } from '../../dsh-tui/src/ui.js'
import { useChatStore } from '../../tui-store/src/index.js'
import { MessageList } from '../../tui-components/src/index.js'
import { PromptInput } from '../../tui-components/src/index.js'
import { StatusLine } from '../../dsh-tui/src/screens/StatusLine.js'
import { runCommand } from './commands/index.js'

export interface TuiProps {
  channel: any
  [key: string]: any
}

export function Tui({ channel }: TuiProps): React.ReactNode {
  // ── 状态（Zustand，细粒度订阅）────────────────────────────────
  const helpOpen = useChatStore((s) => s.helpOpen)
  const selectionActive = useChatStore((s) => s.selectionActive)
  const selectedId = useChatStore((s) => s.selectedId)
  const expandedRows = useChatStore((s) => s.expandedRows)
  const streamViewToggledRows = useChatStore((s) => s.streamViewToggledRows)
  const statusFields = useChatStore((s) => s.statusFields)
  const showAllMessages = useChatStore((s) => s.showAllMessages)
  const forceMountRowId = useChatStore((s) => s.forceMountRowId)
  const unseenCount = useChatStore((s) => s.unseenCount)
  const failureHintRowId = useChatStore((s) => s.failureHintRowId)

  // ── 动作（useChatStore.getState()，不触发重渲染）──────────────
  const store = useChatStore.getState()

  return (
    <Box flexDirection="column" flexGrow={1} width="100%">
      <ScrollBox flexDirection="column" flexGrow={1} flexShrink={1} stickyScroll>
        <MessageList
          rows={channel.rows}
          expanded={false}
          expandedRows={expandedRows}
          selectedId={selectedId}
          onToggleRow={(rowId: number) => store.setExpandedRows((prev) => {
            const next = new Set(prev)
            if (next.has(rowId)) next.delete(rowId)
            else next.add(rowId)
            return next
          })}
          model={channel.model}
          activityFrames={channel.activityFrames}
          showAll={showAllMessages}
          onToggleAll={() => store.setShowAllMessages(!showAllMessages)}
          onLoadOlder={() => {}}
          olderHistory={undefined}
          registerRowRef={() => {}}
          scrollHandle={undefined}
          forceMountRowId={forceMountRowId}
          newSinceRowId={null}
          onUnseenCount={store.setUnseenCount}
          onTimeline={store.setTimeline}
          failureHintRowId={failureHintRowId}
          failureHint={undefined}
          onOpenSubagent={() => {}}
          onOpenSubagentView={() => {}}
          onOpenJobs={() => {}}
          onWatchJobOutput={() => {}}
          onOpenFile={() => {}}
          sessionCwd={channel.cwd}
          onPreviewImage={() => {}}
          streamViewToggledRows={streamViewToggledRows}
          onToggleStreamView={(rowId: number) => store.setStreamViewToggledRows((prev) => {
            const next = new Set(prev)
            if (next.has(rowId)) next.delete(rowId)
            else next.add(rowId)
            return next
          })}
          selectionActive={selectionActive}
        />
      </ScrollBox>
      <PromptInput
        channel={channel}
        helpOpen={helpOpen}
        onToggleHelp={() => store.toggleHelp()}
        onRunCommand={(name: string, rawInput?: string) => runCommand(name, rawInput ?? '', { channel })}
        suspended={false}
        cursorParking={true}
        draftCache={undefined}
        selectionActive={selectionActive}
        fillText={null}
        onFillConsumed={() => {}}
        onRewindRequest={() => {}}
        onBackgroundRequest={() => {}}
        onOpenSessions={() => {}}
        controllerRef={undefined}
        onCaretImage={() => {}}
        caretPreviewOpen={false}
        onDismissCaretPreview={() => {}}
      />
      <StatusLine
        channel={channel}
        activity={undefined}
        selectionActive={selectionActive}
        helpOpen={helpOpen}
        pluginFields={statusFields}
        backendMode={undefined}
        modelPicker={undefined}
        effortPicker={undefined}
        wake={undefined}
      />
    </Box>
  )
}
