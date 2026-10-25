/**
 * jarvis-voice —— 维叶莎语音插件：PCM → 文本（wetype ASR）/ 文本 → 语音（Edge-TTS）。
 *
 * 只做"转换"：录音与触发归调用方（Shell 命令 / 按键），本插件不知道路由。
 * Python sidecar 在 ./python/，可替换（换本地 ASR 只改 sidecar）。
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'jarvis-voice'

const PYTHON_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'python')

/** Run one Python sidecar and collect stdout. */
function runPython(script: string, args: string[], input?: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [join(PYTHON_DIR, script), ...args], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', chunk => out.push(chunk as Buffer))
    child.stderr.on('data', chunk => err.push(chunk as Buffer))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve(Buffer.concat(out).toString('utf8'))
      else reject(new Error(`jarvis-voice ${script} exited ${code}: ${Buffer.concat(err).toString('utf8').trim()}`))
    })
    if (input !== undefined) child.stdin.end(input)
    else child.stdin.end()
  })
}

/** Voice conversion service. */
export class JarvisVoice extends Service {
  constructor(ctx: Context) {
    super(ctx, 'jarvisVoice')
  }

  /** 16k mono s16le PCM → text. */
  async transcribe(pcm: Buffer): Promise<string> {
    return (await runPython('transcribe.py', [], pcm)).trim()
  }

  /** Text → Edge-TTS (Xiaoxiao) → play. */
  async speak(text: string): Promise<void> {
    await runPython('speak.py', [text])
  }
}

export function apply(ctx: Context): void {
  new JarvisVoice(ctx)
}
