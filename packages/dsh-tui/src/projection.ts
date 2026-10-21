import type { ViewEvent } from './view-event.ts'

/**
 * 把 DSH 的 session 事件投影成 ViewEvent。
 * 只做映射，不做业务判断；renderer 不读 DSH 内部状态。
 */
export function projectSessionEvent(event: any): ViewEvent | undefined {
  switch (event?.type) {
    case 'assistant/message': {
      const text = (event.data?.message?.content ?? [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')
      return text ? { kind: 'text-delta', text } : undefined
    }
    case 'tool/call':
      return { kind: 'tool-call', id: String(event.data?.id ?? ''), name: String(event.data?.name ?? ''), args: event.data?.args }
    case 'tool/result':
      return { kind: 'tool-result', id: String(event.data?.id ?? ''), ok: event.data?.ok !== false, preview: String(event.data?.preview ?? '') }
    case 'turn/end':
      return { kind: 'turn-end', usage: event.data?.usage }
    default:
      return undefined
  }
}
