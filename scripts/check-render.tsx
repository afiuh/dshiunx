import { renderToString } from 'react-dom/server'
import { Workbench } from '../packages/web-kit/src/workbench/Workbench'

const groups = [{ id: 'a', label: '分组 A' }]
const itemsOf = () => [{ id: 'item-1', label: '条目 1' }]

try {
  const html = renderToString(
    <Workbench
      groups={groups}
      itemsOf={itemsOf}
      renderContent={item => <span>{item.label}</span>}
      renderActions={item => <span>{item.label}</span>}
    />,
  )
  console.log('OK', html.slice(0, 200))
} catch (error) {
  console.log('ERR', error instanceof Error ? error.stack : String(error))
}
