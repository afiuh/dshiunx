# web-kit（Web 前端母体）

**父级**：[具体插件](../具体插件.md)

> **同级插件**：不属于任何业务（维叶莎只是使用者之一）。

## 为什么存在

后面所有 Web 前端插件（维叶莎 / 未来的管理台、监控、编辑器…）都按同一套结构做。没有母体，每个插件重写布局 + 拖拽 + 收起，必然分裂。

## 五区（区域 = 边界，不是内容）

| 区 | 框架保证（边界） | 应用放什么（内容，不预设） |
|---|---|---|
| **D** | 顶部横条，高度可拖，可收起 | 分组 / 工具栏 / 标题 / 状态 |
| **C** | 左侧竖条，宽度可拖，可收起 | 列表 / 树 / 大纲 / 文件 |
| **A** | 主区，自适应，**免疫关闭** | 内容 / 设置 / 表单 / 编辑器（可自带操作） |
| **B** | 底部横条，高度可拖，可收起 | **需要区域的操作**：对话框 / 终端 / 输入（可空） |
| **E** | 右侧并行区，**按需出现**（空则不渲染），宽度可拖，面板可分割 | 任何需要并排的东西 |

## 交互

| 操作 | 行为 |
|---|---|
| 拖边界 | 调尺寸（D 高 / C 宽 / B 高 / E 宽 / 面板占比） |
| 拖 C 条目 → A 右侧 | 检测区出现 → 松开 → E 出现 |
| 拖条目 → E | 新增面板 |
| 关面板 × | 面板消失；空了 → E 消失 |
| 点边界圆钮 | 收起/展开（展开时箭头指向区域内部，收起时指向外部） |

## 快捷键（行为解耦）

除拖动外，所有行为走 `run(name, payload)`——点击与快捷键共用。

| 行为 | 点击 | 快捷键（默认） |
|---|---|---|
| `toggle-top/side/bottom` | 边界圆钮 | 按焦点 Alt+A |
| `open-parallel` | 条目 `→` / 拖到检测区 | — |
| `close-parallel` | 面板 `×` | — |
| `select-group/select-item` | 点击 | — |
| `close-window` | — | **Alt+A**（按焦点） |

**焦点**：鼠标在哪个区，哪个区就是焦点。Alt+A 按焦点：E 关面板 / B/C/D 收起 / A 免疫。

**映射**：`src/keybindings.ts`（默认空 + `alt+a`），应用可覆盖（`WorkbenchProps.keybindings`）。

## 状态（最轻）

| 时机 | 行为 |
|---|---|
| 首次渲染 | `initialState`（sizes / collapsed / parallel id 列表）合并默认 |
| 关闭/刷新前 | `onStateChange(state)` 回调**一次** |

**不预设**：不碰 localStorage、不 debounce、不存选中、不做迁移。

## 主题（按情境现做）

不提供预设主题。默认黑白极简。15 个 CSS 变量（颜色 / 圆角 / 间距 / 字体 / 阴影 / 尺寸），组件不硬编码视觉值。

## 契约

```tsx
<Workbench
  groups={groups}                          // D 数据
  itemsOf={group => items}                 // C 数据
  renderGroups={({ groups, active, onSelect }) => ...}     // D 内容（默认 tabs）
  renderItems={({ items, active, onSelect, onOpen, dragHandlers }) => ...}  // C 内容（默认列表）
  renderContent={item => ...}              // A 内容
  renderActions={item => ...}              // B 内容（可选）
  renderPanel={item => ...}                // E 面板（可选，默认同 A）
  theme="light" | "dark"
  keybindings={{ 'alt+a': 'close-window' }}
  initialState={saved}
  onStateChange={state => save(state)}
/>
```

## 边界（框架不做）

- 不规定内容语义（A 是设置还是对话，应用决定）
- 不规定 B 放什么（对话框 / 终端 / 空）
- 不规定 A/E 关系（是否互换、是否共享选中）
- 不预设存储（localStorage / 后端 / URL 由应用定）
- 不预设主题（按情境现做）
- **不做移动端适配**（不是母体的职责）

## 坑（真实踩过）

| # | 坑 |
|---|---|
| 1 | 日志/输出放 B → 错。B 只放"需要区域的操作"；只读的看放 A 或 E |
| 2 | 把 A 当纯展示 → 错。A 可以自带操作 |
| 3 | E 常驻 → 错。`panels.length > 0` 才渲染 |
| 4 | 拖拽用 `v + dy` → 累积。用"起始值 + 增量" |
| 5 | 收起按钮消失 → CSS 排除类名要和实际 class 一致 |
| 6 | props 类型/解构/使用不一致 → 改一处要三处同步 |
| 7 | 业务词写进框架 → `Workbench` 里不该有"会话/笔记/文件" |
| 8 | 给框架预设主题 → 不要 |
| 9 | `close-window` 当关浏览器 → 错。关 E 面板；焦点在 B/C/D 收起；A 免疫 |
| 10 | D 的焦点挂 `wb-groups` → 错。是整个 `header` |
| 11 | 测试持久化"写 localStorage → 刷新" → `beforeunload` 用旧状态覆盖。要新开标签页 |

## 代码位置

- 包：`dshiunx/packages/web-kit/`
- 包名：`@dshiunx/web-kit`
- 形态：React 组件库（不是 Cordis 服务）
- 结构：`types` / `hooks`（7 个）/ `workbench`（10 个组件）/ `styles`（3 个）
- 每个文件 < 90 行；`Workbench.tsx` 88 行（只拼装）

## 状态（2026-10-28）

✅ 五区 + 拖拽 + 收起 + E 按需 + 焦点 + 快捷键 + 最轻状态 + 主题变量
✅ 解耦：7 hooks / 10 组件 / 3 样式，全部 < 90 行
✅ README + 注释 + 11 条坑

**母体不接后端**：它是骨架，demo 用假数据验证结构。具体应用 = 复制母体 → 按需改造（五区内容、render 函数、样式变量）→ 接自己的后端。
