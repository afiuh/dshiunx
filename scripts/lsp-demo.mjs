/** LSP 演示：直接驱动 typescript-language-server 查询 TUI 文件。 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const bin = 'node_modules/.bin/typescript-language-server'
const file = 'packages/tui/src/index.tsx'
const uri = 'file://' + process.cwd() + '/' + file

const proc = spawn(bin, ['--stdio'], { stdio: ['pipe', 'pipe', 'inherit'] })
let buf = Buffer.alloc(0)
const pending = new Map()
let nextId = 1

proc.stdout.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk])
  while (true) {
    const idx = buf.indexOf('\r\n\r\n')
    if (idx < 0) break
    const header = buf.subarray(0, idx).toString()
    const m = /Content-Length: (\d+)/.exec(header)
    if (!m) { buf = buf.subarray(idx + 4); continue }
    const len = Number(m[1])
    if (buf.length < idx + 4 + len) break
    const body = buf.subarray(idx + 4, idx + 4 + len).toString()
    buf = buf.subarray(idx + 4 + len)
    const msg = JSON.parse(body)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
  }
})

function send(method, params, isRequest = true) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: isRequest ? nextId : undefined, method, params })
  const framed = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
  proc.stdin.write(framed)
  if (!isRequest) return
  const id = nextId++
  return new Promise((resolve) => pending.set(id, resolve))
}

const init = await send('initialize', { processId: process.pid, rootUri: 'file://' + process.cwd(), capabilities: {} })
console.log('server:', init.result?.serverInfo?.name, init.result?.serverInfo?.version)
await send('initialized', {}, false)
const source = readFileSync(file, 'utf8')
await send('textDocument/didOpen', { textDocument: { uri, languageId: 'typescriptreact', version: 1, text: source } }, false)
const line30 = source.split('\n')[30]
const char = line30.indexOf('useChatStore')

// 查 useChatStore 的定义（line 31 的调用）
const def = await send('textDocument/definition', { textDocument: { uri }, position: { line: 30, character: char } })
console.log('\\n[useChatStore 定义]')
for (const loc of def.result ?? []) console.log(`  ${loc.uri.replace('file://', '')}:${loc.range.start.line + 1}`)

// 查 Tui 的引用
const refs = await send('textDocument/references', { textDocument: { uri }, position: { line: 30, character: char }, context: { includeDeclaration: true } })
console.log('\\n[useChatStore 引用]', refs.result?.length ?? 0, '处')
for (const loc of (refs.result ?? []).slice(0, 10)) console.log(`  ${loc.uri.replace('file://', '').split('/').slice(-2).join('/')}:${loc.range.start.line + 1}`)

proc.kill()
