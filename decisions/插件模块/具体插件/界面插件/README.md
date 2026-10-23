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

## 检查状态

- 来源 dsh-TUI（代码水平不高，参考功能不参考结构）
- 解耦后仍有残留：14 个空回调、ChatStore 字段缺失、`AnyMessageList as any`
