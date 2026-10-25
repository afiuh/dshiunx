export function StatusBar({ status, agentStatus }: { status: 'connecting' | 'connected' | 'reconnecting'; agentStatus: string }) {
  return (
    <div className="status">
      <span><span className={`dot ${status === 'connected' ? '' : 'warn'}`} />{status}</span>
      <span>model · deepseek-flash</span>
      <span>{agentStatus === 'idle' ? 'idle' : agentStatus}</span>
      <span className="right">dshiunx · 维叶莎</span>
    </div>
  )
}
