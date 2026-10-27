/** 拖拽手柄（v=水平分隔/h=垂直分隔/top=B 上边/left=E 左边）。 */
export function Grip({ kind, onPointerDown }: { kind: 'v' | 'h' | 'top' | 'left'; onPointerDown: (event: React.PointerEvent) => void }) {
  return <div className={`wb-grip wb-grip-${kind}`} onPointerDown={onPointerDown} />
}
