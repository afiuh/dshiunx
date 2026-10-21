/** Chat 渲染层（ChatView）：只读 state，不持有逻辑。 */
import React from 'react'
import { Box, Text, AlternateScreen } from '../../dsh-tui/src/ui.js'
import { SidePanelColumn, SidePanelLayout } from '../../tui-components/src/index.js'
import { TerminalSizeContext } from '../../dsh-tui/src/ink/components/TerminalSizeContext.js'

/** Chat 的渲染树（纯渲染）：只读 state，不持有逻辑。 */
export function ChatView({ state, withTitle, PinnedTurnHeader }: { state: Record<string, any>; withTitle: (content: React.ReactNode) => React.ReactNode; PinnedTurnHeader: React.ComponentType<any> }): React.ReactNode {
  return withTitle(
    <Box flexDirection="column" flexGrow={1} width="100%">
      {/* 分栏布局：geometry 为 null（收起 / 窄屏 / inline / 编辑器展开）
          时 SidePanelLayout 原样渲染 children，与现状逐字节一致；分栏时
          左栏拿到 state.chatColumns 的 TerminalSizeContext 覆盖与出血边界。 */}
      <SidePanelLayout
        geometry={state.sidePanel.geometry}
        focus={state.sidePanel.focus}
        onActivateChat={state.sidePanel.focusChat}
        onActivatePanel={state.sidePanel.focusPanel}
        onResize={state.sidePanel.resize}
        side={
          <SidePanelColumn
            width={state.sidePanel.panelColumns}
            controller={state.sidePanel}
            channel={state.channel}
            activity={state.workingActivity}
            attention={{
              approvals: approvalSnapshot !== null ? 1 : 0,
              questions: questionSnapshot !== null ? 1 : 0,
            }}
            trajectory={state.trajectory}
            onExpand={state.openPanelFullscreen}
          />
        }
      >
      {!isSticky && timeline.activeId !== null && (
        <PinnedTurnHeader
          text={anchorUserText || null}
          onClick={() => {
            // Click snaps the pinned prompt to the viewport top. Jump by the
            // SAME content coordinate the
            // rail's tick uses (timeline turn top = the prompt TEXT top):
            // the element-based seek lands the row wrapper's margin at the
            // top instead — one row shy of the text top the anchor rule
            // compares against — and the header would flip to the previous
            // turn immediately after the click.
            const turn = timeline.turns.find(t => t.id === anchorUserRowId)
            if (turn) state.handle?.scrollTo(turn.top)
            else if (anchorUserRowId !== null) seekRow(anchorUserRowId)
            else state.handle?.scrollToBottom()
          }}
        />
      )}
      {/* Transcript row. Under PageMargin the negative right margin makes
          the row stretch past the content column to the terminal edge —
          the gutter (timeline rail / scrollbar) thus lands at the very
          edge while the transcript TEXT stays inside the page margin
          (structural chrome convention: dividers and the rail bleed, text
          and cards keep the content column). No explicit width: cross-axis
          stretch with the margin yields exactly content+margin. */}
      <Box flexDirection="row" flexGrow={1} flexShrink={1} marginRight={state.sidePanel.split ? 0 : -pageInsetX}>
        <ScrollBox ref={state.setHandle} flexDirection="column" flexGrow={1} flexShrink={1} stickyScroll>
        <LogoHeader
          key={state.logoNonce}
          model={state.channel.modelDisplay ?? state.channel.model}
          effort={state.channel.reasoningEffort}
          cwd={state.channel.displayCwd}
          // 大字字面（设置项 `dsh-tui.splashFont`）：`daily` 交回按天轮换
          // （`undefined`），其余 pin 住一款。
          fontId={splashFontIdOf(state.channel.splashFont)}
          whale={state.channel.whale}
          whaleIdle={state.channel.whaleIdle && whaleArtVisible}
          whaleGirl={state.channel.whaleGirl}
          brand={state.brand}
          starred={state.starred}
          onStarClick={state.runStarAction}
          working={state.channel.working}
          // Resuming a long session skips the ~3.4s opening animation: it
          // keeps firing low-frequency React commits that compete with the
          // transcript mount batches (and the first wheel events) for the
          // frame budget right when the user wants to read history. Fresh
          // sessions keep the full intro; restored ones settle instantly.
          // A remount after a whole screen closed also settles instantly
          // (see suppressLogoIntroRef).
          skipIntro={suppressLogoIntroRef.current || state.channel.rows.length > 30}
        />
        {/* The startup loaded-context panel: before the first message the
            transcript is empty, so the inventory of what this conversation
            will load (system prompt, workspace instructions, skills, tools)
            sits at the top, collapsed to a summary line and expandable with
            Ctrl+P; the first rows take over. */}
        {loadedContextVisible && (
          <LoadedContextPanel
            context={state.channel.loadedContext}
            open={state.loadedContextOpen}
            onToggle={state.toggleLoadedContext}
          />
        )}
        <MessageList
          rows={state.channel.rows}
          failureHintRowId={state.failureHintRowId}
          failureHint={t('traj-hint-failure', { key: primaryComboString('state.trajectory') })}
          expanded={state.expanded}
          expandedRows={state.expandedRows}
          selectedId={state.selectionActive ? selectedId : null}
          onToggleRow={state.toggleRowExpanded}
          streamViewToggledRows={state.streamViewToggledRows}
          onToggleStreamView={state.toggleStreamView}
          model={state.channel.modelDisplay ?? state.channel.model}
          diffLayout={state.channel.diffLayout}
          thinkingFold={state.channel.thinkingFold}
          jobGroupFold={state.channel.jobGroupFold}
          toolBackground={state.channel.toolBackground}
          foldTerminalCommand={state.channel.foldTerminalCommand}
          turnUsageRow={state.channel.turnUsageRow}
          smoothStreaming={state.channel.smoothStreaming}
          activityFrames={state.channel.activityFrames}
          showAll={state.showAllMessages}
          thinkingVisible={state.thinkingVisible}
          historyPaintEnabled={!state.fullscreen}
          fullscreen={state.fullscreen}
          onToggleAll={() =>{  useChatStore.getState().setShowAllMessages(previous => !previous) }}
          onLoadOlder={() => state.channel.loadOlder()}
          registerRowRef={state.registerRowRef}
          scrollHandle={state.handle}
          forceMountRowId={state.forceMountRowId}
          newSinceRowId={isSticky ? null : lastSeenRowIdRef.current}
          onUnseenCount={state.setUnseenCount}
          onTimeline={useChatStore.getState().setTimeline}
          onOpenSubagent={state.setSubagentDetailId}
          onOpenSubagentView={state.openSubagentViewFromCard}
          onOpenJobs={state.openJobsPanel}
          onOpenFile={state.openFileActions}
          sessionCwd={state.channel.cwd}
          onPreviewImage={state.openImagePreview}
          suppressImageGraphics={activePreview !== null}
          olderHistory={state.channel.olderHistory}
          onWatchJobOutput={state.watchJobOutput}
        />
        </ScrollBox>
        {(() => {
          // Gutter mode (settings `dsh-tui.scrollGutter`): the timeline
          // rail (default), the proportional scrollbar, or nothing. The
          // slot keeps its 2 columns in both rendered modes (Qwen's
          // permanent-gutter rule — an appearing/disappearing gutter
          // changes the transcript width and rewraps everything).
          const gutter = normalizeScrollGutter(state.channel.scrollGutter)
          if (gutter === 'hidden') return null
          if (gutter === 'scrollbar') {
            return <ScrollbarGutter handle={state.handle} terminalWidth={state.chatColumns} />
          }
          return (
            <TimelineRail
              handle={state.handle}
              turns={timeline.turns}
              activeId={timeline.activeId}
              upId={timeline.upId}
              downId={timeline.downId}
              terminalWidth={state.chatColumns}
              hoverEnabled={!state.promptSelectionActive}
              onRevealTurn={state.revealAndSeekRow}
            />
          )
        })()}
        {!promptEditorOpen && imagePreviewNode}
      </Box>
      {/* Bottom chrome (pill, spinners, dialogs, prompt, statusline): never
          let flex shrink squeeze these fixed-height rows — the ScrollBox
          above absorbs all overflow (it is the scroll container). */}
      <Box flexDirection="column" flexShrink={0}>
        {showPill && (
          <NewMessagesPill
            count={state.unseenCount}
            onClick={() => state.handle?.scrollToBottom()}
          />
        )}
        {state.channel.working &&
          (activitySlot &&
          state.workingActivity !== undefined &&
          state.workingActivity.line !== '' &&
          state.workingActivity.phase !== 'idle' ? (
            // The working-activity line replaces the random-verb spinner
            // while a turn runs: the plugin's live line (thinking copy /
            // running tool / narration) is the status, with the spinner
            // slot's token counter preserved as a suffix. Only real activity
            // data replaces the spinner — before the first event, or with
            // `activity: false`, the classic spinner still renders. The line
            // hugs the left edge (no padding) so the self-narration reads as
            // part of the transcript, aligned with the `❯` prompt below.
              <Box marginTop={1}>
                <ActivityLine
                  activity={state.workingActivity}
                  activityFrames={state.channel.activityFrames}
                  warnPct={state.activityWarnPct}
                  warnDanger={state.activityWarnPct !== undefined && state.activityWarnPct >= 95}
                  // Upload = real tokens of the last request; download =
                  // the animated chars/4 estimate, matching the classic
                  // spinner's counter (the suffix used raw chars before,
                  // inflating the reading next to a real upload number). An
                  // automatic compaction mid-turn badges THIS line too — it is
                  // the spinner slot whenever real activity data exists.
                  suffix={`${lastUploadTokens > 0 ? ` · ↑ ${formatTokens(lastUploadTokens)}` : ''} · ↓ ${formatTokens(Math.round(state.channel.responseChars / 4))} tokens${state.compactionBadge === undefined ? '' : ` · ${state.compactionBadge}`}`}
                />
              </Box>
            ) : (
              <WorkingSpinner
                mode={state.channel.spinnerMode}
                hasActiveTools={state.channel.activeToolCount > 0}
                responseLengthRef={state.responseLengthRef}
                uploadTokensRef={state.uploadTokensRef}
                loadingStartTimeRef={state.loadingStartTimeRef}
                totalPausedMsRef={state.totalPausedMsRef}
                pauseStartTimeRef={state.pauseStartTimeRef}
                thinkingStatus={state.thinkingStatus}
                suffix={state.compactionBadge}
              />
            ))}
        {!state.channel.working && state.channel.compaction !== undefined && (
          // Manual `/compact` runs while the session is idle: the row takes the
          // spinner slot so the screen never looks frozen for its ~25-70s.
          <CompactionStatusRow
            compaction={state.channel.compaction}
            activityPreset={activitySlot ? state.channel.activityFrames : undefined}
          />
        )}
        {/* 分栏且 todo Panel 已启用时，Goal/Todo 由右栏 Panel 承载，
            底部 chrome 不再挂载（窄屏 / inline / 未启用时保留现状）。 */}
        {!(state.sidePanel.split && state.sidePanel.enabledPanelIds.includes('todo'))
          && !todoFooterHidden && (
          <GoalTodoPanel
            channel={state.channel}
            collapsed={state.todoCollapsed}
            onToggle={state.toggleTodoFooter}
            idleDismissal
          />
        )}
        {recap !== null && recap.auto && !recap.state.expanded && (
          <AutoRecapRow
            summary={recap.summary}
            streaming={!recap.done}
            onExpand={() => setRecap(prev => (prev ? { ...prev, expanded: true } : prev))}
            onDismiss={() => closeRecap()}
          />
        )}
        {balance !== null && (
          <BalanceReportRow
            result={balance.result}
            refreshing={balance.refreshing}
            tokens={state.channel.tokens}
            model={state.channel.modelDisplay ?? state.channel.model}
            provider={state.channel.provider}
            mainCost={state.channel.mainCost}
            subagentCost={state.channel.subagentCost}
            onRefresh={state.runBalance}
            onDismiss={() => setBalance(null)}
          />
        )}
        {statusEntries.length > 0 && (
          // Plugin status contributions (tuiStatus seam): one joined line,
          // truncated by the Text wrap contract — the host owns the layout,
          // plugins own only their text.
          <Text dimColor wrap="truncate">
            {statusEntries.map(entry => entry.text).join(' · ')}
          </Text>
        )}
        {activePreview === null && statusViews.map(view => (
          <PluginStatusViewBoundary
            key={`${view.key}:${view.registrationId}`}
            viewKey={view.key}
            onError={(key, error) => statusContributions.reportViewError(key, error)}
          >
            <Box
              flexDirection="column"
              flexShrink={0}
              maxHeight={view.maxRows}
              overflow="hidden"
            >
              <Box flexDirection="column" flexShrink={0}>
                {React.createElement(view.component, {
                  React,
                  ui: STATUS_VIEW_UI,
                })}
              </Box>
            </Box>
          </PluginStatusViewBoundary>
        ))}
        {/* 输入簇：可替换输入行链 + 状态行 + 瞬态浮层。浮层锚点收窄到本簇
            顶边（= 输入行顶边），picker 紧贴输入框向上展开，盖住其上
            todo/spinner/转录尾部行（用户接受的取舍），自身零布局高度、
            不推动帧布局。 */}
        <Box flexDirection="column" flexShrink={0}>
        {approvalPanelNode !== null ? (
          approvalPanelNode
        ) : state.dialogSnapshot !== null ? (
          <ExtensionDialog
            key={state.dialogSnapshot.key}
            dialog={state.dialogSnapshot}
            onDecide={value => dialogs.decide(state.dialogSnapshot.key, value)}
            onCancel={() => dialogs.cancel(state.dialogSnapshot.key)}
          />
        ) : overlay.kind === 'tips' ? (
          <Box flexDirection="column" marginTop={1}>
            <TipsPanel onClose={() => useChatStore.getState().dispatchOverlay({ type: 'close-if', kind: 'tips' })} />
          </Box>
        ) : recap !== null && (!recap.auto || recap.state.expanded) ? (
          <Box flexDirection="column" marginTop={1}>
            <RecapPanel
              summary={recap.summary}
              title={recap.title}
              error={recap.error}
              streaming={!recap.done}
              titleApplied={recap.titleApplied}
              onClose={() => {
                // An state.expanded auto recap collapses back to its dim row;
                // a manual /recap closes outright.
                if (recap.auto) {
                  setRecap(prev => (prev ? { ...prev, expanded: false } : prev))
                } else {
                  closeRecap()
                }
              }}
              onCopy={() => {
                void setClipboard(recap.summary ?? '').then(raw => { if (raw) writeRaw?.(raw) })
                state.channel.notify(t('copied-chars', { n: (recap.summary ?? '').length }), { timeoutMs: 1500 })
              }}
              onApplyTitle={() => {
                if (recap.title === undefined || recap.titleApplied) return
                state.channel.renameSession(recap.title)
                setRecap(prev => (prev ? { ...prev, titleApplied: true } : prev))
                state.channel.notify(t('recap-title-applied-notify', { title: recap.title }), { color: 'success' })
              }}
            />
          </Box>
        ) : state.btwOverlayVisible ? (
          // 浮层只在 btw 线程没有真正上屏时显示：面板未启用，或分栏渲不
          // 出来（窄屏 / inline / splitEnabled=false），或分栏
          // 在、但画的是别的面板。侧栏真的显示 btw 线程时浮层立即让位——
          // 单一 surface（判定见 btwPanelOnScreen）。
          <Box flexDirection="column" marginTop={1}>
            <BtwPanelFallback
              thread={state.btwOverlayThread}
              onClose={state.closeBtwOverlay}
              onCopy={answer => {
                void setClipboard(answer).then(raw => { if (raw) writeRaw?.(raw) })
                state.channel.notify(t('copied-chars', { n: answer.length }), { timeoutMs: 1500 })
              }}
            />
          </Box>
        ) : questionPanelNode !== null ? (
          questionPanelNode
        ) : null}
        <PromptInput
          key="prompt-input"
          channel={state.channel}
          suspended={state.promptReplacementOpen}
          // 选择器、搜索框或侧栏持有键盘焦点时，让对应输入框接管原生
          // 光标与 IME 锚点，避免主输入框在后续提交中抢回声明。
          cursorParking={overlay.kind === 'none' && state.sidePanel.focus !== 'panel'}
          // 宠物面板是活动面板时，通知由它的头顶气泡「说出来」，输入框上方
          // 不再重复弹同一条（error 色除外——可能要行动的信号永远走 toast）。
          // 渲染期判定（split + activePanelId），与气泡同一次提交切换，不会
          // 先闪一帧 toast 再消失。
          toastSuppressed={state.petSaysNotices}
          draftCache={promptDraftRef.current}
          helpOpen={state.helpOpen}
          onToggleHelp={() =>{  useChatStore.getState().toggleHelp() }}
          onRunCommand={state.runCommand}
          selectionActive={state.promptSelectionActive}
          fillText={state.historyFill}
          onFillConsumed={() => setHistoryFill(null)}
          onRewindRequest={state.openRewind}
          onBackgroundRequest={state.backgroundToAgentView}
          // The 🏠 at the head of the input row opens the same session screen
          // `/resume` and `/agentview` open — one surface, three doors. It is
          // gated on this prop rather than a setting, so hosts that mount the
          // prompt without a session screen (and the layout regressions that
          // pin the row's column budget) keep the row they had.
          onOpenSessions={() => {
            agentViewOpenSessionRef.current = state.channel.agentId
            setSupervisorOpen(true)
          }}
          // 当前内核的短品牌名：与选择器、落地页铭牌同一份 manifest 数据（P0 D2）。
          backendLabel={kernelCurrentOption?.shortLabel}
          backgroundAgentsNeedingInput={
            // Only the real state.channel supplies the seam; pre-agent-view test
            // stubs must not grow the footer row (layout-dependent
            // regressions pin the visible row count). The footer only
            // renders while some session actually waits (N > 0): a
            // permanent idle row would steal a transcript row on every
            // real state.channel — one row is enough to scroll the startup
            // header fully off a short terminal, pausing its viewport
            // clock and shifting every row-count layout invariant.
            state.channel.agentViewRows !== undefined && backgroundAgentsNeedingInput > 0
              ? backgroundAgentsNeedingInput
              : undefined
          }
          controllerRef={state.promptControllerRef}
          onCaretImage={state.handleCaretImage}
          caretPreviewOpen={peekPreview !== null}
          onDismissCaretPreview={state.dismissPeek}
        />
        {statusSlot !== undefined ? statusSlot({
          channel: state.channel,
          activity: state.workingActivity,
          selectionActive: state.selectionActive,
          helpOpen: state.helpOpen,
          pluginFields: state.statusFields,
          backendMode: state.backendModeStatus,
          modelPicker: state.modelPickerStatus,
          effortPicker: state.effortPickerStatus,
          wake: wakeBand === undefined
            ? undefined
            : {
                band: wakeBand,
                hint: trajectorySeen ? undefined : primaryComboString('state.trajectory'),
                onOpen: openScene,
                hoverHint: primaryComboString('state.trajectory'),
              },
        }) : (
          <StatusLine
            channel={state.channel}
            activity={state.workingActivity}
            selectionActive={state.selectionActive}
            helpOpen={state.helpOpen}
            pluginFields={state.statusFields}
            backendMode={state.backendModeStatus}
            modelPicker={state.modelPickerStatus}
            effortPicker={state.effortPickerStatus}
            wake={wakeBand === undefined ? undefined : {
              band: wakeBand,
              hint: trajectorySeen ? undefined : primaryComboString('state.trajectory'),
              onOpen: openScene,
              hoverHint: primaryComboString('state.trajectory'),
            }}
          />
        )}
        {/* 瞬态面板浮层：absolute + bottom:'100%' 钉在输入簇 Box 顶边（=
            输入行顶边），紧贴输入框向上覆盖其上 todo/spinner/转录尾部行，
            自身零布局高度。in-flow 挂载会让帧高随面板开关涨落，把帧顶行滚进
            scrollback 并在关闭重绘时二次写入（每切一次 /model 多一份启动画
            的根因）。浮层盖住 todo 是刻意取舍（贴输入框优先）；maxHeight
            预留 prompt/statusline 行，防短会话高列表探出帧顶。整体条件
            挂载：见 state.dialogOverlayOpen 注释。 */}
        {state.dialogOverlayOpen && (
        <OverlayAbove maxHeight={Math.max(terminalRows - 8, 1)}>
          {state.pickerPanels}
        </OverlayAbove>
        )}
        </Box>
      </Box>
      {/* Tooltip 悬停浮层：absolute 零布局高度，挂在聊天栏内最后（v2.1
          surface 边界）——它读到的是聊天列宽，clamp 后永远不会越过中缝
          压进右栏；yoga 的 absolute 相对父级，聊天栏原点即内容区原点，
          指针 anchor 的屏幕坐标换算（anchorCol - inset.x）保持正确。
          订阅模块级 store，锚点/内容由各处 useTooltip hover props 写入；
          resize 时自行隐藏（几何失效）。 */}
      <TooltipLayer
        invalidationKey={`${overlay.kind}:${state.dialogOverlayOpen}:${state.btwOverlayVisible}`}
        subscribeInvalidation={state.subscribeTooltipInvalidation}
      />
      </SidePanelLayout>
      {/* 全屏草稿编辑浮层：必须挂在 TooltipLayer 之后，才能盖住包括
          状态栏在内的全部普通后绘兄弟。内容由 PromptInput 经 module
          store 发布（见 PromptEditor.tsx）。图片预览是唯一有意后绘于它
          的 top modal：这样编辑器状态留在原处，关闭预览即可原样恢复。 */}
      <PromptEditorLayer />
      {/* 模态图片预览的全屏位：只在全屏草稿编辑器展开时用（编辑器盖住了
          transcript 行，预览必须作为根的最后一个孩子才压得过它）；平时
          预览挂在上面的 transcript 行内，见 imagePreviewNode。 */}
      {promptEditorOpen && imagePreviewNode}
      {/* 开屏"求 star"弹窗（99h / 999 次）：最后一个孩子，压过包括全屏
          草稿编辑器在内的全部后绘兄弟；关闭即整树卸载——键盘自然交还，
          没有残留的监听会再抢键。onClose 用 useCallback 钉死引用：弹窗
          开着的每一帧 Chat 重渲染都不弄脏它的绝对定位捕获层。 */}
      {starModal !== null && STAR_MILESTONES[starModal.index] !== undefined && (
        <StarPrompt
          milestone={STAR_MILESTONES[starModal.index]}
          actions={state.starModalActions}
          onClose={state.closeStarModal}
          initialPhase={starModal.phase}
        />
      )}
      {couponVisible && state.coupon !== null && (
        <WhaleCouponPrompt notice={state.coupon} onShown={state.markCouponShown} onClose={state.closeCoupon} />
      )}
    </Box>
  )
}
