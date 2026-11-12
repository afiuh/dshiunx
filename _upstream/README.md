# _upstream —— 远程能力包存档

> **不参与构建**。这里是"远程有、本地精简版没有"的能力包，先存档，后续按需重写或移植。

## 来源

- 仓库：`https://github.com/afiuh/dshiunx.git`（`origin/master`）
- 提交：`d54765c`（2026-11-07，628 个提交的完整开发史）
- 提取时间：2026-11-12
- 提取方式：`git archive origin/master packages/<name> | tar -x -C _upstream/`

## 为什么在这里

本地 `packages/` 是**精简复刻版**（110 包），远程是**完整开发史**（161 包）。差集里：

- **A 类（有意舍弃，未提取）**：`vendor/jarvis`（维叶莎）、`web-kit`、`dsh-api-session-controller`、`dsh-credentials-local`、`dsh-tool-ask-user`（审批）
- **B 类（复刻未做，已提取到本目录）**：49 个能力包（见下）

## 清单（49 个）

| 类别 | 包 |
|---|---|
| 智能体/预设 | `dsh-agent-default-model` `dsh-agent-preset` `dsh-agent-tool-presentation` `dsh-persona` |
| 插件管理 | `dsh-plugin-manager` `dsh-official-bundles` `dsh-host-plugin-inventory` `dsh-cordis-host-runner` `dsh-tool-cordis` |
| 工具执行 | `dsh-tool-bash` `dsh-tool-executor-native` `dsh-tool-executor-ptc` `dsh-bash-local` `dsh-native-command` |
| 沙箱 | `dsh-bash-sandbox` `dsh-fs-sandbox` `dsh-sandbox-local` `dsh-sandbox-windows-acl` |
| 任务/调度 | `dsh-jobs` `dsh-jobs-local` `dsh-tool-jobs` `dsh-schedule` `dsh-tool-schedule` `dsh-time-context` |
| MCP | `dsh-mcp-client` `dsh-mcp-resources` |
| 存储 | `dsh-storage` `dsh-storage-json` `dsh-session-query-sqlite` `dsh-deque` |
| 会话 | `dsh-session-title` `dsh-session-title-llm` `dsh-session-title-first-prompt-llm` `dshiunx-conversations` |
| Web | `dsh-web` `dsh-web-deepseek-api` `dsh-web-fetch-http` `dsh-web-search-deepseek` `dsh-tool-web` |
| 工作流 | `dsh-workflow` `dsh-workflow-ptc` `dsh-ptc-runtime-node` `dsh-tool-workflow` |
| 入口/配置 | `dsh-cmdline` `dsh-config-editor` `dsh-headless` `dx-shell` `dsh-attachment-local` |
| 展示 | `dsh-tool-present` |

## 怎么用

**不要直接复制进 `packages/`**——它们是旧版本（未去版本化、依赖 DSH 完整包集），直接放进去会破坏当前构建。

正确用法：

1. **读代码**：作为实现参考（比如 `dsh-plugin-manager` 怎么管理 bundle）
2. **移植**：按当前架构（同质插件、无版本元数据）重写
3. **确认不需要**：从本目录删除

## 维护

- 本目录不进 `pnpm-workspace.yaml`（只认 `packages/*`），不参与构建
- 后续本地实现某个包后，从 `_upstream/packages/` 删除对应目录
- 全部分类处理完后，删除整个 `_upstream/`
