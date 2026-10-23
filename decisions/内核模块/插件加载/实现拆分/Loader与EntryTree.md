# Loader 与 EntryTree

**父级**：[插件加载](../插件加载.md)

## 要做什么

Loader 拥有 entry 树 + 持久化钩子。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/index.ts:77`（`class Loader extends EntryTree`）
- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`

## 宏观想法

Loader 是 EntryTree 的子类，拥有 entry 树 + 持久化钩子（`write()` 由子类实现）。

```
entry 树操作（create/update/remove）→ 写回配置
```

## 决策

1. **Loader 是 EntryTree 的子类**：拥有 entry 树 + 持久化钩子（`write()` 由子类实现）
2. **树操作**（`tree.ts:76-100`）：
   - `create(options, parent = null, position = Infinity)` → `group.tree.write()`
   - `remove(id)` → `entry.parent.tree.write()`
   - `update(id, options, parent?, position?)` → 更新 + 写回
3. **`resolve(id)`**（`tree.ts:61`）：按 `:` 分段（`EntryTree.sep = ':'`）逐层下降，找不到抛错
4. **`locate(fiber)`**（`index.ts:190`）：找 fiber 所属的 entry id
5. **`exit()`**（`index.ts:200`）：宿主钩子，用于全量重启（HMR 的 external 变更）
6. **`getTasks()` / `await()`**（`tree.ts:39/47`）：收集 entry 的 `_initTask` 和 `fiber.inertia`，等所有任务完成
