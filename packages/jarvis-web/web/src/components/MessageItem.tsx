import { marked } from 'marked'
import type { ChatMessage } from '../lib/useChat'

/** 渲染 Markdown（marked；本地单人使用，不做 HTML 消毒）。 */
function Markdown({ text }: { text: string }) {
  const html = marked.parse(text, { async: false }) as string
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

export function MessageItem({ message }: { message: ChatMessage }) {
  if (message.role === 'reasoning') {
    return (
      <details className="reasoning">
        <summary>思考过程</summary>
        <div className="body"><Markdown text={message.text} /></div>
      </details>
    )
  }
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
      <div className="body">{message.role === 'assistant' ? <Markdown text={message.text} /> : message.text}</div>
    </div>
  )
}
