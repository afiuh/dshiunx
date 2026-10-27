import { createRoot } from 'react-dom/client'
import { Workbench } from './workbench/Workbench'
import './styles/theme.css'
import './styles/layout.css'
import './styles/components.css'

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
    renderActions={item => <span>操作区（占位）—— 全局操作：对话框 / 命令 / 搜索（目标由应用决定）</span>}
    renderPanel={item => <span>并行内容（占位）—— {item.label}</span>}
  />,
)
