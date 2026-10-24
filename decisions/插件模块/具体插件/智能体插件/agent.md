# agent

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

Agent 的**实例管理**：创建、恢复、注册、查询、归属。它不推进对话——推进是 [agent-loop](./agent-loop/agent-loop.md) 的事。

## 准备怎么实现

### 宏观想法

```
ctx.agents（服务）
├── create / resume      ← 工厂（由 agent-loop 实现）
├── register / enter     ← 实例注册与上下文进入
└── get / list / roots   ← 查询
```

**为什么服务与循环分离**：服务管"有哪些 agent、谁拥有它"；循环管"一个 agent 怎么想"。分离后循环可替换（P6），服务契约不变。

### 细节实现

1. **工厂注入**：`setFactory(factory)` 注册工厂，返回取消函数；`dsh-agent-loop` 就是默认工厂
2. **创建**：`createAgent(ownerCtx, options)` → 工厂创建 → 注册 → 返回 handle
3. **恢复**：`resume(ownerCtx, options)` → 从持久化加载 Session → 工厂重建 Agent
4. **注册**：`register(agent)` 返回 effect，随 fiber 卸载自动注销
5. **进入**：`enter(agent, owner)` 设置当前发起者上下文
6. **查询**：`get(id)` / `isOwnedBy(id, owner)` / `list()` / `roots()`
7. **发起者**：`currentInitiator()` / `requireInitiator()` —— 谁发起了当前操作（用于权限与归属）

### 边界

| 本节点负责 | 不负责 |
|---|---|
| 实例的创建/恢复/注册/查询 | turn 怎么推进（agent-loop） |
| 归属与发起者 | 模型选择策略（agent-loop 的 step） |
| 工厂契约 | 工厂实现（agent-loop） |

### 验证

- 同一 Session 不会被注册成两个活 Agent
- 卸载 agent 时其子插件一起卸载（fiber 树）
- 换工厂（自定义循环）不改服务调用方

## 参考什么

- `packages/dsh-agent/src/index.ts`（`AgentService`）
- 相邻节点：[agent-loop](./agent-loop/agent-loop.md)（默认工厂）、[preset](./preset.md)（agent 的组合）
