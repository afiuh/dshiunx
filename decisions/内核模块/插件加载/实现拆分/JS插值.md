# JS插值

**父级**：[插件加载](../插件加载.md)

## 为什么需要

配置里的 `!!js` 表达式求值。

## 准备怎么实现

### 宏观想法

`!!js` 表达式依赖 `ctx`（运行时上下文），**不能在解析时求值**——必须等条目激活、有 ctx 时再算。

```
YAML 解析 → { __jsExpr }（存表达式）→ 条目激活 → evaluate(ctx)
```

**为什么树载体跳过**：Group/Include 的 config 是**子条目的配置**，属于子条目自己的 fiber，不能在父层求值。

### 细节实现

1. **`internal/config` 钩子**（`loader/src/index.ts:107`）：对 entry 的 config 做 `!!js` 表达式插值（树载体 Group/Include 跳过）
2. **`!!js` 适用范围**：仅在 `config` 与 `disabled` 字段内有效——`config` 走 `internal/config` 钩子；`disabled` 在 `entry.ts:90-95` 求值
3. `disabled` 在每次挂载决策时基于 loader 上下文求值（`isJsExpr` + `evaluate`，`entry.ts:94-95`）
4. 其余元数据（`name`、`id`、`inject`）保持静态
5. **`!!js` 标签**：YAML schema 扩展（`tag:yaml.org,2002:js`，在 `include` 包），标量解析成 `{ __jsExpr }`（`isJsExpr`，`config/utils.ts:24`），由 loader 在条目激活时求值（`interpolate`，`:11-22`）

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/internal.ts`（`internal/config` 钩子）
