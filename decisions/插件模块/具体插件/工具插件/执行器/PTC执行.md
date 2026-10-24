# PTC执行

**父级**：[执行器](./执行器.md)

## 为什么需要

模型一次只能"调用一个工具"时，复杂任务要几十轮往返。PTC（Programmatic Tool Calling）让模型**写一段程序**，程序里调用多个工具——一轮完成多步。

代价：模型看到的工具形态变了（不是工具定义，而是一个 `run_code` + SDK 文档）。

## 准备怎么实现

### 宏观想法

```
模型 → run_code(程序)
         ├─ 程序内调用 SDK（每个工具一个函数）
         ├─ 每次子调用走同一套 pipeline（策略/取消/结算）
         └─ 只有最外层结果进入模型历史
```

**为什么只暴露 `run_code`**：程序是唯一入口，工具调用发生在程序内部——模型不需要（也不能）直接调工具。这样"工具编排"由模型写的代码完成，而不是靠多轮对话。

**为什么子调用仍走 pipeline**：PTC 不是绕过策略的后门。审批、取消、结果校验对子调用同样生效。

### 细节实现

1. **工具描述形态**：`describe` 只返回 `run_code` 的 schema，并把 `knownNames` 设为 `[run_code]`（用于校验调用顺序）
2. **两段系统提示**（`sections`）：
   - `tools:ptc`：`run_code` 是唯一可直接调用的工具，其他工具必须在程序内调用
   - `tools:sdk`：由当前可见工具生成的 SDK 文档（`interpolate: false`，TS / Python 两种语言形态）
3. **嵌套执行**：程序内每次调用是"子调用"，并发上限 `maxParallelSubCalls` 默认 10，与根调用上限独立
4. **同一套调度**：PTC 的批执行复用 `executeToolBatch`（与原生执行同一份调度/取消/结算逻辑），不是另写一套
5. **查找覆盖**：执行器通过 `ToolExecutionSource` 的 `get`/`reject` 改写 lookup——`run_code` 走 PTC 传输，其他工具只能通过 `tools.executable` 在嵌套时可见；非嵌套直接调其他工具被拒绝并提示"从程序内调用"
6. **日志重建**：每个子调用记录为 dispatch 日志，供会话回放与调试；只有外层结果进入模型上下文
7. **运行时模式**：`executionMode: 'per-call' | 'persistent-in-memory'`，默认 `per-call`；持久模式为每个 owner 保留一个 REPL，且 `programFormat` 从 `function-body` 变为 `repl`（影响 SDK 形态）
8. **资源限制**：超时（默认 elapsed deadline）、输出字节、V8 堆上限、消息字节、待处理调用数、终止宽限，均由运行时配置

### 边界

| 情况 | 行为 |
|---|---|
| 程序内调用不存在的工具 | 子调用返回结构化错误，程序可捕获 |
| 程序超时 | 运行时终止，外层返回超时错误 |
| 程序内工具需要审批 | 子调用触发同一审批通道 |
| 程序输出过大 | 只保留外层结果；子调用结果按策略裁剪 |

### 验证

- 同一工具集，PTC 下模型只需一次 `run_code` 完成多工具任务
- 程序内调用的工具与原生执行下行为一致（同一 pipeline）
- 取消 `run_code` 会终止运行时及其子进程

## 参考什么

- 上游：`packages/core/tool-executor-ptc/src/`（`index.ts` / `ptc.ts` / `py-types.ts` / `ts-types.ts`）
- 上游：`packages/ptc-runtime/ptc-runtime-node/`（运行时：进程 / 持久进程 / RPC）
- 上游：`packages/core/tools/src/ptc.ts`（rc.2 的合体实现，待拆分）
