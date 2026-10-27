import type { Group } from '../types'
import { Grip } from './Grip'
import { Arrow } from './Arrow'

/** D：分组 tabs。 */
export function Groups({ groups, active, onSelect, onResize, collapsed, onToggle }: { groups: readonly Group[]; active: string; onSelect: (id: string) => void; onResize: (event: React.PointerEvent) => void; collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="wb-groups">
      {groups.map(group => (
        <button key={group.id} className={group.id === active ? 'active' : ''} onClick={() => onSelect(group.id)}>{group.label}</button>
      ))}
      <button className="wb-collapse" title={collapsed ? '展开' : '收起'} onClick={onToggle}><Arrow direction={collapsed ? 'up' : 'down'} /></button>
      <Grip kind="v" onPointerDown={onResize} />
    </div>
  )
}
