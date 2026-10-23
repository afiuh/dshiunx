# agent / agent-loop

**父级**：[智能体插件](./README.md)

## 职责

| 包 | 职责 |
|---|---|
| `dsh-agent` | Agent 服务（创建/销毁 agent） |
| `dsh-agent-loop` | Agent 循环（turn 驱动） |

## 决策

1. `agent` 是服务（`ctx.agent`），不是插件实例
2. `agent-loop` 是插件，通过 entries 挂载
3. agent 的工具集由 preset 决定（`agent-preset`）

## 与 DSH 一致

- 包 diff 无差异
