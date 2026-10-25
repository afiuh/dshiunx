import { useEffect, useState } from 'react'

interface SessionEntry { id: string; createdAt: number; cwd?: string }

function formatTime(ms: number): string {
  const date = new Date(ms)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export function SessionList() {
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  useEffect(() => {
    void fetch('/api/sessions').then(response => response.json()).then((data: SessionEntry[]) => { setSessions(data) }).catch(() => {})
  }, [])
  return (
    <aside className="sessions">
      <h2>sessions</h2>
      <div className="session active">当前对话</div>
      {sessions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 20).map(entry => (
        <div className="session" key={entry.id} title={entry.id}>
          {formatTime(entry.createdAt)}
        </div>
      ))}
    </aside>
  )
}
