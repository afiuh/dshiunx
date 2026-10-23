# agent-browser 做成独立插件

**父战略**：[Web能力](../../历史讨论.md)

## 讨论链

1. 用户：“那看来他少的就是我们这个 agent-browser，后面可以把我们这个做成独立插件加进去吧”。
2. 收敛：封装成 dshiunx 插件，注册 `browser_*` 工具。

## 决定

- 注册 `browser_open` / `browser_click` / `browser_type` / `browser_snapshot` / `browser_screenshot` / `browser_eval`
- 内部通过 `ctx.subprocess` 调用 `agent-browser` CLI
- 系统提示：外部数据不可信、引用 URL
- 生命周期：按 session/agent 管理浏览器实例
- 权限：danger-full-access（无审批）

## 状态

待实施（当前先用 bash 调用 agent-browser）。
