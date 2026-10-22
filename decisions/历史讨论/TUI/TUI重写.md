# TUI 重写：插件 + pi 习惯 + 不弹审批

**父战略**：[TUI](../README.md)

## 讨论链

1. 独立 app 定位不好——后面要做多插件信息整合，TUI 必须放在插件体系内部。
2. 参考 `dsh-TUI` + pi 的架构；使用习惯贴合 pi。
3. 用户：“不要把用户当巨婴”——不要乱七八糟弹审批。

## 决定

- TUI 是 Cordis 插件（`packages/tui`），不是独立 app
- `inject` 多个服务（agents/sessions/tools/jobs/goal/subagent/agentPresets），直接整合多插件信息
- 参考 `dsh-TUI` 的 `ViewEvent` 投影设计 + `ADAPTER.md` 边界规则
- 参考 pi 的交互：底部输入、流式输出、工具调用折叠、Ctrl+C 取消、`/` 命令
- 默认不弹审批
