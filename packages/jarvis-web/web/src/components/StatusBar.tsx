export function StatusBar({ status }: { status: 'connecting' | 'connected' | 'reconnecting' }) {
  return (
    <div className="status">
      <span><span className={`dot ${status === 'connected' ? '' : 'warn'}`} />{status}</span>
      <span>model · deepseek-flash</span>
      <span className="right">dshiunx · 维叶莎</span>
    </div>
  )
}
