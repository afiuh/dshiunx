# Loader与EntryTree

**父级**：[插件加载](./插件加载.md)

## 为什么需要

Loader 拥有 entry 树 + 持久化钩子。

## 准备怎么实现

### 宏观想法

Loader 需要 entry 树 + 配置写回，但**持久化方式不同**（Loader 是内存，Include 是文件）。所以 EntryTree 是抽象类（树操作通用），`write()` 由子类实现。

```
EntryTree（抽象：树操作 create/update/remove）
  ├── Loader（内存，write 是 no-op）
  └── Include（文件，write 原子写回）
```

**为什么这样**：树操作（`create`/`remove`/`update`/`resolve`）对所有载体都一样，只有"写回"不同——抽象类避免重复，子类只管持久化。

### 细节实现

1. **Loader 是 EntryTree 的子类**：拥有 entry 树 + 持久化钩子（`write()` 由子类实现）
2. **树操作**（`tree.ts:76-100`）：
   - `create(options, parent = null, position = Infinity)` → `group.tree.write()`
   - `remove(id)` → `entry.parent.tree.write()`
   - `update(id, options, parent?, position?)`（`tree.ts:91-105`）→ 可选移动 group（`unlink` + `splice` + `entry.parent = target`）→ `entry.update(options, false, true)`
3. **`resolve(id)`**（`tree.ts:61`）：按 `:` 分段（`EntryTree.sep = ':'`）逐层下降，找不到抛错
4. **`locate(fiber)`**（`index.ts:190`）：找 fiber 所属的 entry id
5. **`exit()`**（`index.ts:200`）：宿主钩子，用于全量重启（HMR 的 external 变更）
6. **`getTasks()` / `await()`**（`tree.ts:39/47`）：收集 entry 的 `_initTask` 和 `fiber.inertia`，等所有任务完成

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/index.ts:77`（`class Loader extends EntryTree`）
- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`
