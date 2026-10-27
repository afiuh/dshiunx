import { useCallback, useState } from 'react'
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
import type { RunAction } from '../actions'
import { useKeybindings } from '../hooks/useKeybindings'

/** 四区 + 按需并行区（E）工作台。 */
export function Workbench({ groups, itemsOf, renderGroups, renderItems, renderContent, renderActions, renderPanel, theme = 'light' }: WorkbenchProps) {
  const wb = useWorkbench(groups, itemsOf)
  const { sizes, start } = useResize(
    { top: 56, side: 220, bottom: 76, parallel: 320 },
    { top: [40, 240], side: [140, 480], bottom: [40, 360], parallel: [220, 720] },
  )
  const [collapsed, setCollapsed] = useState({ top: false, side: false, bottom: false })
  // 焦点：鼠标在哪个区，哪个区就是焦点
  const [focused, setFocused] = useState<'top' | 'side' | 'content' | 'actions' | 'parallel' | null>(null)
  // 所有非拖动行为走 run（快捷键与组件共用同一套）
  const run: RunAction = useCallback((name, payload) => {
    if (name === 'toggle-top') setCollapsed(prev => ({ ...prev, top: !prev.top }))
    if (name === 'toggle-side') setCollapsed(prev => ({ ...prev, side: !prev.side }))
    if (name === 'toggle-bottom') setCollapsed(prev => ({ ...prev, bottom: !prev.bottom }))
    if (name === 'open-parallel' && payload?.item !== undefined) wb.open(payload.item)
    if (name === 'close-parallel' && payload?.id !== undefined) wb.close(payload.id)
    if (name === 'select-group' && payload?.group !== undefined) wb.setActiveGroup(payload.group)
    if (name === 'select-item' && payload?.id !== undefined) wb.setActiveItem(payload.id)
    if (name === 'close-window') {
      // 平铺式：按焦点关闭/收起——E 关面板，B/C/D 收起，A 免疫
      if (focused === 'top') setCollapsed(prev => ({ ...prev, top: !prev.top }))
      else if (focused === 'side') setCollapsed(prev => ({ ...prev, side: !prev.side }))
      else if (focused === 'actions') setCollapsed(prev => ({ ...prev, bottom: !prev.bottom }))
      else if (focused === 'parallel') {
        const last = wb.parallel[wb.parallel.length - 1]
        if (last !== undefined) wb.close(last.id)
      }
      // focused === 'content'（A）→ 免疫，无操作
    }
  }, [wb, focused])
  useKeybindings(run)
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
