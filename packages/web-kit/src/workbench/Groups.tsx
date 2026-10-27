import type { Group } from '../types'
import { Grip } from './Grip'

/** D：分组 tabs。 */
export function Groups({ groups, active, onSelect, onResize }: { groups: readonly Group[]; active: string; onSelect: (id: string) => void; onResize: (event: React.PointerEvent) => void }) {
  return (
    <div className="wb-groups">
      {groups.map(group => (
        <button key={group.id} className={group.id === active ? 'active' : ''} onClick={() => onSelect(group.id)}>{group.label}</button>
      ))}
      <Grip kind="v" onPointerDown={onResize} />
    </div>
  )
}
