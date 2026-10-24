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
5. **scope-only**（源码注释的核心约束）：`dsh-system-prompt` 自己拥有全局 persona 配置并无条件注册该 section，所以 persona row **只能在 agent preset / 子代理 scope 里挂载**——它遮蔽该 session 的部署 persona。
6. **全局挂载会 fail loud**：在全局 scope 挂 persona 会与 prompt registry 自己的注册碰撞并明确报错，不是静默覆盖。
7. **它为什么存在**：agent preset 不能挂载 prompt registry 本身；没有这个 row，preset 只能改 agent 的工具，永远改不了它的身份。
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
| 管什么 | **一个 scope 的角色文本** | 提示拼装与分区顺序 |
| 挂载位置 | agent preset / 子代理 scope（scope-only） | 全局（拥有全局 persona 配置） |
| 冲突 | 全局挂载 → fail loud | — |
| 配置 | `prefix` / `suffix` / `complete` / `includeRuntimeContext` | `personaPrefix` / 分区 |

## 硬约束

- `prefix` 是模板：`{{variable}}` 严格插值（未定义变量报错）
- `complete: true` 时，prefix 成为完整系统提示

## 验证

- 在 agent preset scope 挂 persona → 该 session 的 persona 被遮蔽，其他 session 不受影响
- 在全局 scope 挂 persona → 与 prompt registry 的注册碰撞，**明确报错**（fails loud）
- `prefix` 缺失 → schema 拒绝（`z.string().required()`，`src/index.ts:50`）
- `complete: true` → prefix 成为完整系统提示，抑制 suffix 与其他分区
- `prefix` 为空 → 渲染时丢弃该 section（与 registry 行为一致）

## 参考什么

`packages/dsh-persona/src/index.ts`
