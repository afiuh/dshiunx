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

## 插件化检查（2026-10-23）

| 项 | 结果 |
|---|---|
| 8 个智能体包在 bundles 里 | ✅ 可插拔 |
| 内核不 import 智能体包 | ✅ 依赖边界干净 |
| `agent-instructions` 在 base + preset 重复 | ✅ 与 DSH 一致（DSH 也重复） |
| `agent-preset-registry` 在 base | ✅ 可插拔 |
| preset 的 `isolate` | ✅ 只隔离 planMode/compaction/toolResultPruner/workflowEngine |

**结论**：智能体模块插件化完备。

## 检查状态

- 包级别与 DSH 一致
- preset 配置：`tool-pwsh` 不装（Arch）、`tool-schedule` 已移到 standard/ptc/creator preset
