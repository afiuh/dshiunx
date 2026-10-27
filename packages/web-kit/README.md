# web-kit

四区 + 并行区的万能 Web 框架。**只提供容器和交互，不规定内容语义，不预设主题。**

## 快速开始

```tsx
import { Workbench } from '@dshiunx/web-kit'
import '@dshiunx/web-kit/src/styles/theme.css'
import '@dshiunx/web-kit/src/styles/layout.css'
import '@dshiunx/web-kit/src/styles/components.css'

const groups = [{ id: 'a', label: '分组 A' }]
const itemsOf = (group) => [{ id: 'i1', label: '条目 1' }]

<Workbench
  groups={groups}
  itemsOf={itemsOf}
  renderContent={item => <div>{item.label}</div>}
  renderActions={() => <input placeholder="操作…" />}
  renderPanel={item => <div>{item.label}</div>}
/>
```

## 五区

| 区 | 框架保证 | 应用放什么（不预设） |
|---|---|---|
| **D** | 顶部横条，高度可拖，可收起 | 分组 / 工具栏 / 标题 / 状态 |
| **C** | 左侧竖条，宽度可拖，可收起 | 列表 / 树 / 大纲 / 文件 |
| **A** | 主区，自适应 | 内容 / 设置 / 表单 / 编辑器（**可自带操作**） |
| **B** | 底部横条，高度可拖，可收起 | **需要区域的操作**：对话框 / 终端 / 输入 / 命令（可空） |
| **E** | 右侧并行区，**按需出现**（空则不渲染），宽度可拖，面板可分割 | 任何需要并排的东西 |

## 契约

| Prop | 说明 |
|---|---|
| `groups` | D 的分组数据 |
| `itemsOf(group)` | C 的条目（按分组返回） |
| `renderContent(item)` | A 的内容（可以自带操作） |
| `renderActions(item)` | B 的区域操作（可选；只读日志不放这里） |
| `renderPanel(item)` | E 的面板内容（可选，默认同 A） |
| `theme` | `'light'`（默认）/ `'dark'` |

## 交互

| 操作 | 行为 |
|---|---|
| 拖边界 | 调尺寸（D 高 / C 宽 / B 高 / E 宽 / 面板占比） |
| 拖 C 条目 → A 右侧 | 检测区出现 → 松开 → **E 出现** |
| 拖条目 → E | **新增面板** |
| 关面板 × | 面板消失；空了 → **E 消失** |
| 点边界圆钮 | 收起/展开（展开时箭头指向区域内部，收起时指向外部） |

## 主题（按情境现做）

框架**不提供预设主题**。默认是黑白极简（不丑）。要风格，改 `theme.css` 的变量：

```css
:root {
  --wb-bg / --wb-fg / --wb-line / --wb-muted / --wb-accent
  --wb-radius: 0px;      /* 0 极简 / 8 圆润 / 999 胶囊 */
  --wb-gap: 8px;         /* 间距基准（所有 padding/gap 按它算） */
  --wb-shadow: none;
  --wb-font / --wb-font-size / --wb-font-mono
  --wb-grip: 6px; --wb-edge: 16px; --wb-drop: 160px;
}
```

组件不硬编码视觉值——换风格只改变量，不碰组件。

## 注意事项

| # | 坑 | 正确做法 |
|---|---|---|
| 1 | **日志/输出放 B** | 错。B 只放"需要区域的操作"；只读的看放 A 或 E |
| 2 | **把 A 当纯展示** | 错。A 可以自带操作（设置页/表单） |
| 3 | **E 常驻** | 错。`panels.length > 0` 才渲染，空了自动消失 |
| 4 | **拖拽用 `v + dy`** | 错（累积）。用"起始值 + 增量" |
| 5 | **收起按钮消失** | CSS 排除类名要和实际 class 一致（`.wb-collapse-edge`） |
| 6 | **props 三处不一致** | 类型 / 解构 / 使用，改一处要三处同步 |
| 7 | **业务词写进框架** | `Workbench` 里不该出现"会话/笔记/文件" |
| 8 | **给框架预设主题** | 不要。主题按具体情境现做；不想做就用默认黑白 |

## 边界（框架不做的）

- 不规定内容语义（A 是设置还是对话，应用决定）
- 不规定 B 放什么（对话框 / 终端 / 空）
- 不规定 A/E 的关系（是否互换、是否共享选中）
- 暂不做：持久化、URL 状态、键盘导航、响应式、无障碍

## 结构

```
src/
├── types.ts                契约
├── hooks/
│   ├── useWorkbench.ts     数据状态
│   ├── useResize.ts        尺寸 + 拖拽
│   └── useDropTarget.ts    拖放
├── workbench/
│   ├── Workbench.tsx       组装
│   ├── Groups.tsx D / Index.tsx C / Content.tsx A / Actions.tsx B / Parallel.tsx E
│   ├── Panel.tsx F/G / DropZone.tsx / Grip.tsx / Arrow.tsx
└── styles/                 theme / layout / components
```
