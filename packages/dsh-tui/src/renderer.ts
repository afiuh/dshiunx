import type { ViewEvent } from './view-event.ts'

/** 极简 ANSI renderer：流式文本直接写，工具调用折叠成一行。 */
export class Renderer {
  private textOpen = false
  private tools = new Map<string, string>()

  write(event: ViewEvent): void {
    switch (event.kind) {
      case 'text-delta':
        process.stdout.write(event.text)
        this.textOpen = true
        break
      case 'text-end':
        if (this.textOpen) process.stdout.write('\n')
        this.textOpen = false
        break
      case 'tool-call':
        this.tools.set(event.id, event.name)
        process.stdout.write(`\x1b[2m⏺ ${event.name}\x1b[0m\n`)
        break
      case 'tool-result': {
        const name = this.tools.get(event.id) ?? 'tool'
        process.stdout.write(`\x1b[2m✓ ${name}${event.preview ? ` · ${event.preview.slice(0, 80)}` : ''}\x1b[0m\n`)
        this.tools.delete(event.id)
        break
      }
      case 'turn-end':
        process.stdout.write('\n')
        break
      case 'error':
        process.stdout.write(`\x1b[31m✗ ${event.message}\x1b[0m\n`)
        break
    }
  }
}
