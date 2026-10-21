/** 呈现协议：renderer 只消费这些事件，不直接读 DSH 内部状态。 */
export type ViewEvent =
  | { kind: 'text-delta'; text: string }
  | { kind: 'text-end' }
  | { kind: 'tool-call'; id: string; name: string; args: unknown }
  | { kind: 'tool-result'; id: string; ok: boolean; preview: string }
  | { kind: 'turn-end'; usage?: { input?: number; output?: number } }
  | { kind: 'error'; message: string }
