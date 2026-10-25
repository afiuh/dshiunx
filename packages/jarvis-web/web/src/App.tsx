import { useEffect } from 'react'
import { ChatLog } from './components/ChatLog'
import { InputBar } from './components/InputBar'
import { SessionList } from './components/SessionList'
import { StatusBar } from './components/StatusBar'
import { useChat } from './lib/useChat'

export function App() {
  const { messages, send, status, agentStatus } = useChat()
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      void fetch('/api/interrupt', { method: 'POST' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div className="app">
      <SessionList />
      <main className="main">
        <StatusBar status={status} agentStatus={agentStatus} />
        <ChatLog messages={messages} />
        <InputBar onSend={send} />
      </main>
    </div>
  )
}
