/**
 * TUI 布局：ScrollView（消息/工具卡）+ Editor（输入）+ 状态栏。
 * 用 pi-tui 的组件，不自己写布局引擎。
 */
import {
  Editor,
  ScrollView,
  Text,
  TuiMainScreen,
  VStack,
  ProcessTerminal,
  matchesKey,
} from '@earendil-works/pi-tui'

export interface TuiApp {
  tui: TuiMainScreen
  scroll: ScrollView
  editor: Editor
  status: Text
  append(component: unknown): void
  setStatus(text: string): void
  focusInput(): void
  stop(): void
}

export function createTui(options: {
  onSubmit(text: string): void
  onCancel(): void
  onExit(): void
}): TuiApp {
  const terminal = new ProcessTerminal()
  const tui = new TuiMainScreen(terminal, true)
  const scroll = new ScrollView({ follow: 'end', scrollbar: 'auto' })
  const status = new Text('')
  const editor = new Editor({
    onSubmit: (text) => {
      const trimmed = text.trim()
      if (trimmed) options.onSubmit(trimmed)
      editor.setText('')
    },
  })
  const root = new VStack([scroll, editor, status])
  tui.addChild(root)
  tui.setFocus(editor)
  tui.start()

  // Ctrl+C / Ctrl+D：取消/退出
  tui.addInputListener((data) => {
    if (matchesKey(data, 'ctrl+c')) { options.onCancel(); return { consume: true } }
    if (matchesKey(data, 'ctrl+d')) { options.onExit(); return { consume: true } }
    return undefined
  })

  return {
    tui,
    scroll,
    editor,
    status,
    append(component) {
      scroll.addChild(component as any)
      tui.requestRender()
    },
    setStatus(text) {
      status.setText(text)
      tui.requestRender()
    },
    focusInput() {
      tui.setFocus(editor)
    },
    stop() {
      tui.stop()
    },
  }
}
