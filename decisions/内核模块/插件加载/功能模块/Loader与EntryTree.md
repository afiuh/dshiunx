# Loader 与 EntryTree

**父级**：[插件加载](../插件加载.md)

## 要做什么

Loader 拥有 entry 树 + 持久化钩子。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/index.ts:77`（`class Loader extends EntryTree`）
- 源码：`packages/cordis-plugin-loader/src/config/tree.ts`

## 决策

1. **Loader 是 EntryTree 的子类**：拥有 entry 树 + 持久化钩子（`write()` 由子类实现）
2. **树操作**：`create` / `remove` / `update`，每次操作写回配置
3. **`locate(fiber)`**：找 fiber 所属的 entry id
4. **`exit()`**：宿主钩子，用于全量重启（HMR 的 external 变更）
