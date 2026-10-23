# TUI 插件

**父级**：[具体插件](../具体插件.md)

## 负责什么

TUI、LayoutTree、Web renderer。

## 相关源码

`packages/tui/src/`、`packages/tui-store/src/`、`packages/dsh-tui/src/`（参考，未启用）

## 决策

1. TUI 是插件（`@dshiunx/tui`），通过 `tui` group 挂载
2. 状态管理用 Zustand（`tui-store`），不放在 TUI 插件内
3. TUI 只读状态 + 渲染，不修改业务（边界）
4. `dsh-tui`（20 万行）是参考源码，不启用

## TUI 插件组设计（2026-10-21 用户定）

**用户原话**：
> “一切皆插件的理念是可以无限嵌套的，我们可以把这个 tui 解耦成插件组，然后插件之间怎么管理又能直接复用 dsh 的处理方案”

### 设计（7 个插件）

```
tui（group）
├── tui-protocol      # ViewEvent / 适配层（dsh-adapter）
├── tui-core          # 渲染引擎（ink）
├── tui-chat          # 对话/消息/工具卡
├── tui-status        # 状态栏/context/tps/cost
├── tui-input         # 编辑器/快捷键
├── tui-panels        # 侧栏/jobs/goal/todo
└── tui-themes        # 主题/颜色
```

### 管理方式（复用 DSH）

| 机制 | 作用 | TUI 怎么用 |
|---|---|---|
| `agent-preset` | `config.plugins` 是子插件列表 | `tui-preset` 列出 TUI 子插件 |
| `cordis:group` + `isolate` | 插件组 + 隔离 realm | `tui` group 隔离 TUI 的 service |
| `plugin-manager` | 安装/卸载插件 | 管理 TUI 插件组 |
| `agent-preset-registry` | 注册/选择 preset | 注册 `tui-standard` / `tui-minimal` |

### 务实步骤（不要一次全拆）

1. **第一步**：拆 3 个（`tui-protocol` / `tui-core` / `tui-chat`），验证机制
2. **第二步**：跑通后拆 `tui-status` / `tui-input` / `tui-panels`
3. **第三步**：用 `tui-preset` 管理（`tui-standard` / `tui-minimal`）

### 实际结构（`bundles/tui/cordis.patch.yml`）

```yaml
- id: tui
  name: cordis:group
  config:
  - tui-protocol
  - tui-status
  - tui-core（@dshiunx/tui/plugins/core）
  - tui-commands
  - tui-overlays
  - tui-keyboard
  - cordis-plugin-hmr
```

**与设计的差异**：设计有 `tui-chat` / `tui-input` / `tui-panels` / `tui-themes`；实际有 `tui-commands` / `tui-overlays` / `tui-keyboard`（按功能拆，不是按设计拆）。

## D46 · 使用体验战略：TUI 优先 + 呈现解耦（2026-10-21 用户定）

**用户原话要点**：
1. 功能都有了，接下来打磨**使用体验**
2. 先做**最精简的 TUI 入口**（跟 pi 一样），所有功能都能在 TUI 里实现
3. 网页 UI 有清晰优势（DeepSeek 的数据/日志呈现）
4. 把**渲染/呈现类全部解耦**，信息流参考 Linux 系统（数据放文件里，和呈现渲染解耦）
5. 把 TUI 和网页渲染结合（两者优势都拿到）

**结论（修正）**：
- TUI **只是界面的一种**（和 Web renderer 并列，L3 插件）
- 选择先做 TUI，是因为**界面最好做**（工程顺序），不是战略优先
- 渲染/呈现是独立插件（L3，可替换 TUI/Web）——这是架构原则（P4 同构），不是“TUI 优先”的理由
- 信息流参考 Linux：数据放文件，和呈现解耦（P4）

## 历史决策（来自归档 05/06）

### D51 · TUI 解耦进展（2026-10-21）

- 5 个 store（`helpStore` / `modelsStore` / `overlayStore` / `selectionStore` / `timelineStore`）
- `Chat` 23 个 `useSyncExternalStore`
- 剩余 56 个 `useState`
- 已解耦插件：`tui-protocol` / `tui-chat` / `tui-status` + 6 个模块边界
- 下一步：组件库（118 个）、逻辑插件（6 个函数）、渲染插件（664 行）

### D52 · Chat.tsx 重写：功能统计（2026-10-21）

- 用户决定：重写 `Chat.tsx` 的 UI 逻辑（不复用 7162 行）
- 功能统计：74 命令 / 41 弹窗 / 18 快捷键 / 72 状态字段 / 12 `useState` / 35 `useEffect`

