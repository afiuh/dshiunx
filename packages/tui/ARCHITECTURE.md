# @dshiunx/tui 架构

> 参考 `pi-tui` 的布局，复用 `dsh-TUI` 的组件 + `useChatStore`。
> **不依赖** `dsh-TUI` 的 `Chat.tsx`（7158 行）。

## 分层

```
@dshiunx/tui
├── main-screen   布局：ScrollBox + MessageList + PromptInput + StatusLine
├── messages      消息列表（MessageList + 工具卡）
├── composer      输入（PromptInput）
├── status        状态栏（StatusLine）
├── overlays      弹窗（41 个，逐步补）
└── state         useChatStore（107 字段，已解耦）
```

## 数据流

```
channel（功能层，dsh-adapter/channel/ 70 模块）
    ↓
useChatStore（状态层，107 字段，Zustand）
    ↓
Tui（渲染层，main-screen）
    ├── MessageList（消息）
    ├── PromptInput（输入）
    └── StatusLine（状态栏）
```

## 状态（`useChatStore`）

| 类别 | 字段 |
|---|---|
| **消息/转录** | `channel.rows` / `timeline` / `expandedRows` / `streamViewToggledRows` / `selectionActive` / `selectedId` / `unseenCount` / `forceMountRowId` |
| **输入** | `helpOpen` / `historyFill` / `caretPreview` / `promptEditorOpen` |
| **状态栏** | `statusFields` / `statusEntries` / `statusViews` / `workingActivity` |
| **弹窗** | `overlay` / `approvalSnapshot` / `questionSnapshot` / `dialogSnapshot` / `settingsOpen` / `treeOpen` / ... |
| **侧栏** | `sidePanel` / `chatColumns` / `jobsPanelOpen` / ... |

## 动作（`useChatStore.getState()`）

```ts
const store = useChatStore.getState()
store.toggleHelp()
store.setExpandedRows(prev => ...)
store.setSelectionActive(true)
store.dispatchOverlay({ type: 'open', overlay: { kind: 'help' } })
```

## 复用

| 来源 | 内容 |
|---|---|
| **`tui-components`** | 197 个组件（`MessageList`/`PromptInput`/`ToolCard`/...） |
| **`dsh-tui/src/ui.js`** | `Box`/`Text`/`ScrollBox`/`useInput` |
| **`dsh-tui/src/screens/StatusLine.js`** | `StatusLine` |
| **`useChatStore`** | 107 个状态字段 |

## 不依赖

| 项 | 原因 |
|---|---|
| **`Chat.tsx`（7158 行）** | 单体，UI 逻辑 + 渲染耦合 |
| **`ChatView`（`tui-view`）** | 487 行，变量替换障碍 |

## 增减功能

### 加功能

1. **状态**：`useChatStore` 加字段（`chatStore.ts`）。
2. **动作**：`useChatStore.getState()` 加方法。
3. **渲染**：`Tui` 里加组件（`tui-components`）。
4. **命令**：`runCommand` 加 case（74 个命令）。

### 删功能

1. **渲染**：`Tui` 里删组件。
2. **状态**：`chatStore.ts` 删字段。
3. **命令**：`runCommand` 删 case。

## 当前进度

| 项 | 状态 |
|---|---|
| `Tui`（main-screen） | ✅ 最小版（52 行 → 已补 props） |
| `MessageList` | ✅ 完整 props |
| `PromptInput` | ✅ 完整 props |
| `StatusLine` | ✅ 完整 props |
| 74 个命令 | ❌ 未实现（`onRunCommand` 返回 `true`） |
| 41 个弹窗 | ❌ 未实现 |
| 18 个快捷键 | ❌ 未实现 |
