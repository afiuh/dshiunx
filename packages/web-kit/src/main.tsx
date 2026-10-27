import { createRoot } from 'react-dom/client'
import type { WorkbenchState } from './types'
import { Workbench } from './workbench/Workbench'
import './styles/theme.css'
import './styles/layout.css'
import './styles/components.css'

const STORAGE_KEY = 'web-kit-demo'

/** demo 自己的持久化（框架不预设存储）。 */
function loadState(): Partial<WorkbenchState> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? undefined : JSON.parse(raw) as Partial<WorkbenchState>
  } catch {
    return undefined
  }
}

function saveState(state: WorkbenchState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* 隐私模式/配额满：忽略 */
  }
}

const groups = [
  { id: 'a', label: '分组 A' },
  { id: 'b', label: '分组 B' },
  { id: 'c', label: '分组 C' },
]
const itemsOf = () => [1, 2, 3, 4, 5].map(index => ({ id: `item-${index}`, label: `条目 ${index}` }))

createRoot(document.getElementById('root')!).render(
  <Workbench
    groups={groups}
    itemsOf={itemsOf}
    renderContent={item => <><h2>{item.label}</h2><p>内容区（占位）—— A 展示 C 里选中的条目</p></>}
    renderActions={() => <span>操作区（占位）—— 需要一块区域的交互：对话框 / 终端 / 输入框</span>}
    renderPanel={item => <span>并行内容（占位）—— {item.label}</span>}
    initialState={loadState()}
    onStateChange={saveState}
  />,
)
