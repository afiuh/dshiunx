# JS 插值

**父级**：[插件加载](../插件加载.md)

## 要做什么

配置里的 `!!js` 表达式求值。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/internal.ts`（`internal/config` 钩子）

## 宏观想法

配置里的 !!js 表达式在条目激活时求值（树载体 Group/Include 跳过）。

```
YAML 解析 → __jsExpr → evaluate(ctx)
```

## 决策

1. **`internal/config` 钩子**（`loader/src/index.ts:107`）：对 entry 的 config 做 `!!js` 表达式插值（树载体 Group/Include 跳过）
2. **`!!js` 适用范围**：仅在 `config` 与 `disabled` 字段内有效
3. `disabled` 在每次挂载决策时基于 loader 上下文求值
4. 其余元数据（`name`、`id`、`inject`）保持静态
5. **`!!js` 标签**：YAML schema 扩展（`tag:yaml.org,2002:js`），标量解析成 `{ __jsExpr }`（`config/utils.ts:24`），由 loader 在条目激活时求值
