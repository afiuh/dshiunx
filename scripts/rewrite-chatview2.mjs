import { Project, SyntaxKind } from 'ts-morph'
const project = new Project({ useInMemoryFileSystem: false })
const sf = project.addSourceFileAtPath('packages/tui-view/src/index.tsx')
const fn = sf.getFunctionOrThrow('ChatView')
// 已知组件（大写开头，排除 React/Box/Text/ScrollBox/AlternateScreen/SidePanelLayout/SidePanelColumn/TerminalSizeContext）
const known = new Set(['React','Box','Text','ScrollBox','AlternateScreen','SidePanelLayout','SidePanelColumn','TerminalSizeContext'])
let count = 0
fn.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).forEach(el => {
  const name = el.getTagNameNode().getText()
  if (name.includes('.') || known.has(name)) return
  el.getTagNameNode().replaceWithText('C.' + name)
  count++
})
fn.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(el => {
  const name = el.getTagNameNode().getText()
  if (name.includes('.') || known.has(name)) return
  el.getTagNameNode().replaceWithText('C.' + name)
  count++
})
sf.saveSync()
console.log('components replaced:', count)
