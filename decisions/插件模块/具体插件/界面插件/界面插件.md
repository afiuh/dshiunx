# 界面插件

**父级**：[具体插件](../README.md)

## 负责什么

TUI、LayoutTree、Web renderer。

## 相关源码

`packages/tui/src/`、`packages/tui-store/src/`、`packages/dsh-tui/src/`（参考，未启用）

## 决策

1. TUI 是插件（`@dshiunx/tui`），通过 `tui` group 挂载
2. 状态管理用 Zustand（`tui-store`），不放在 TUI 插件内
3. TUI 只读状态 + 渲染，不修改业务（边界）
4. `dsh-tui`（20 万行）是参考源码，不启用

## 边界

| | 界面插件 | 智能体插件 |
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

## 检查状态

- 来源 dsh-TUI（代码水平不高，参考功能不参考结构）
- 解耦后仍有残留：14 个空回调、ChatStore 字段缺失、`AnyMessageList as any`
