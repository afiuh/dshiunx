# partialReload

**父级**：[热更新](../热更新.md)

## 为什么需要

重载单个插件，不重启进程。

## 准备怎么实现

### 宏观想法

重载单个插件 = **清缓存 → 重新 import → 重建 fiber**。不清缓存会拿到旧模块；不重建 fiber 会留旧实例。

```
清 loadCache/require.cache → loader.import(入口) → registry.delete(旧) → 新 plugin 重建 fiber
```

**为什么清两层缓存**：ESM 和 CJS 是两套缓存，只清一个会漏。

### 细节实现

1. **清两层缓存**（`hmr/src/index.ts:314-336`）：ESM `loadCache` + CJS `require.cache`；用 `Map.prototype.delete` 确保 Node 22/23/24 都完全移除——两种模块格式都要覆盖
2. **重新 import**：`loader.import` 插件入口——拿到新模块
3. **重建 fiber**：`registry.delete(plugin)` + 用新 plugin 重建（fiber 是生命周期单元）
4. **原子重载单元 = 插件入口**：深层依赖变更会回溯到入口
5. **状态**：fiber 重建；Service 实例状态不自动保留（模块级 HMR 的固有限制）
6. **配置对齐**：`base` 必须与 `root` 的 cwd 基准一致，否则 `resolve()` 拼错路径、`loadCache` 不命中
7. **配置文件变更**：`entries.yml` 修改会触发 loader 的 entry 更新（按 id 比较）；无 id 的条目每次读取生成新 id，会被视为删除 + 添加
8. **PENDING 诊断**：`ctx.registry.values()` 遍历 fiber，检查 `FiberState.PENDING`


## 参考什么

- 源码：`packages/cordis-plugin-hmr/src/index.ts` 的 `partialReload()`
- 内核：`cordis` 的 `registry.delete()` + `ctx.plugin()`

## 决策

1. 清 ESM `loadCache` + CJS `require.cache`（`hmr/src/index.ts:254`）
2. 重新 `loader.import` 插件入口
3. `registry.delete(plugin)` + 用新 plugin 重建 fiber
4. 原子重载单元 = 插件入口文件
5. 深层依赖变更会回溯到入口
6. 状态：fiber 重建；Service 实例状态不自动保留（模块级 HMR 的固有限制）
7. 配置对齐：`base` 必须与 `root` 的 cwd 基准一致，否则 `resolve()` 拼错路径、`loadCache` 不命中
8. 配置文件变更：`entries.yml` 修改会触发 loader 的 entry 更新（按 id 比较）；无 id 的条目每次读取生成新 id，会被视为删除 + 添加
9. PENDING 诊断：`ctx.registry.values()` 遍历 fiber，检查 `FiberState.PENDING`