### D53 · 不拆 Chat，参考 pi-tui（2026-10-21）

- 用户决定：不拆 Chat，统计信息/功能，参考 pi-tui 实现
- 信息统计：73 个字段（消息/转录、输入、状态栏、侧栏）

### TUI 插件化（06 归档）

| 决策 | 内容 |
|---|---|
| **`tui-chat` 已解耦** | 用 `tuiChatProps` 构建 `Chat`（`channel` 从 `ctx.get('tuiChatProps').channel` 拿） |
| **插件化的本质** | **重写屏幕**（`ChatView` + 组件分层），不是“拆 `Chat`” |
| **`Chat` 是单体屏幕** | 从设计上就是单体——插件化需要**换架构**（屏幕 → 组件组合） |
| **已解耦插件** | `tui-protocol` / `tui-chat` / `tui-status` + 6 个模块边界 |

### 解耦结论

- TUI 从 `dsh-tui`（20 万行）拆出，**保留功能不保留结构**
- 当前：`packages/tui` 1076 行 + `tui-store` 248 行 + `tui-controller` 147 行
- 剩余：组件库 / 逻辑插件 / 渲染插件（待做）

## 边界

| | TUI 插件 | 智能体插件 |
|---|---|---|
| 管什么 | 渲染/输入 | 循环/提示词 |
| 依赖 | 只读 `tui-store` | 不依赖界面 |

## 硬约束

- TUI 不直接调用业务插件（只通过 `tui-store` / 事件）
- `dsh-tui` 不启用（参考源码）

## 包含

| 包 | 行数 | 职责 |
|---|---:|---|
| `tui` | 1076 | TUI 主插件 |
| `tui-protocol` | 4 | 协议 |
| `tui-status` | 10 | 状态栏 |
| `tui-store` | 248 | Zustand store |
| `tui-controller` | 147 | 控制器 |

## 遗留问题：Chat.tsx 的 import 路径不匹配（2026-10-23）

**现象**：LSP 查 `ChatRow` 的定义，停在 `Chat.tsx:29` 的 import 处，没跳到真正定义。

**原因**：
- `Chat.tsx:29` 的 import：`from '../dsh-adapter/channel.js'`
- 真正的定义：`packages/dsh-tui/src/adapter/ports/channel-view.ts:104`
- 路径不匹配（`dsh-adapter/channel.js` ≠ `adapter/ports/channel-view.ts`）——解耦遗留

**影响**：LSP 的定义跳转不完整（引用查询正常，找到 6 处）。

**待修**：修 `Chat.tsx` 的 import 路径，或补 re-export 文件（`dsh-adapter/channel.ts` 导出 `channel-view.ts` 的类型）。

## LSP 定义跳转行为（2026-10-23）

**“停在 import”是 TypeScript 标准行为**，不是工具 bug：

| 步骤 | 位置 |
|---|---|
| 在调用处查 definition | 返回最近的 import 语句 |
| 在 import 行再查 | 到 re-export（`index.ts`） |
| 再查 | 到源定义（`chatStore.ts`） |

VSCode 同样行为（Cmd+Click 第一次跳到 import）。

**测试方法**：在 import 行查 definition，才能跳到源定义。

**结论**：LSP 工具没问题；`tui-store/src/index.ts` 已改显式 re-export（`export { useChatStore, type ChatStore }`）。

## 待打磨清单（2026-10-23）

代码是早期写的（从 dsh-TUI 解耦），不是当前详细推敲的产物。已知问题：

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 1 | **14 个空回调** | `packages/tui/src/` | 事件/命令注册了但没实现（`() => {}`） |
| 2 | **ChatStore 字段缺失** | `packages/tui-store/src/chatStore.ts` | TUI 引用但 store 没有的字段（运行时 undefined） |
| 3 | **`AnyMessageList as any`** | `packages/tui/src/components/` | 类型逃逸（`as any`），失去类型检查 |
| 4 | **Chat.tsx import 路径不匹配** | `packages/dsh-tui/src/screens/Chat.tsx:29` | LSP 定义跳转受限（见遗留问题） |
| 5 | **`dsh-tui` 20 万行未启用** | `packages/dsh-tui/` | 参考源码，不维护 |

**打磨顺序**（按影响）：
1. ChatStore 字段缺失（运行时错误）
2. 14 个空回调（功能缺失）
3. `AnyMessageList as any`（类型安全）
4. Chat.tsx import 路径（LSP 体验）

## 检查状态

- 来源 dsh-TUI（代码水平不高，参考功能不参考结构）
- 解耦后仍有残留：见上方待打磨清单
