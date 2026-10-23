# EntryTree

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 为什么需要

entry 的树形存储 + 路径解析。

## 准备怎么实现

### 宏观想法

entry 的树形存储 + 路径解析（`父:子` 逐层下降）。

```
entries[] → 树 → resolve("a:b:c")
```

### 细节实现

1. **EntryTree**（`tree.ts:7`）：entry 的树形存储 + 遍历（`entries` / `resolve` / `create` / `update` / `remove`）
2. `resolve(id)`（`tree.ts:61`）按 `:` 分段逐层下降
3. **Entry.id**：父 id 前缀拼接（`父:子`），保证树内唯一

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`
