# EntryTree

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 为什么需要

entry 的树形存储 + 路径解析。

## 准备怎么实现

### 宏观想法

entry 是**树**（父:子:孙），不是扁平列表——因为插件可以无限嵌套（P3）。`resolve("a:b:c")` 按 `:` 分段逐层下降。

```
entries[] → 树（store + subtree）→ resolve("a:b:c")
```

**为什么树**：扁平列表无法表达嵌套；树让 `父:子` 路径唯一。

### 细节实现

1. **EntryTree**（`tree.ts:7`）：entry 的树形存储 + 遍历（`entries` / `resolve` / `create` / `update` / `remove`）
2. `resolve(id)`（`tree.ts:61`）按 `:` 分段逐层下降
3. **Entry.id**：随机 id（`ensureId`，`tree.ts:57-63`，`Math.random().toString(16).slice(2,10)`），保证树内唯一；`resolve` 的 `:` 是**树路径**（`store[part].subtree`），不是 id 前缀

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`
