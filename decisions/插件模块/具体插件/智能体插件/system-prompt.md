# system-prompt

**父级**：[智能体插件](./README.md)

## 职责

系统提示拼装：persona / harness identity / runtime context / 项目指令。

## 决策

1. `personaPrefix: ''`（与 DSH 一致）
2. `includeHarnessIdentity: true`（默认）
3. `includeRuntimeContext: true`（默认）

## 与 DSH 一致

- DSH 的 base 配置：`personaPrefix: ''`
- 我们的显式 `true` 与 DSH 默认行为一致（`z.boolean().default(true)`）
