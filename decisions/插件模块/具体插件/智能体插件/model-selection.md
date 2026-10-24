# model-selection

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

同一个 Agent 会在不同时刻用不同模型（切 provider、切 model、切 reasoning effort）。这些选择必须**持久化**——否则重启或恢复会话后，Agent 会悄悄退回默认模型。

而且"选了什么"和"实际用了什么"不是一回事：用户可能先切模型，但当前 step 已经带着旧选择进入了装配。

## 准备怎么实现

### 宏观想法

```
选择（model/selection 事件）→ 投影状态
                              ├── lastUsed：最近一次已记录的请求用了什么
                              └── pending：之后选的、还没被请求用上的
```

**为什么用投影而不是内存 ref**：
- 重启/恢复后选择要还在（投影从事件流重建）
- 多个消费者（界面、子代理、统计）要读同一份状态，不能各存一份

### 细节实现

1. **选择的三元组**：`provider`（路由）+ `model`（provider 自己的 id）+ `reasoningEffort?`（适配器语义）
2. **`lastUsed` 与 `pending`**：
   - `lastUsed`：最近一次**已记录的模型请求**实际使用的选择
   - `pending`：之后记录的选择，尚未被匹配的请求使用
   - 请求发生后若 `pending === lastUsed`，清空 `pending`
3. **默认 effort 不落盘**（关键）：适配器在请求时默认的 effort **不写进选择**——否则默认值会被"钉死"成显式选择，之后适配器改默认也不生效
4. **两种比较**：
   - `sameRoute(left, right)`：只比 `provider` + `model`，**忽略 effort**——判断"是不是同一条路由"
   - `sameModelSelection(left, right)`：比完整选择，**absent effort 视为独立值**——判断"是否真的变了"
5. **对外视图**：`{ lastUsed, next: pending ?? lastUsed }`——`next` 表示"下一个请求会用什么"
6. **事件来源**：`model/selection`（显式切换）与 `request/header`（请求实际使用的选择）

### 边界

| 本节点负责 | 不负责 |
|---|---|
| 选择的持久化与状态机 | 适配器怎么实现 effort（模型插件） |
| 选择的去重与路由比较 | 请求怎么组装（agent-loop） |
| 对外暴露 lastUsed / next | 切换的触发（用户 / 子代理工具 / 预设） |

### 验证

- 重启后 `lastUsed` 与 `pending` 与重启前一致
- 适配器默认 effort 不被写成显式选择
- 切到同 provider+model 但不同 effort → `sameRoute` 为真、`sameModelSelection` 为假
- 请求用上 pending 后，`next` 等于 `lastUsed`

## 参考什么

- 上游 rc.3：`packages/core/agent/src/model-selection.ts`（`ModelSelectionProjectionState` / `modelSelectionProjectionDefinition` / `sameRoute` / `sameModelSelection`）
- 我们的代码：`packages/dsh-agent/src/model-selection.ts`（rc.2 是内存 `ModelSelectionRef`，无投影）
- 相邻节点：[agent](./agent.md)（选择属于 Agent）、[agent-loop](./agent-loop/agent-loop.md)（每 step 解析选择并绑定适配器）
