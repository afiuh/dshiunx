import { useEffect, useState } from 'react'
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
import { useActions } from '../hooks/useActions'
import { useKeybindings } from '../hooks/useKeybindings'

/** 四区 + 按需并行区（E）工作台。 */
export function Workbench({ groups, itemsOf, renderGroups, renderItems, renderContent, renderActions, renderPanel, theme = 'light', keybindings, initialState, onStateChange }: WorkbenchProps) {
  const wb = useWorkbench(groups, itemsOf, initialState?.parallel ?? [])
  const { sizes, start } = useResize(
    { top: 56, side: 220, bottom: 76, parallel: 320, ...initialState?.sizes },
    { top: [40, 240], side: [140, 480], bottom: [40, 360], parallel: [220, 720] },
  )
  const [collapsed, setCollapsed] = useState({ top: false, side: false, bottom: false })
  // 焦点：鼠标在哪个区，哪个区就是焦点
  const [focused, setFocused] = useState<'top' | 'side' | 'content' | 'actions' | 'parallel' | null>(null)
  const run = useActions(wb, collapsed, setCollapsed, focused)
  // 母体做最轻：只在关闭/刷新前回调一次（拖拽过程中零回调、不写存储）。
  // 应用按需决定存 localStorage / 后端 / URL，或干脆不存。
  useEffect(() => {
    if (onStateChange === undefined) return
    const handler = (): void => {
      onStateChange({ sizes, collapsed, parallel: wb.parallel.map(panel => panel.item.id) })
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [sizes, collapsed, wb.parallel, onStateChange])
  useKeybindings(run, keybindings)
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
      <header className="wb-top" data-collapsed={collapsed.top} style={{ height: dims.top }} onMouseEnter={() => setFocused('top')} onMouseLeave={() => setFocused(null)}>
        <Groups groups={groups} active={wb.activeGroup} onSelect={id => run('select-group', { group: id })} onResize={start('top', 'y', 1)} render={renderGroups} />
        <button className="wb-collapse-edge" title={collapsed.top ? '展开' : '收起'} onClick={() => run('toggle-top')}><Arrow direction={collapsed.top ? 'down' : 'up'} /></button>
        <div className="wb-status">status · 全局状态</div>
      </header>
      <div className="wb-body">
        <Index
          title={wb.group?.label ?? ''}
          items={wb.items}
          active={wb.activeItem}
          onSelect={id => run('select-item', { id })}
          onOpen={item => run('open-parallel', { item })}
          dragHandlers={drop.dragHandlers}
          onResize={start('side', 'x', 1)}
          width={dims.side}
          render={renderItems}
          collapsed={collapsed.side}
          onToggle={() => run('toggle-side')}
          onFocus={() => setFocused('side')}
          onBlur={() => setFocused(null)}
        />
        <main className="wb-main">
          {drop.dragging !== null && wb.parallel.length === 0 && (
            <DropZone active={drop.active} zoneHandlers={drop.zoneHandlers} />
          )}
          <Content onFocus={() => setFocused('content')} onBlur={() => setFocused(null)}>{wb.item === undefined ? null : renderContent(wb.item)}</Content>
          <Actions onResize={start('bottom', 'y', -1)} height={dims.bottom} collapsed={collapsed.bottom} onToggle={() => run('toggle-bottom')} onFocus={() => setFocused('actions')} onBlur={() => setFocused(null)}>
            {wb.item === undefined ? null : renderActions?.(wb.item)}
          </Actions>
        </main>
        {wb.parallel.length > 0 && (
          <Parallel
            panels={wb.parallel}
            renderPanel={render}
            onClose={id => run('close-parallel', { id })}
            onResizeStart={start('parallel', 'x', -1)}
            zoneHandlers={drop.zoneHandlers}
            active={drop.active}
            width={sizes.parallel}
            onFocus={() => setFocused('parallel')}
            onBlur={() => setFocused(null)}
          />
        )}
      </div>
    </div>
  )
}
