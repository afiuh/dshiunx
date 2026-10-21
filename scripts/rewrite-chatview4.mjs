import { Project, SyntaxKind } from 'ts-morph'
const project = new Project({ useInMemoryFileSystem: false })
const sf = project.addSourceFileAtPath('packages/tui-view/src/index.tsx')
const fn = sf.getFunctionOrThrow('ChatView')
const known = new Set(['React','Box','Text','ScrollBox','AlternateScreen','SidePanelLayout','SidePanelColumn','TerminalSizeContext','state','C','t','String','Number','Boolean','Array','Object','JSON','Math','Date','Promise','Set','Map','console'])
let count = 0
fn.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
  const expr = call.getExpression()
  if (expr.getKind() !== SyntaxKind.Identifier) return
  const name = expr.getText()
  if (known.has(name)) return
  // 跳过本地定义（const xxx = ...）
  const varDecl = fn.getVariableDeclaration(name)
  if (varDecl) return
  expr.replaceWithText('C.' + name)
  count++
})
sf.saveSync()
console.log('functions replaced:', count)
