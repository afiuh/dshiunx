# persona

**父级**：[智能体插件](./智能体插件.md)

## 负责什么

角色/人格：给系统提示加 prefix（`deployment:persona-prefix` 分区）。

## 相关源码

`packages/dsh-persona/src/index.ts`

## 配置项（`dsh-persona` 的 `Config`）

| 字段 | 默认 | 说明 |
|---|---|---|
| `prefix` | 必填 | persona 文本（模板，`{{variable}}` 严格插值） |
| `complete` | `false` | 设为 true 时，prefix 成为完整系统提示（抑制 suffix 和其他分区） |
| `includeRuntimeContext` | `true` | 是否包含 runtime context |

## 决策

1. 角色属于配置/插件层（历史决策）
2. base 的 `personaPrefix: ''`（默认，无角色）
3. minimal preset 的 persona：`prefix: 'You are a helpful software engineer assistant.'`、`complete: true`、`includeRuntimeContext: false`
4. 换角色 = 改配置或加 persona 插件

## 边界

| | persona | system-prompt |
|---|---|---|
| 管什么 | 角色文本 | 提示拼装 |
| 配置 | `prefix` / `complete` | `personaPrefix` / 分区 |

## 硬约束

- `prefix` 是模板：`{{variable}}` 严格插值（未定义变量报错）
- `complete: true` 时，prefix 成为完整系统提示
