# system-prompt

**父级**：[智能体插件](./智能体插件.md)

## 宏观想法

系统提示拼装：persona / harness identity / runtime context / 项目指令。

```
personaPrefix → harness:identity → runtime:context → 工具指导
```

## 职责

系统提示拼装：persona / harness identity / runtime context / 项目指令。

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

## 决策

1. `personaPrefix: ''`（与 DSH 一致）
2. `includeHarnessIdentity: true`（默认）
3. `includeRuntimeContext: true`（默认）
4. `personaPrefix` 是模板：`{{variable}}` 严格插值

## 与 DSH 一致

- DSH 的 base：`personaPrefix: ''`
- 我们的显式 `true` 与 DSH 默认行为一致（`z.boolean().default(true)`）
