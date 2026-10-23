# EntryTree

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 要做什么

entry 的树形存储 + 路径解析。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`

## 决策

1. **EntryTree**：entry 的树形存储 + 遍历（`entries` / `resolve` / `create` / `update` / `remove`）
2. `resolve(id)` 按 `:` 分段逐层下降
3. **Entry.id**：父 id 前缀拼接（`父:子`），保证树内唯一
