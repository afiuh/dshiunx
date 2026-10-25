import { useEffect, useRef, useState } from 'react'

export type ToolState = 'running' | 'done' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'reasoning'
  text: string
  tool?: { name: string; state: ToolState; detail?: string }
}

let seq = 0
const nextId = (): string => `m${++seq}`

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'reconnecting'>('connecting')
  const source = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource('/events')
    source.current = es
    es.onopen = () => setStatus('connected')
    es.onerror = () => setStatus('reconnecting')
    es.addEventListener('assistant', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { text: string }
      setMessages(prev => [...prev, { id: nextId(), role: 'assistant', text: data.text }])
    })
    es.addEventListener('reasoning', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { text: string }
      setMessages(prev => [...prev, { id: nextId(), role: 'reasoning', text: data.text }])
    })
    es.addEventListener('tool', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { name: string; state: ToolState; detail?: string }
      setMessages(prev => [...prev, { id: nextId(), role: 'tool', text: '', tool: data }])
    })
    return () => { es.close(); source.current = null }
  }, [])

  const send = async (text: string): Promise<void> => {
    const value = text.trim()
    if (value === '') return
    setMessages(prev => [...prev, { id: nextId(), role: 'user', text: value }])
    await fetch('/api/input', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: value }),
    })
  }

  return { messages, send, status }
}
