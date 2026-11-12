# Bash 工具

**父级**：[工具](../工具.md)

## 要做什么

给模型一个**按 agent 隔离的持久 Bash 会话**（同一 PTY 多次命令，保留 cwd/env），单命令有超时和输出上限。

## 为什么要做

每次命令新起 shell 会丢 cwd 和环境变量；持久会话更接近人的终端。按 agent 隔离则避免多个子代理互相污染。

## 怎么做

### 代码事实（2026-11-07 验证）

`packages/dsh-tool-bash-persistent/`（1 个源文件，485 行）：

- 工具名：`bash`
- 参数：`command`（必填，非空字符串）
- 输出：字符串（命令输出）
- 注入服务：`tools`、`terminals`、`workingDirectory`
- 执行：`serialized(owner, ...)` —— 同一 agent 的命令串行（避免 PTY 竞争）
- 中止：`exec.signal.aborted` 时返回空字符串（ToolRuntime 在结算后发布 ABORTED）
- 展示：`presentCall: { card: 'terminal', title: command }`

### Config（代码验证）

```ts
export interface Config {
  backendType?: string        // PTY 后端（默认 shell）
  timeoutMs?: number          // 单命令墙钟上限（默认 300000）
  maxOutputChars?: number     // 返回输出字符上限（默认 16000）
  description?: string        // 模型可见描述（部署可自定义）
}
```

装配（entries.yml）：

```yaml
- id: persistent-bash
  name: '@deepseek-ai/dsh-tool-bash-persistent'
  config:
    timeoutMs: 300000
```

### 与 DSH 的差异（代码验证）

`diff`：**源文件完全一致**（DSH `packages/shell/tool-bash-persistent/src` vs dshiunx）。

DSH 还有 `packages/shell/tool-bash`（一次性 Bash），dshiunx 未装配。

## 边界

- **不做命令白名单**（沙箱策略管）
- **不做输出截断以外的处理**（spill/pruner 管大输出）
- **不做跨 agent 共享**（owner-scoped）

## 如何验证自己做对了

- `cd /tmp` 后下一条命令仍在 /tmp
- 超时后进程被清理
- 两个 agent 的 Bash 互不影响
- `diff` DSH 与 dshiunx 的 `src` = 一致
- 人看：`execute` 是否只有"串行化 → 执行 → 返回输出"
