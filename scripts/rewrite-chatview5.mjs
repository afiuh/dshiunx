import { Project, SyntaxKind } from 'ts-morph'
const project = new Project({ useInMemoryFileSystem: false })
const sf = project.addSourceFileAtPath('packages/tui-view/src/index.tsx')
const fn = sf.getFunctionOrThrow('ChatView')
// 自动提取：ChatView 里所有 Identifier 引用（排除关键字/组件/本地定义/属性名）
const known = new Set(['React','Box','Text','ScrollBox','AlternateScreen','SidePanelLayout','SidePanelColumn','TerminalSizeContext','state','C','t','String','Number','Boolean','Array','Object','JSON','Math','Date','Promise','Set','Map','console','true','false','null','undefined','if','else','for','while','return','const','let','var','function','new','typeof','void','await','async','this','key','props','of','in','do','switch','case','break','continue','try','catch','finally','throw','class','extends','super','yield','delete','instanceof','default','export','import','from','as'])
const localVars = new Set()
fn.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(d => localVars.add(d.getName()))
let count = 0
fn.getDescendantsOfKind(SyntaxKind.Identifier).forEach(id => {
  const name = id.getText()
  if (known.has(name) || localVars.has(name)) return
  const parent = id.getParent()
  if (!parent) return
  // 跳过属性名/JSX 属性名/对象 key/声明/成员访问
  const k = parent.getKind()
  if (k === SyntaxKind.PropertyAssignment && parent.getNameNode() === id) return
  if (k === SyntaxKind.JsxAttribute && parent.getNameNode() === id) return
  if (k === SyntaxKind.PropertyAccessExpression && parent.getNameNode() === id) return
  if (k === SyntaxKind.VariableDeclaration && parent.getNameNode() === id) return
  if (k === SyntaxKind.Parameter && parent.getNameNode() === id) return
  if (k === SyntaxKind.ShorthandPropertyAssignment && parent.getNameNode() === id) return
  id.replaceWithText('state.' + name)
  count++
})
sf.saveSync()
console.log('identifiers replaced:', count)
