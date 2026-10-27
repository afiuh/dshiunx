import type { ReactNode } from 'react'
import type { Group } from '../types'
import { Grip } from './Grip'

/** D：分组 tabs。 */
export function Groups({ groups, active, onSelect, onResize, render }: { groups: readonly Group[]; active: string; onSelect: (id: string) => void; onResize: (event: React.PointerEvent) => void; render?: (props: { groups: readonly Group[]; active: string; onSelect: (id: string) => void }) => ReactNode }) {
  return (
    <div className="wb-groups">
      {render === undefined
        ? groups.map(group => (
            <button key={group.id} className={group.id === active ? 'active' : ''} onClick={() => onSelect(group.id)}>{group.label}</button>
          ))
        : render({ groups, active, onSelect })}
      <Grip kind="v" onPointerDown={onResize} />
    </div>
  )
}
