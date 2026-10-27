import { useState } from 'react'

interface Panel { id: string; item: string }

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

/** 四区 + 按需并行区（E）工作台骨架。 */
export function Workbench() {
  const [groups] = useState(['分组 A', '分组 B', '分组 C'])
  const [activeGroup, setActiveGroup] = useState(0)
  const [items] = useState(['条目 1', '条目 2', '条目 3', '条目 4', '条目 5'])
  const [activeItem, setActiveItem] = useState(0)
  const [parallel, setParallel] = useState<Panel[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [dropActive, setDropActive] = useState(false)

  const [topH, setTopH] = useState(56)
  const [sideW, setSideW] = useState(220)
  const [bottomH, setBottomH] = useState(76)
  const [parallelW, setParallelW] = useState(320)

  const startDrag = (kind: 'top' | 'side' | 'bottom' | 'parallel', e: React.PointerEvent): void => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    // 起始尺寸固定，之后只按增量设置（避免累积/档位跳变）
    const start = kind === 'top' ? topH : kind === 'side' ? sideW : kind === 'bottom' ? bottomH : parallelW
    const move = (ev: PointerEvent): void => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (kind === 'top') setTopH(clamp(start + dy, 40, 240))
      if (kind === 'side') setSideW(clamp(start + dx, 140, 480))
      if (kind === 'bottom') setBottomH(clamp(start - dy, 40, 360))
      if (kind === 'parallel') setParallelW(clamp(start - dx, 220, 720))
    }
    const up = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const openParallel = (item: string): void => {
    setParallel(prev => [...prev, { id: `p${Date.now()}`, item }])
  }

  const closeParallel = (id: string): void => {
    setParallel(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="wb">
      {/* D：分组（顶栏，E 左侧） */}
      <header className="wb-top" style={{ height: topH }}>
        <div className="wb-groups">
          {groups.map((group, index) => (
            <button key={group} className={index === activeGroup ? 'active' : ''} onClick={() => setActiveGroup(index)}>{group}</button>
          ))}
        </div>
        <div className="wb-status">status · 全局状态</div>
        <div className="wb-grip wb-grip-v" onPointerDown={e => startDrag('top', e)} />
      </header>

      <div className="wb-body">
        {/* C：分组的展开（索引） */}
        <aside className="wb-side" style={{ width: sideW }}>
          <div className="wb-side-title">{groups[activeGroup]}</div>
          {items.map((item, index) => (
            <div
              key={item}
              className={`wb-item ${index === activeItem ? 'active' : ''}`}
              draggable
              onDragStart={e => { setDragging(item); e.dataTransfer.setData('text/plain', item) }}
              onDragEnd={() => { setDragging(null); setDropActive(false) }}
              onClick={() => setActiveItem(index)}
            >
              <span>{item}</span>
              <button className="wb-open" title="在右侧打开（并行）" onClick={e => { e.stopPropagation(); openParallel(item) }}>→</button>
            </div>
          ))}
          <div className="wb-grip wb-grip-h" onPointerDown={e => startDrag('side', e)} />
        </aside>

        {/* A + B：内容 + 操作 */}
        <main className="wb-main">
          {/* A 右侧检测区：拖拽经过时出现，松开即并行打开 */}
          {dragging !== null && parallel.length === 0 && (
            <div
              className={`wb-drop ${dropActive ? 'active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDropActive(true) }}
              onDragLeave={() => setDropActive(false)}
              onDrop={e => {
                e.preventDefault()
                setDropActive(false)
                setDragging(null)
                const item = e.dataTransfer.getData('text/plain')
                if (item !== '') openParallel(item)
              }}
            >
              <span>松开 → 并行打开</span>
            </div>
          )}
          <section className="wb-content">
            <h2>{items[activeItem]}</h2>
            <p>内容区（占位）—— A 展示 C 里选中的条目</p>
          </section>
          <footer className="wb-actions" style={{ height: bottomH }}>
            <div className="wb-grip wb-grip-top" onPointerDown={e => startDrag('bottom', e)} />
            <div>操作区：{items[activeItem]}（占位）—— B 对 A 操作</div>
          </footer>
        </main>

        {/* E：按需并行区（空则不渲染） */}
        {parallel.length > 0 && (
          <section
            className={`wb-parallel ${dropActive ? 'active' : ''}`}
            style={{ width: parallelW }}
            onDragOver={e => { e.preventDefault(); setDropActive(true) }}
            onDragLeave={() => setDropActive(false)}
            onDrop={e => {
              e.preventDefault()
              setDropActive(false)
              setDragging(null)
              const item = e.dataTransfer.getData('text/plain')
              if (item !== '') openParallel(item)
            }}
          >
            <div className="wb-grip wb-grip-left" onPointerDown={e => startDrag('parallel', e)} />
            {parallel.map(panel => (
              <div className="wb-panel" key={panel.id}>
                <div className="wb-panel-head">
                  <span>{panel.item}</span>
                  <button onClick={() => closeParallel(panel.id)}>×</button>
                </div>
                <div className="wb-panel-body">并行内容（占位）—— 同时操作多个</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
