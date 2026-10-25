import { useRef, useState } from 'react'

export function InputBar({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)

  const submit = async (): Promise<void> => {
    if (busy || text.trim() === '') return
    setBusy(true)
    try { await onSend(text); setText('') } finally { setBusy(false) }
  }

  return (
    <div className="inputbar">
      <div className="inner">
        <textarea
          ref={area}
          value={text}
          placeholder="说话或打字…"
          onChange={event => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() }
          }}
        />
        <button className="primary" disabled={busy || text.trim() === ''} onClick={() => void submit()}>发送</button>
      </div>
      <div className="hint">Enter 发送 · Shift+Enter 换行 · 语音为主输入（待接）</div>
    </div>
  )
}
