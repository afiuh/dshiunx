import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/useChat'
import { MessageItem } from './MessageItem'

export function ChatLog({ messages }: { messages: ChatMessage[] }) {
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [messages])
  return (
    <div className="log">
      <div className="log-inner">
        {messages.map(message => <MessageItem key={message.id} message={message} />)}
        <div ref={end} />
      </div>
    </div>
  )
}
