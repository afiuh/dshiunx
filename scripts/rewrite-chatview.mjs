import { Project, SyntaxKind } from 'ts-morph'
const project = new Project({ useInMemoryFileSystem: false })
const sf = project.addSourceFileAtPath('packages/tui-view/src/index.tsx')
// ChatView 函数
const fn = sf.getFunctionOrThrow('ChatView')
// 数据字段列表（从 chatState 72 + Chat 的局部变量）
const vars = new Set(`approvalSnapshot questionSnapshot dialogSnapshot coupon recap balance supervisorOpen treeOpen settingsOpen jobsPanelOpen sceneOpen subagentDashboardOpen subagentDetailId btwSceneOpen btwOverlayOpen launchpadOpen onboardingOpen starModal starred themeName lang showAllMessages minimizedQuestionKey thinkingVisible loadedContextOpen peekSuppressed trajectorySeen forceMountRowId modelRecents skillsList providerInfos presetOptions effortOptions effortLevelsFallback historyEntries historyFill caretPreview hover expanded handle sidePanel pickerPanels statusFields workingActivity trajectory unseenCount selectionActive expandedRows streamViewToggledRows searchQuery searchCursor searchCount searchCurrent helpOpen overlay timeline isSticky pageInsetX chatColumns brand statusEntries statusViews statusContributions dialogOverlayVisible btwOverlayVisible couponVisible anchorUserText anchorUserRowId activePreview previewGallery previewIndex imagePreviewRegion promptEditorOpen promptReplacementOpen promptSelectionActive showPill newSinceRowId lastSeenRowIdRef compactionBadge activityWarnPct activitySlot backendModeStatus modelPickerStatus effortPickerStatus logoNonce starModal onboardingOpen launchpadOpen`.split(/\s+/))
let count = 0
fn.getDescendantsOfKind(SyntaxKind.Identifier).forEach(id => {
  const name = id.getText()
  if (!vars.has(name)) return
  const parent = id.getParent()
  // 跳过属性名/对象 key/JSX 属性名/声明
  if (parent && (
    parent.getKind() === SyntaxKind.PropertyAssignment && parent.getNameNode() === id ||
    parent.getKind() === SyntaxKind.JsxAttribute && parent.getNameNode() === id ||
    parent.getKind() === SyntaxKind.VariableDeclaration && parent.getNameNode() === id ||
    parent.getKind() === SyntaxKind.PropertyAccessExpression && parent.getNameNode() === id
  )) return
  id.replaceWithText('state.' + name)
  count++
})
sf.saveSync()
console.log('replaced:', count)
