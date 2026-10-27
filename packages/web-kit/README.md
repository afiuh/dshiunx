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
| **A** | 主区，自适应，**免疫关闭**（永远存在，没有收起/关闭） | 内容 / 设置 / 表单 / 编辑器（**可自带操作**） |
| **B** | 底部横条，高度可拖，可收起 | **需要区域的操作**：对话框 / 终端 / 输入 / 命令（可空） |
| **E** | 右侧并行区，**按需出现**（空则不渲染），宽度可拖，面板可分割 | 任何需要并排的东西 |

## 契约

**区域是边界，内容是渲染函数。** 五个区各有默认渲染，都可以被 render 函数覆盖。

| Prop | 说明 |
|---|---|
| `groups` | D 的分组数据 |
| `itemsOf(group)` | C 的条目（按分组返回） |
| `renderGroups?({ groups, active, onSelect })` | D 的内容（默认 tabs；可换树/下拉） |
| `renderItems?({ items, active, onSelect, onOpen, dragHandlers })` | C 的内容（默认列表；可换树/网格，拖拽用 `dragHandlers`） |
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

## 快捷键（行为解耦）

除拖动外，所有行为都走 `run(name, payload)`——组件点击和快捷键共用同一套。

### 行为表

| 行为 | 点击 | 快捷键（默认） |
|---|---|---|
| `toggle-top` / `toggle-side` / `toggle-bottom` | 边界圆钮 | 按焦点 Alt+A |
| `open-parallel` | 条目 `→` / 拖到检测区 | — |
| `close-parallel` | 面板 `×` | — |
| `select-group` / `select-item` | 点击 | — |
| `close-window` | — | **Alt+A**（按焦点） |

### 焦点

**鼠标在哪个区，哪个区就是焦点。**

| 焦点 | Alt+A（`close-window`） |
|---|---|
| D（`top`） | 收起/展开 D |
| C（`side`） | 收起/展开 C |
| A（`content`） | **无操作（免疫）** |
| B（`actions`） | 收起/展开 B |
| E（`parallel`） | 关闭最后一个面板 |

### 快捷键映射

默认在 `src/keybindings.ts`（空，只有 `alt+a` 测试）：

```ts
export const KEYBINDINGS = {
  'alt+a': 'close-window',
}
```

应用可按情境覆盖（`WorkbenchProps.keybindings`）：

```tsx
<Workbench
  keybindings={{
    'alt+a': 'close-window',
    'ctrl+k': 'open-parallel',
    'escape': 'close-window',
  }}
/>
```

组合键格式：`ctrl+shift+k` / `meta+w` / `escape` / 单键 `j`。

**行为是框架的，快捷键是应用的。**

## 状态（最轻）

母体只做两件事：

| 时机 | 行为 |
|---|---|
| 首次渲染 | 接受 `initialState`（sizes / collapsed / parallel id 列表） |
| 关闭/刷新前 | `onStateChange(state)` 回调**一次** |

**不预设**：不碰 localStorage、不 debounce、不存选中（分组/条目）、不做版本迁移。

```tsx
<Workbench
  initialState={saved}                    // 应用从哪读都行
  onStateChange={state => save(state)}    // 应用存哪都行
/>
```

**具体要用的时候按应用需求分析**：存哪（localStorage / 后端 / URL）、存什么（要不要选中）、要不要迁移——都是应用的事。

### 已知坑（2026-10-28）

- **测试方法**：写 localStorage 后直接刷新，`beforeunload` 会先触发 `onStateChange`，用页面内存里的**旧状态**覆盖刚写的值。验证持久化要**新开标签页**，或先关页面再打开。
- **`saveState` 的时机**：任何 `beforeunload` 都会写（包括用户没改过布局时）。如果需要"只在变化后写"，由应用加 dirty 标记，框架不做。

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
| 0 | **把区域当内容** | 错。区域是边界（框架固定），内容是渲染函数（应用提供） |
| 1 | **日志/输出放 B** | 错。B 只放"需要区域的操作"；只读的看放 A 或 E |
| 2 | **把 A 当纯展示** | 错。A 可以自带操作（设置页/表单） |
| 3 | **E 常驻** | 错。`panels.length > 0` 才渲染，空了自动消失 |
| 4 | **拖拽用 `v + dy`** | 错（累积）。用"起始值 + 增量" |
| 5 | **收起按钮消失** | CSS 排除类名要和实际 class 一致（`.wb-collapse-edge`） |
| 6 | **props 三处不一致** | 类型 / 解构 / 使用，改一处要三处同步 |
| 7 | **业务词写进框架** | `Workbench` 里不该出现"会话/笔记/文件" |
| 8 | **给框架预设主题** | 不要。主题按具体情境现做；不想做就用默认黑白 |
| 9 | **把 `close-window` 当关浏览器** | 错。它是关 E 面板；焦点在 B/C/D 时收起；A 免疫 |
| 10 | **在 `wb-groups` 上挂焦点** | 错。D 的焦点是整个 `header`，不是 tabs 小块 |
| 11 | **测试持久化：写 localStorage → 刷新** | 错。刷新前的 `beforeunload` 会用**旧状态**覆盖刚写的值。正确验证：**新开标签页**，或先关页面再打开 |

## 边界（框架不做的）

- 不规定内容语义（A 是设置还是对话，应用决定）
- 不规定 B 放什么（对话框 / 终端 / 空）
- 不规定 A/E 的关系（是否互换、是否共享选中）
- 暂不做：持久化、URL 状态、键盘导航、响应式、无障碍

## 结构

```
src/
├── actions.ts              行为类型（ActionName / Payload）
├── keybindings.ts          快捷键映射（默认空 + alt+a）
├── types.ts                契约
├── hooks/
│   ├── useWorkbench.ts     数据状态
│   ├── useResize.ts        尺寸 + 拖拽
│   ├── useDropTarget.ts    拖放
│   ├── useActions.ts       行为实现（8 个 + 焦点分发）
│   └── useKeybindings.ts   keydown → 分发
├── workbench/
│   ├── Workbench.tsx       组装（87 行）
│   ├── Groups.tsx D / Index.tsx C / Content.tsx A / Actions.tsx B / Parallel.tsx E
│   ├── Panel.tsx F/G / DropZone.tsx / Grip.tsx / Arrow.tsx
└── styles/                 theme / layout / components
```
