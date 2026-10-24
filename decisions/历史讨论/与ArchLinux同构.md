# AI 操作系统：与 Arch Linux 同构

**父战略**：[AI操作系统](./历史讨论.md)

## 讨论链

1. 插件机制可以无限嵌套 → 可以做更大功能量级的插件。
2. 网页 UI 和 TUI 的兼顾问题 → 不复刻网页 UI，复刻系统桌面管理器的平铺效果。
3. 收敛：和 Arch Linux 同构，慢慢构建一个和用户系统同构的等效小系统，核心是 AI。

## 同构映射

| Linux | dshiunx |
|---|---|
| 内核（调度/决策） | AI（agent/agent-loop） |
| 进程（session） | session |
| 文件系统（storage） | storage |
| 窗口（X11/Wayland） | ViewEvent + LayoutTree |
| 窗口管理器（Hyprland） | 平铺布局（TUI/Web 共享） |
| 应用（package） | plugin |
| shell（bash） | TUI/命令 |

## 核心洞察

- AI 不是“应用之一”，是**内核**
- TUI/Web 不是“两个 UI”，是**一个 LayoutTree + 两个 renderer**
- 唯一缺的是 `LayoutTree`（平铺布局）

## 风险与缓解

- 风险：范围膨胀、过早抽象、性能、AI 内核复杂度
- 缓解：先做 `LayoutTree` + TUI 平铺，验证抽象；Web 作为 renderer 后做
