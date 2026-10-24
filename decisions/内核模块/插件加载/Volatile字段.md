# Volatile字段

**父级**：[插件加载](./插件加载.md)

## 为什么需要

配置变化时，不重挂插件（只更新引用）。

## 准备怎么实现

### 宏观想法

有些配置（如 `maxParallelToolCalls`）变化**不需要重挂插件**——重挂会丢状态/重建 fiber。所以用 `.volatile()` 标记，变化时只更新引用。

```
配置 diff → 只有 volatile 变？ → updateVolatile + emit（不重挂）
          → 普通值也变？       → 走普通更新（重挂）
```

**为什么这样**：重挂的代价是状态丢失 + fiber 重建；volatile 只换引用，代价小。

### 细节实现

1. `.volatile()` 标记的字段，变化时更新稳定引用、**不重挂插件**（`_commitVolatile`，`entry.ts:166`）
2. 通过 `.get()` 读取
3. 变化经 `loader/volatile-update` 事件通知（参数是变化路径）
4. loader 比较配置时忽略 volatile 字段（`equalExceptVolatile`，`entry.ts:148`）
5. **`_commitVolatile` 细节**（`entry.ts:166-199`）：用 `resolveConfig`（`:173`）验证候选；普通值也变 → 返回 false 走普通更新；只 volatile 变 → `updateVolatile`（`:188`）+ emit `loader/volatile-update`（`:192`）；无效候选只 warn；监听器异常只 warn

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/entry.ts:166`（`_commitVolatile`）
