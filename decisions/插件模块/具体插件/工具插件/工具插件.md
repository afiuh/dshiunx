# 工具插件

**父级**：[具体插件](../README.md)

## 负责什么

给智能体用的工具：文件、Shell、网络、子代理、调度、工作流。

## 相关源码

`packages/dsh-tool-*/src/`、`packages/dsh-subagent*/src/`、`packages/dsh-subprocess*/src/`

## 包含（32 个）

| 类别 | 包 | 职责 |
|---|---|---|
| 文件 | `dsh-tool-fs` / `dsh-tool-fs-search` | 读写/搜索（edit 内置） |
| Shell | `dsh-tool-bash` / `dsh-tool-bash-persistent` / `terminal-bash` / `persistent-bash` | Shell 执行 |
| 网络 | `dsh-tool-web` / `dsh-web` / `web-search-deepseek` / `web-deepseek-api` / `web-fetch-http` | 搜索/抓取 |
| 子代理 | `dsh-subagent` / `subagent-spawn-in-process` / `subagent-fork-in-process` / `tool-subagent*` | 子代理 |
| 子进程 | `dsh-subprocess` / `dsh-subprocess-local` | 子进程 |
| 技能 | `dsh-skill` / `skill-filesystem` / `tool-skill` | 技能 |
| 调度 | `dsh-tool-schedule` | 调度 |
| 工作流 | `dsh-tool-workflow` / `workflow-ptc` / `ptc-runtime` | 工作流 |
| 目标 | `dsh-goal` / `goal-round-driver` / `tool-goal` / `command-goal` | 目标 |
| 待办 | `dsh-tool-todo` | 待办 |
| 其他 | `tool-ask-user` / `tool-working-directory` / `tool-cordis` / `tool-present` / `tool-call-timeout-policy` / `repeat-tool-reminder` | 辅助 |

## 与 DSH 的差异

| 缺失 | 原因 |
|---|---|
| `tool-pwsh` / `tool-pwsh-persistent` | Arch 不需要 Windows |
| `tool-lsp` | **已补**（`dsh-lsp` + `dsh-lsp-stdio` + `dsh-tool-lsp`） |
| `tool-str-replace-editor` | `tool-fs` 自带 edit |
| `subagent-acp` / `claude-code` / `codex` / `dsh-sdk` | 未来（其他 agent 适配器） |
| `skill-office` / `web-search-exa` / `web-search-perplexity` / `subprocess-ssh` | 可选 |

## 硬约束

- 工具只依赖服务（`ctx.fs` / `ctx.subprocess` / `ctx.lsp`），不直接 import 其他工具
- 工具注册到 `ctx.tools`，preset 决定可见性
