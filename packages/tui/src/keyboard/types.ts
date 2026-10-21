/** 快捷键上下文。 */
export interface KeyboardContext {
  channel: any
  [key: string]: any
}

export interface KeyEvent {
  input: string
  key: Record<string, boolean>
}
