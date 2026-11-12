# Agent 循环

**父级**：[插件模块](../插件模块.md)

## 要做什么

提供 Agent 的接口、注册表、事件词汇，以及具体的循环实现——让"怎么思考、怎么调工具"成为可替换的插件。

## 为什么要做

Agent 循环是智能体的核心，但它不该是内核的一部分：不同的任务需要不同的循环（设计、施工、审查），循环应该能换。

> 用户（2026-11-07，DSH 表单讨论）：
> "智能体循环也可以有多个，根据具体任务做不同的智能体循环分配给不同的智能体实例。"

## 怎么做

### 代码事实（2026-11-07 验证）

| 包 | 职责 | 源码 |
|---|---|---|
| `dsh-agent` | Agent 接口、注册表、initiator scope、事件词汇 | `packages/dsh-agent/src/` |
| `dsh-agent-loop` | 具体循环：turn/step 边界、工具调用、流式、inbox | `src/agent.ts`、`tool-calls.ts`、`assistant-stream.ts`、`inbox.ts`、`runtime-context.ts`、`constants.ts`、`index.ts` |
| `dsh-agent-instructions` | 加载 `AGENTS.md` / `CLAUDE.md` | — |
| `dsh-commands` | 人类命令注册表 | — |

### 循环的内部（agent.ts 注释 + 代码）

```
turn（一轮用户请求）
  → step（一次模型调用）
    → 发请求（会话派生消息 + 工具 schema）
    → 模型返回（text / tool-call）
    → executeToolCalls（tool-calls.ts）
    → 结果写回 session
  → 下一 step（直到没有工具调用）
```

- 状态：`running`（含 abort、turn、step、wakeRequested）
- `cancel()` 是唯一的中止入口（abort signal）
- `inbox.ts`：step 边界接收新输入（steering / follow-up）
- `assistant-stream.ts`：把模型流式块转成会话事件

### 循环的边界

- 循环只负责"下一步做什么"，不负责"工具怎么执行"（`dsh-tools`）
- 循环不负责"上下文怎么压缩"（`compaction-*`）
- 循环不负责"模型怎么调"（`dsh-llm`）

### 多循环的路径

当前只有 `dsh-agent-loop` 一个实现。要支持多循环：
- 新增一个 `dsh-agent-loop-*` 包，实现同样的 Agent 接口
- 在 entries.yml 里按任务/角色选择
- 不需要改内核

## 边界

- **循环不持久化状态**：状态在 session 里
- **循环不做审批**：dshiunx 无审批
- **循环不预设模型**：provider/model 由 `dsh-llm` 和配置决定

## 如何验证自己做对了

- 换一个循环实现（比如"先规划再执行"），工具和会话不用改
- 删掉 `agent-instructions`，循环仍能跑（只是没有 AGENTS.md 上下文）
- `ls packages/dsh-agent-loop/src` 能看到 turn/step/tool-calls/inbox 的分离
- 人看：`agent.ts` 是否只做"请求 → 工具 → 结果"的循环
