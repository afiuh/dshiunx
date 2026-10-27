/** 黑箭头：展开时向内（点击收起），收起时向外（点击展开）。 */
export function Arrow({ direction }: { direction: 'up' | 'down' | 'left' | 'right' }) {
  const rotate = { up: 0, right: 90, down: 180, left: 270 }[direction]
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{ transform: `rotate(${rotate}deg)`, display: 'block' }} aria-hidden>
      <path d="M8 4l5 7H3z" />
    </svg>
  )
}
