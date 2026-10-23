# 智能体插件

**父级**：[具体插件](../README.md)

## 负责什么

智能体循环、提示词、preset、persona、agent-instructions。

## 相关源码

`packages/dsh-agent/src/`、`dsh-agent-loop/src/`、`dsh-system-prompt/src/`、`dsh-agent-preset/src/`、`dsh-agent-preset-registry/src/`、`dsh-persona/src/`、`dsh-agent-instructions/src/`

## 子文件

- [agent / agent-loop](./agent.md)
- [system-prompt](./system-prompt.md)
- [preset（四模式）](./preset.md)
- [persona](./persona.md)
- [agent-instructions](./agent-instructions.md)

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

## preset 完整对比（2026-10-23）

| preset | 我们 | DSH | 差异 |
|---|---:|---:|---|
| standard | 32 | 33 | 只缺 `tool-pwsh`（Arch 合理） |
| ptc | 33 | 34 | 只缺 `tool-pwsh` |
| minimal | 10 | 12 | 缺 `persistent-pwsh` / `terminal-pwsh`（Windows） |
| creator | 33 | 34 | 缺 `tool-pwsh`；我们叫 `preset-creator`（DSH 叫 `preset-cordis`） |

**结论**：preset 插件列表与 DSH 一致（除 Windows PowerShell 插件）。

## 硬约束

- 智能体插件不依赖界面（ui → agent 单向）
- preset 的插件列表由 `dsh-agent-preset` 的 `plugins` 字段决定
- `agent-preset-registry` 的 `default` 必须是已定义的 preset id

## 检查状态

- 包级别与 DSH 一致
- preset 配置：`tool-pwsh` 不装（Arch）、`tool-schedule` 已移到 standard/ptc/creator preset
