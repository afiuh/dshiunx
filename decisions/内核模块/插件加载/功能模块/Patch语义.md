# Patch 语义

**父级**：[插件加载](../插件加载.md)

## 要做什么

多 bundle/patch 叠加成最终配置。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/diff.ts`（`applyEntryPatches`）

## 决策

1. `applyEntryPatches`（`config/diff.ts`）支持 `insert`（插到 group 或根）
2. 按 id 覆盖字段
3. `name` 校验
4. 未匹配的 patch 只 warn，不中断
5. **`EntryOptions` 的 string 索引签名**：`[key: string]: any`，支持 patch 写入动态字段
