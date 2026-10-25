import type { ChatMessage } from '../lib/useChat'

export function MessageItem({ message }: { message: ChatMessage }) {
  if (message.role === 'tool' && message.tool !== undefined) {
    const { name, state, detail } = message.tool
    return (
      <details className="tool">
        <summary>
          <span className="name">{name}</span>
          <span className={`state ${state}`}>{state}</span>
        </summary>
        {detail !== undefined && <pre>{detail}</pre>}
      </details>
    )
  }
  return (
    <div className={`msg ${message.role}`}>
      <div className="who">{message.role === 'user' ? 'you' : 'dshiunx'}</div>
      <div className="body">{message.text}</div>
    </div>
  )
}
