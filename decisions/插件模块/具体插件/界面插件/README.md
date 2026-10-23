# 界面插件

**父级**：[具体插件](../README.md)

## 负责什么

TUI、LayoutTree、Web renderer。

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

## 检查状态

- 来源 dsh-TUI（代码水平不高，参考功能不参考结构）
- 解耦后仍有残留：14 个空回调、ChatStore 字段缺失、`AnyMessageList as any`
