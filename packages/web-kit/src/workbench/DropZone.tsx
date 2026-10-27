/** A 右侧的放置检测区（拖拽时出现）。 */
export function DropZone({ active, zoneHandlers }: { active: boolean; zoneHandlers: object }) {
  return (
    <div className={`wb-drop ${active ? 'active' : ''}`} {...zoneHandlers}>
      <span>松开 → 并行打开</span>
    </div>
  )
}
