/**
 * jarvis-web —— 维叶莎 Web renderer 插件。
 *
 * 只负责 HTTP / SSE / 静态资源 / 打开浏览器；不承载业务。
 * 前端在 ./web/dist（React 构建产物）。
 */
import { Service, type Context } from '@deepseek-ai/cordis'
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

/** HTTP + SSE surface for the Web renderer. */
export class JarvisWeb extends Service {
  private server?: Server
  private readonly clients = new Set<ServerResponse>()

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
    if (url.pathname === '/api/input' && req.method === 'POST') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      const body = Buffer.concat(chunks).toString('utf8')
      // 业务转发（agent）后续接入；当前只回执。
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true, received: body }))
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
