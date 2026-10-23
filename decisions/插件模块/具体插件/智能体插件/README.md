# 智能体插件

**父级**：[具体插件](../README.md)

## 负责什么

智能体循环、提示词、preset、persona、agent-instructions。

## 包含

| 包 | 职责 |
|---|---|
| `dsh-agent` | Agent 服务 |
| `dsh-agent-loop` | Agent 循环 |
| `dsh-system-prompt` | 系统提示 |
| `dsh-agent-preset` | preset |
| `dsh-agent-preset-registry` | preset 注册表 |
| `dsh-persona` | persona |
| `dsh-agent-instructions` | 项目指令 |
| `dsh-agent-default-model` | 默认模型 |

## 检查状态

- 包级别与 DSH 一致
- preset 配置：`tool-pwsh` 不装（Arch）、`tool-schedule` 已移到 standard/ptc/creator preset
