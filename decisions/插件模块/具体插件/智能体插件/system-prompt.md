# system-prompt

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

系统提示拼装：persona / harness identity / runtime context / 项目指令。

## 准备怎么实现

### 宏观想法

系统提示**拼装**：persona / harness identity / runtime context / 项目指令——分区，可单独开关。

```
personaPrefix → harness:identity → runtime:context → 工具指导
```

**为什么分区**：每部分可独立开关/覆盖（scoped section），不写死。

### 细节实现

1. `personaPrefix: ''`（与 DSH 一致）
2. `includeHarnessIdentity: true`（默认）
3. `includeRuntimeContext: true`（默认）
4. `personaPrefix` 是模板：`{{variable}}` 严格插值
## 边界

| 本节点管 | 不管 |
|---|---|
| 提示的**装配**：section / context / variable 的收集与排序 | 工具声明（执行器的 `describe()`，见 rc.3 收紧） |
| presentation waterfall 的执行 | 模型协议（运行时基础/模型） |
| 分区顺序（`SECTION_ORDERS` / `CONTEXT_ORDERS`） | 提示内容怎么写（persona / 项目指令） |
| 完整提示的强制（`complete` section） | 工具怎么执行（执行器） |

### rc.3 收紧：工具声明不进 waterfall

**变更**：`system-prompt/assemble` waterfall 从拿 `PromptAssembly` 改为拿 `PromptPresentation`。

| 类型 | 字段 | 谁能改 |
|---|---|---|
| `PromptPresentation` | `sections` / `contexts` / `variables` | **waterfall 监听者可以改**（提示文本的扩展点） |
| `PromptAssembly` | `PromptPresentation` + `tools` | `tools` **只由 provider 产出**，waterfall 改不了 |

**为什么**：工具声明归 provider（执行器的 `describe()`）所有。如果提示插件能在 waterfall 里改 `tools`，一个提示扩展就能悄悄篡改工具 schema——破坏"定义与执行分离"，也让工具可见性失去唯一来源。

**装配顺序**（rc.3 `assemble()`）：
```
收集 sections/contexts/variables → 跑 presentation waterfall
→ 单独计算 tools（orderTools，按 toolOrder + knownNames）
→ 合并成 PromptAssembly
```

**与执行器的分工**：

| 执行器产出 | 去向 |
|---|---|
| `sections` | 进提示装配（作为 section，可被 waterfall 改） |
| `describe()` 的 schemas / knownNames | 进 `PromptAssembly.tools`（**不进 waterfall**） |

## 配置项（`dsh-system-prompt` 的 `Config`，`src/index.ts:258`）

| 字段 | 默认 | 我们的配置 |
|---|---|---|
| `personaPrefix` | `''` | `''` |
| `personaSuffix` | `''` | 未设置（默认） |
| `includeHarnessIdentity` | `true` | `true`（显式） |
| `includeRuntimeContext` | `true` | `true`（显式） |
| `toolOrder` | `[]` | 未设置（默认） |

## 提示分区

| 分区 | 来源 |
|---|---|
| `deployment:persona-prefix` | `personaPrefix`（可被 scoped section 覆盖） |
| `harness:identity` | `includeHarnessIdentity` |
| `runtime:context` | `includeRuntimeContext` |
| `deployment:persona-suffix` | `personaSuffix` |


## 与 DSH 一致

- DSH 的 base：`personaPrefix: ''`
- 我们的显式 `true` 与 DSH 默认行为一致（`z.boolean().default(true)`）

## 验证

- 提示 waterfall 监听者改不到 `tools`（尝试改无效）
- 执行器的 `sections` 能被 waterfall 修改，`describe()` 的声明不能
- `orderTools` 按 `toolOrder` 排序，未列出的归 `<unlisted-tools>`

## 参考什么

- rc.3 变更：`packages/core/system-prompt/src/index.ts`（`PromptPresentation` / `PromptAssembly` 分离）
- 相邻节点：[agent-loop](./agent-loop/agent-loop.md)（每 step 装配一次）、[工具插件/执行器](../工具插件/执行器/执行器.md)（`sections` 与 `describe` 的分工）
