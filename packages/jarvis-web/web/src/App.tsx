import { ChatLog } from './components/ChatLog'
import { InputBar } from './components/InputBar'
import { SessionList } from './components/SessionList'
import { StatusBar } from './components/StatusBar'
import { useChat } from './lib/useChat'

export function App() {
  const { messages, send, status } = useChat()
  return (
    <div className="app">
      <SessionList />
      <main className="main">
        <StatusBar status={status} />
        <ChatLog messages={messages} />
        <InputBar onSend={send} />
      </main>
    </div>
  )
}
