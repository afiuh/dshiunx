import { Context } from '@deepseek-ai/cordis'
import { JarvisVoice } from '@dshiunx/jarvis-voice'
import { readFileSync } from 'node:fs'

const ctx = new Context()
const voice = new JarvisVoice(ctx)
const pcm = readFileSync('/tmp/test-jarvis.pcm')
console.log('transcribe:', JSON.stringify(await voice.transcribe(pcm)))
await voice.speak('插件验证成功')
console.log('speak: ok')
await ctx.fiber.dispose()
