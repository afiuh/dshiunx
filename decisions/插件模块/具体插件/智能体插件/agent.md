# agent / agent-loop

**父级**：[智能体插件](./智能体插件.md)

## 职责

| 包 | 职责 |
|---|---|
| `dsh-agent` | Agent 服务（`ctx.agent`）：创建/恢复/注册 agent |
| `dsh-agent-loop` | Agent 循环：turn 驱动、工具调用、config 启动 |

## 具体决策

### dsh-agent 服务接口

| 方法 | 作用 |
|---|---|
| `createAgent(ownerCtx, options)` | 创建 agent |
| `resume(ownerCtx, options)` | 恢复 agent |
| `currentInitiator()` / `requireInitiator()` | 当前发起者 |
| `setFactory(factory)` | 设置 agent 工厂（返回取消函数） |
| `register(agent)` | 注册 agent（返回 effect） |
| `enter(agent, owner)` | 进入 agent 上下文 |
| `get(id)` / `isOwnedBy(id, owner)` | 查询 |
| `list()` / `roots()` | 列表 / 根 agent |

### dsh-agent-loop

- 配置 `ConfiguredAgentIdentities`：launcher 在 Loader 挂载前 `ctx.provide('configuredAgentIdentities', ...)`，固定 configured agents 的 session 身份
- 事件 `agent-loop/config-start-failed`（`{ sessionId, error }`）：config 启动失败
- 每个 turn：接收用户消息 → 调用模型 → 执行工具 → 循环

### 配置（agent-loop）

| 字段 | 说明 |
|---|---|
| `maxParallelToolCalls` | 最大并行工具调用数 |
| `agents` | 启动时创建的 agent 列表（`id` / `sessionId?` / `cwd?` / `resumeSessionId?`） |

我们的配置：`bundles/base` 的 `agent-loop` 条目（无额外 config，用默认）。

## 与 DSH 一致

- 包 diff 无差异
