import { useRef, useState } from 'react'

type VoiceState = 'idle' | 'recording' | 'processing'

/** 显眼的语音输入按钮：空闲 / 录音中（脉冲）/ 识别中。 */
export function VoiceButton({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const [state, setState] = useState<VoiceState>('idle')
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const start = async (): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    chunks.current = []
    mr.ondataavailable = event => { if (event.data.size > 0) chunks.current.push(event.data) }
    mr.onstop = async () => {
      setState('processing')
      stream.getTracks().forEach(track => track.stop())
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      try {
        const response = await fetch('/api/voice', { method: 'POST', headers: { 'content-type': 'audio/webm' }, body: blob })
        const data = await response.json() as { text?: string; error?: string }
        if (data.text) onTranscribed(data.text)
      } finally {
        setState('idle')
      }
    }
    mr.start()
    recorder.current = mr
    setState('recording')
  }

  const stop = (): void => {
    recorder.current?.stop()
    recorder.current = null
  }

  return (
    <button
      className={`voice ${state}`}
      onClick={() => { if (state === 'recording') stop(); else if (state === 'idle') void start() }}
      title="语音输入"
    >
      <span className="icon" aria-hidden>
        {state === 'recording' ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        ) : state === 'processing' ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8" stroke-dasharray="4 4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" /></circle></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
        )}
      </span>
      <span className="label">{state === 'recording' ? '正在听' : state === 'processing' ? '识别中' : '语音'}</span>
    </button>
  )
}
