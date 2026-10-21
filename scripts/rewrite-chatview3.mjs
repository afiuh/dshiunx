import { Project, SyntaxKind } from 'ts-morph'
const project = new Project({ useInMemoryFileSystem: false })
const sf = project.addSourceFileAtPath('packages/tui-view/src/index.tsx')
const fn = sf.getFunctionOrThrow('ChatView')
const known = new Set(['React','Box','Text','ScrollBox','AlternateScreen','SidePanelLayout','SidePanelColumn','TerminalSizeContext'])
let count = 0
fn.getDescendantsOfKind(SyntaxKind.JsxClosingElement).forEach(el => {
  const name = el.getTagNameNode().getText()
  if (name.includes('.') || known.has(name)) return
  el.getTagNameNode().replaceWithText('C.' + name)
  count++
})
sf.saveSync()
console.log('closing tags replaced:', count)
