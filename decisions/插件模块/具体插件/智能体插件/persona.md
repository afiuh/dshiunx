# persona

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

角色/人格：给系统提示加 prefix（`deployment:persona-prefix` 分区）。

## 准备怎么实现

### 宏观想法

角色/人格 = 给系统提示加 prefix（`deployment:persona-prefix` 分区）——**配置层**，不是内核。

```
prefix → system-prompt 分区
```

**为什么配置层**：换角色 = 改配置或加 persona 插件，不用改内核。

### 细节实现

1. 角色属于配置/插件层（历史决策）
2. base 的 `personaPrefix: ''`（默认，无角色）
3. minimal preset 的 persona：`prefix: 'You are a helpful software engineer assistant.'`、`complete: true`、`includeRuntimeContext: false`
4. 换角色 = 改配置或加 persona 插件
## 配置项（`dsh-persona` 的 `Config`，`src/index.ts:49`）

| 字段 | 默认 | 说明 |
|---|---|---|
| `prefix` | 必填 | persona 文本（模板，`{{variable}}` 严格插值） |
| `suffix` | `''` | persona 后缀（`deployment:persona-suffix` 分区） |
| `complete` | `false` | 设为 true 时，prefix 成为完整系统提示（抑制 suffix 和其他分区） |
| `includeRuntimeContext` | `true` | 是否包含 runtime context |


## 边界

| | persona | system-prompt |
|---|---|---|
| 管什么 | 角色文本 | 提示拼装 |
| 配置 | `prefix` / `complete` | `personaPrefix` / 分区 |

## 硬约束

- `prefix` 是模板：`{{variable}}` 严格插值（未定义变量报错）
- `complete: true` 时，prefix 成为完整系统提示

## 参考什么

`packages/dsh-persona/src/index.ts`
