/**
 * jarvis-web —— 维叶莎 Web renderer 插件。
 *
 * 只负责 HTTP / SSE / 静态资源 / 打开浏览器；不承载业务。
 * 前端在 ./web/dist（React 构建产物）。
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import { brandString } from '@deepseek-ai/dsh-brand'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

export const name = 'jarvis-web'

const WEB_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'web', 'dist')
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
}

/** webm/opus → 16k mono s16le PCM（ffmpeg）。 */
function webmToPcm(webm: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 's16le', '-ac', '1', '-ar', '16000', 'pipe:1'], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', chunk => out.push(chunk as Buffer))
    child.stderr.on('data', chunk => err.push(chunk as Buffer))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve(Buffer.concat(out))
      else reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(err).toString('utf8').slice(-300)}`))
    })
    child.stdin.end(webm)
  })
}

/** HTTP + SSE surface for the Web renderer. */
export class JarvisWeb extends Service {
  private server?: Server
  private readonly clients = new Set<ServerResponse>()
  private agent?: Agent
  private buffer = ''

  constructor(ctx: Context) {
    super(ctx, 'jarvisWeb')
  }

  /** Start the server and open the browser. */
  async serve(port = 8787): Promise<string> {
    if (this.server !== undefined) return `http://127.0.0.1:${port}`
    const server = createServer((req, res) => { void this.handle(req, res) })
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, '127.0.0.1', () => resolve())
    })
    this.server = server
    const url = `http://127.0.0.1:${port}`
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
    return url
  }

  /** Stop the server and close every SSE stream. */
  async stop(): Promise<void> {
    for (const client of this.clients) client.end()
    this.clients.clear()
    const server = this.server
    this.server = undefined
    if (server !== undefined) await new Promise<void>(resolve => server.close(() => resolve()))
  }

  /** 懒创建 Web 会话的 agent，并把流事件推到浏览器。 */
  private async ensureAgent(): Promise<Agent> {
    if (this.agent !== undefined) return this.agent
    const registry = this.ctx.get('agents') as { create(options: unknown): Promise<{ agent: Agent }> } | undefined
    if (registry === undefined) throw new Error('agent service is not available')
    const defaultModel = this.ctx.get('agentDefaultModel') as { currentSelection(): object } | undefined
    const created = await registry.create({
      sessionId: brandString<SessionId>(`session-${randomUUID()}`),
      meta: { cwd: process.cwd() },
      agentOptions: { ...(defaultModel?.currentSelection() ?? {}) } as never,
    })
    this.agent = created.agent
    this.ctx.on('agent/assistant-stream', ({ agent, frame }) => {
      if (agent !== this.agent) return
      if (frame.type === 'chunk' && frame.chunk.type === 'text-delta') this.buffer += frame.chunk.text
    })
    this.ctx.on('session/event', (session, event) => {
      if (session !== this.agent?.session) return
      const data = event.data as { name?: string; callId?: string }
      if (event.type === 'tool/call') this.broadcast('tool', { name: data.name ?? 'tool', state: 'running' })
      if (event.type === 'tool/result') this.broadcast('tool', { name: data.name ?? 'tool', state: 'done' })
    })
    return this.agent
  }

  /** Push one SSE event to every connected browser. */
  broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of this.clients) client.write(payload)
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    if (url.pathname === '/events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      })
      res.write(': connected\n\n')
      this.clients.add(res)
      req.on('close', () => this.clients.delete(res))
      return
    }
    if (url.pathname === '/api/voice' && req.method === 'POST') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      try {
        const pcm = await webmToPcm(Buffer.concat(chunks))
        const voice = ctx.get('jarvisVoice') as { transcribe(pcm: Buffer): Promise<string> } | undefined
        if (voice === undefined) {
          res.writeHead(503, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'jarvis-voice plugin is not loaded' }))
          return
        }
        const text = await voice.transcribe(pcm)
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ text }))
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
      return
    }
    if (url.pathname === '/api/input' && req.method === 'POST') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      try {
        const { text } = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { text?: string }
        if (typeof text !== 'string' || text.trim() === '') {
          res.writeHead(400, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'text is required' }))
          return
        }
        const agent = await this.ensureAgent()
        this.buffer = ''
        agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }))
        void agent.whenIdle().then(() => { this.broadcast('assistant', { text: this.buffer }) })
        res.writeHead(202, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
      return
    }
    const path = url.pathname === '/' ? '/index.html' : url.pathname
    try {
      const data = await readFile(join(WEB_DIR, path))
      res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' })
      res.end(data)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  }
}

export function apply(ctx: Context): void {
  const web = new JarvisWeb(ctx)
  ctx.effect(() => () => { void web.stop() })
  // 等 shell 就绪再注册命令（apply 时 dxShell 可能还没提供）
  ctx.inject(['dxShell'], (shellCtx) => {
    shellCtx.dxShell.register('web', {
      description: 'open the Web UI',
      run: async () => { ctx.logger.info(`jarvis-web: ${await web.serve()}`) },
    })
  })
}
