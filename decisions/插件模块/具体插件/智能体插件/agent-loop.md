# agent-loop

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

智能体"会想"的部分：一个 turn 里怎么调模型、怎么把工具结果喂回去、什么时候结束。

没有它，`dsh-agent` 只是一个实例注册表，不会推进对话。

## 准备怎么实现

### 宏观想法

```
用户消息 → turn 开始
  → 装配提示（system-prompt）→ 调模型（llm）
  → 模型要工具？→ ctx.tools.execute（执行器）→ 结果回灌
  → 模型不要工具？→ turn 结束
```

**关键边界：本节点不管工具怎么执行**。rc.3 把原 `tool-calls.ts`（调度：exclusive 屏障 / 并行池 / abort 合成结果）整体移到 `dsh-tools/batch.ts`——调度属于执行器，不属于循环。循环只负责"调用一次批执行，拿回结果"。

### 细节实现

1. **turn 驱动**：接收用户消息 → 装配请求 → 调模型 → 若返回工具调用则执行并回灌 → 直到模型给出最终回复或达到终止条件
2. **初始化与销毁**（rc.3 `initializeAgent`）：
   - 从"已获取的 Session"到"已发布的 Agent"的完整过程
   - **构造 scope 之前**注册 factory teardown 与调用方取消
   - 返回"初始化后的 Agent + 共享 disposer"
3. **失败语义**：初始化失败时排空清理，但**保留已存储的事件与 inbox 输入**——会话可恢复，不因一次启动失败丢历史
4. **step 准入**：每个 step 声明自己的工具集合（`toolSet`），turn 在该 step 结束后销毁它
5. **模型选择**：每个 step 解析请求配置（selection → adapter），在准入模型可见输入之前绑定适配器
6. **配置**：
   - `maxParallelToolCalls`：传给批执行的并发覆盖
   - `agents`：启动时创建的 agent 列表（`id` / `sessionId?` / `cwd?` / `resumeSessionId?`）
7. **configuredAgentIdentities**：launcher 在 Loader 挂载前 `provide`，固定 configured agents 的 session 身份
8. **失败事件**：`agent-loop/config-start-failed`（`{ sessionId, error }`）

### 边界

| 本节点负责 | 不负责 |
|---|---|
| turn 的推进与终止 | 工具怎么调度/并发（执行器） |
| 初始化/销毁的时序 | 提示词怎么装配（system-prompt） |
| 模型请求的组装与回灌 | 协议转换（llm 适配器） |
| step 级准入（toolSet） | 会话事件的定义（session） |

### 验证

- 一个 turn 内模型连续要 3 次工具，循环正确推进并最终结束
- 初始化失败后，已写入的 Session 事件仍在，inbox 输入不丢
- 替换执行器（原生 ↔ PTC）不改循环代码
- 循环不 import 具体工具

## 参考什么

- 上游 rc.3：`packages/core/agent-loop/src/index.ts`（`initializeAgent`）、`agent.ts`（step 准入/适配器绑定）
- 上游 rc.3 删除：`tool-calls.ts`（290 行）→ 职责移到 `packages/core/tools/src/batch.ts`
- 我们的代码：`packages/dsh-agent-loop/src/`（rc.2 仍有 `tool-calls.ts`，待第 2 步移除）
- 相邻节点：[agent](./agent.md)（实例管理）、[system-prompt](./system-prompt.md)（提示装配）
