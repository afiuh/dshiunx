import { useState } from 'react'
import type { WorkbenchProps } from '../types'
import { useWorkbench } from '../hooks/useWorkbench'
import { useResize } from '../hooks/useResize'
import { useDropTarget } from '../hooks/useDropTarget'
import { Groups } from './Groups'
import { Index } from './Index'
import { Content } from './Content'
import { Actions } from './Actions'
import { Parallel } from './Parallel'
import { DropZone } from './DropZone'
import { Arrow } from './Arrow'

/** 四区 + 按需并行区（E）工作台。 */
export function Workbench({ groups, itemsOf, renderContent, renderActions, renderPanel, theme = 'light' }: WorkbenchProps) {
  const wb = useWorkbench(groups, itemsOf)
  const { sizes, start } = useResize(
    { top: 56, side: 220, bottom: 76, parallel: 320 },
    { top: [40, 240], side: [140, 480], bottom: [40, 360], parallel: [220, 720] },
  )
  const [collapsed, setCollapsed] = useState({ top: false, side: false, bottom: false })
  const toggle = (key: 'top' | 'side' | 'bottom') => (): void => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const dims = {
    top: collapsed.top ? 26 : sizes.top,
    side: collapsed.side ? 26 : sizes.side,
    bottom: collapsed.bottom ? 26 : sizes.bottom,
  }
  const drop = useDropTarget(itemId => {
    const item = wb.items.find(entry => entry.id === itemId)
    if (item !== undefined) wb.open(item)
  })
  const render = renderPanel ?? renderContent

  return (
    <div className={`wb ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="wb-top" data-collapsed={collapsed.top} style={{ height: dims.top }}>
        <Groups groups={groups} active={wb.activeGroup} onSelect={wb.setActiveGroup} onResize={start('top', 'y', 1)} />
        <button className="wb-collapse-edge" title={collapsed.top ? '展开' : '收起'} onClick={toggle('top')}><Arrow direction={collapsed.top ? 'up' : 'down'} /></button>
        <div className="wb-status">status · 全局状态</div>
      </header>
      <div className="wb-body">
        <Index
          title={wb.group?.label ?? ''}
          items={wb.items}
          active={wb.activeItem}
          onSelect={wb.setActiveItem}
          onOpen={wb.open}
          dragHandlers={drop.dragHandlers}
          onResize={start('side', 'x', 1)}
          width={dims.side}
          collapsed={collapsed.side}
          onToggle={toggle('side')}
        />
        <main className="wb-main">
          {drop.dragging !== null && wb.parallel.length === 0 && (
            <DropZone active={drop.active} zoneHandlers={drop.zoneHandlers} />
          )}
          <Content>{wb.item === undefined ? null : renderContent(wb.item)}</Content>
          <Actions onResize={start('bottom', 'y', -1)} height={dims.bottom} collapsed={collapsed.bottom} onToggle={toggle('bottom')}>
            {wb.item === undefined ? null : renderActions?.(wb.item)}
          </Actions>
        </main>
        {wb.parallel.length > 0 && (
          <Parallel
            panels={wb.parallel}
            renderPanel={render}
            onClose={wb.close}
            onResizeStart={start('parallel', 'x', -1)}
            zoneHandlers={drop.zoneHandlers}
            active={drop.active}
            width={sizes.parallel}
          />
        )}
      </div>
    </div>
  )
}
