# subagent

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

一个 Agent 不该独自干完所有事：调研、长任务、并行探索可以委派给子代理，父代理只收结果。

子代理也是 Agent——用同一套循环、同一套工具、同一套会话，只是多了一层"父子关系"。

## 准备怎么实现

### 宏观想法

```
父 Agent → 委派（工具调用）→ 子 Agent（新 Session）
                                  ├── 进程内 fork（继承父上下文）
                                  ├── 进程内 spawn（干净上下文）
                                  └── 进程外（子进程）
父 Agent ← 结算通知（结果 / 错误）← 子 Agent 结束
```

**为什么分形态而不是一种**：fork 适合"接着父的上下文继续"，spawn 适合"干净地做一件事"，进程外适合"重活/隔离"。形态是部署选择，不是能力差异。

### 细节实现

1. **运行时与形态分离**：`dsh-subagent` 提供目录、激活、生命周期、结算；`subagent-fork-in-process` / `subagent-spawn-in-process` 是形态实现
2. **目录与激活**：子代理在 catalog 中登记，激活时创建子 Session 与子 Agent；深度受限（`depth.ts`）
3. **模型选择（rc.3）**：
   - 委派时可指定可选 `provider` / `model` / `reasoning_effort`
   - 需要 provider 的 `agentOptions` 支持
   - **执行时强制 Session 策略**：没有授权时，显式选择只能落在**当前父路由**上
4. **授权记录**：Session 在第一次模型请求前追加"授权的子路由"（`AllowedModelRoute` / `ModelSelectionPolicy`）；缺失即限制为父路由
5. **模型发现工具**（rc.3）：`list_subagent_models` 只读列出调用方 Session 被授权的子模型；**默认关闭**，每个 scope 只能一个实例启用，卸载时移除发现
6. **结算通知**：子代理结束时通知父代理；若子代理最后一次记录的工具调用是"给父代理发消息"且之后没有新输入，**省略 closing text**（用说明代替），避免重复
7. **继承策略**：`parentAgentOptionsForDelegation` 把父的可委派选项传给子（不是全部继承）

### 边界

| 本节点负责 | 不负责 |
|---|---|
| 子代理的目录、激活、生命周期 | 子代理怎么思考（agent-loop，共用） |
| 父子关系与结算通知 | 模型协议（运行时基础/模型） |
| 子代理的模型授权与发现 | 工具执行（执行器） |
| 形态选择（fork / spawn / 进程外） | 会话存储（运行时基础/会话） |

### 验证

- 委派一个子代理，父代理收到结算通知且会话不串
- 未授权时指定其他模型被拒绝或退回父路由
- `list_subagent_models` 默认不出现；启用后只列授权路由
- 子代理结束时若最后一条是发给父的消息，不重复输出 closing text
- 删除形态实现，运行时仍能启动（只是少一种形态）

## 参考什么

- 上游 rc.3：`packages/subagent/subagent/src/`（结算通知）、`packages/subagent/tool-subagent/src/`（`list-models.ts` / `model-selection*.ts`）
- 我们的代码：`packages/dsh-subagent/src/`（22 个 ts：catalog / activation / child-agent / manager / projection / out-of-process）、`packages/dsh-tool-subagent/src/`、`packages/dsh-subagent-fork-in-process/`、`packages/dsh-subagent-spawn-in-process/`
- 相邻节点：[agent-loop](./agent-loop.md)（子代理共用循环）、[model-selection](./model-selection.md)（父路由）、[preset](./preset.md)（子代理的组合）
