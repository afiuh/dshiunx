import { useState } from 'react'

/** 拖放状态：dragging（条目 id）/ active（放置区高亮）。 */
export function useDropTarget(onDrop: (itemId: string) => void) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  const dragHandlers = (itemId: string) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent): void => {
      setDragging(itemId)
      event.dataTransfer.setData('text/plain', itemId)
    },
    onDragEnd: (): void => {
      setDragging(null)
      setActive(false)
    },
  })

  const zoneHandlers = {
    onDragOver: (event: React.DragEvent): void => {
      event.preventDefault()
      setActive(true)
    },
    onDragLeave: (): void => setActive(false),
    onDrop: (event: React.DragEvent): void => {
      event.preventDefault()
      setActive(false)
      setDragging(null)
      const itemId = event.dataTransfer.getData('text/plain')
      if (itemId !== '') onDrop(itemId)
    },
  }

  return { dragging, active, dragHandlers, zoneHandlers }
}
