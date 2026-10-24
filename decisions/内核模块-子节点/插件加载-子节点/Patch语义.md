# Patch 语义

**父级**：[插件加载](../插件加载.md)

## 为什么需要

多 bundle/patch 要叠加成最终配置——没有 patch，每个 bundle 要复制整个配置。

## 要做什么

多 bundle/patch 叠加成最终配置。

## 参考什么

- 源码：`packages/cordis-plugin-include/src/index.ts:57`（`applyEntryPatches`）

## 宏观想法

多 bundle/patch 叠加成最终配置（insert/覆盖/警告）。

```
patches → applyEntryPatches → 最终 entries
```

## 准备怎么实现

### 细节实现

1. `applyEntryPatches`（`include/src/index.ts:57`）支持 `insert`（插到 group 或根）
2. 按 id 覆盖字段
3. `name` 校验
4. 未匹配的 patch 只 warn，不中断
5. **`EntryOptions` 的 string 索引签名**：`[key: string]: any`，支持 patch 写入动态字段
